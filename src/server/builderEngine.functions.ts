import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  type BuilderInput,
  type BuilderRoute,
  type Intention,
  type Mood,
  type Pace,
  type RegionRow,
  type RoutingRules,
  type StopRow,
  type Who,
  fallbackNarrative,
  generateRoute,
} from "./builderEngine.server";

const inputSchema = z.object({
  mood: z.enum(["slow", "curious", "romantic", "open", "energetic"]),
  who: z.enum(["couple", "family", "friends", "solo"]),
  intention: z.enum([
    "wine",
    "gastronomy",
    "nature",
    "heritage",
    "coast",
    "hidden",
    "wonder",
    "wellness",
  ]),
  regionKey: z.string().min(1).max(64).optional(),
  pace: z.enum(["relaxed", "balanced", "full"]).optional(),
  pinnedStopKeys: z.array(z.string().min(1).max(64)).max(8).optional(),
  excludedStopKeys: z.array(z.string().min(1).max(64)).max(20).optional(),
});

async function loadCatalog() {
  const [regionsRes, stopsRes, rulesRes] = await Promise.all([
    supabaseAdmin
      .from("builder_regions")
      .select("key,label,blurb,lat,lng")
      .order("sort_order"),
    supabaseAdmin
      .from("builder_stops")
      .select(
        "key,region_key,label,blurb,tag,lat,lng,duration_minutes,mood_tags,pace_tags,intention_tags,who_tags,compatible_with,weight",
      )
      .eq("is_active", true),
    supabaseAdmin
      .from("builder_routing_rules")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
  ]);

  if (regionsRes.error) throw new Error(regionsRes.error.message);
  if (stopsRes.error) throw new Error(stopsRes.error.message);
  if (rulesRes.error) throw new Error(rulesRes.error.message);

  const regions = (regionsRes.data ?? []).map((r) => ({
    ...r,
    lat: Number(r.lat),
    lng: Number(r.lng),
  })) as RegionRow[];
  const stops = (stopsRes.data ?? []).map((s) => ({
    ...s,
    lat: Number(s.lat),
    lng: Number(s.lng),
  })) as StopRow[];
  const rules = (rulesRes.data ?? {
    max_experience_hours: 8,
    max_driving_hours: 3,
    min_stops: 3,
    max_stops: 6,
    default_pace: "balanced",
    base_price_per_person_eur: 180,
    pace_multiplier_relaxed: 0.85,
    pace_multiplier_balanced: 1,
    pace_multiplier_full: 1.2,
  }) as RoutingRules;

  return { regions, stops, rules };
}

/** Generate a feasible route from emotional input. Pure logic, no AI. */
export const generateBuilderRoute = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const { regions, stops, rules } = await loadCatalog();
    const route = generateRoute(data as BuilderInput, regions, stops, rules);
    return { route };
  });

/** Generate a poetic narrative for a real route. Lovable AI Gateway with
 *  deterministic fallback so the UI never shows nothing. */
const narrateSchema = z.object({
  routeStopKeys: z.array(z.string().min(1).max(64)).min(1).max(10),
  mood: z.enum(["slow", "curious", "romantic", "open", "energetic"]),
  who: z.enum(["couple", "family", "friends", "solo"]),
  intention: z.enum([
    "wine",
    "gastronomy",
    "nature",
    "heritage",
    "coast",
    "hidden",
    "wonder",
    "wellness",
  ]),
  pace: z.enum(["relaxed", "balanced", "full"]),
  regionKey: z.string().min(1).max(64),
});

export const narrateBuilderRoute = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => narrateSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const { regions, stops, rules } = await loadCatalog();
    const route = generateRoute(
      {
        mood: data.mood as Mood,
        who: data.who as Who,
        intention: data.intention as Intention,
        regionKey: data.regionKey,
        pace: data.pace as Pace,
        pinnedStopKeys: data.routeStopKeys,
      },
      regions,
      stops,
      rules,
    );

    const fallback = fallbackNarrative(route, {
      mood: data.mood as Mood,
      who: data.who as Who,
      intention: data.intention as Intention,
    });

    if (!apiKey) return { narrative: fallback, source: "fallback" as const };

    try {
      const stopList = route.stops
        .map((s, i) => `${i + 1}. ${s.label}${s.tag ? ` (${s.tag})` : ""} — ${s.blurb ?? ""}`)
        .join("\n");

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "You write short, warm, editorial travel narratives for a premium Portugal travel brand. Three sentences max. Sentence-case. No clichés (no 'hidden gem', no 'unforgettable', no 'breathtaking'). Reference only the real stops provided. Address the reader as 'you'.",
            },
            {
              role: "user",
              content: `Mood: ${data.mood}. Travelling: ${data.who}. Looking for: ${data.intention}. Pace: ${data.pace}. Region: ${route.region.label}.\n\nReal stops, in order:\n${stopList}\n\nWrite the narrative.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 220,
        }),
      });

      if (!res.ok) {
        return { narrative: fallback, source: "fallback" as const };
      }
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) return { narrative: fallback, source: "fallback" as const };
      return { narrative: text, source: "ai" as const };
    } catch {
      return { narrative: fallback, source: "fallback" as const };
    }
  });
