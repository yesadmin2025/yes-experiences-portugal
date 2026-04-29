import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { extractViatorTour, type ViatorExtraction } from "@/server/viatorTour.server";

/**
 * Hard-coded for the "Arrábida P3" Signature tour. Generic flow can come
 * later — for now this updates ONLY the imported_tours row keyed by this id.
 */
const ARRABIDA_TOUR_ID = "arrabida-wine-allinclusive";
const ARRABIDA_REGION = "lisbon";
const ARRABIDA_REGION_LABEL = "Setúbal · Arrábida";

async function assertAdmin(supabase: ReturnType<typeof requireSupabaseAuth> extends never ? never : any, userId: string) {
  const { data: roleRow, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(`Role check failed: ${error.message}`);
  if (!roleRow) throw new Error("Forbidden: admin role required");
}

/**
 * Step 1: fetch the Viator page and return the AI-extracted preview.
 * Does NOT persist anything — admin reviews before saving.
 */
export const fetchViatorArrabida = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      url: z.string().url().refine(
        (u) => /^https?:\/\/(www\.)?viator\.com\//i.test(u),
        { message: "Must be a viator.com URL" },
      ),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const extraction = await extractViatorTour(data.url);
    return { url: data.url, extraction };
  });

/**
 * Step 2: persist the reviewed extraction to imported_tours, keyed by the
 * fixed Arrábida id. Stores the rich Viator structure under stops[] so the
 * existing /tours/$tourId reader picks it up.
 */
export const saveViatorArrabida = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      url: z.string().url(),
      extraction: z.object({
        title: z.string().min(1),
        durationText: z.string(),
        pickupZone: z.string(),
        groupType: z.string(),
        blurb: z.string(),
        itinerary: z.array(
          z.object({
            order: z.number().int(),
            label: z.string().min(1),
            description: z.string(),
            optional: z.boolean(),
          }),
        ).min(1),
        inclusions: z.array(z.string()),
        exclusions: z.array(z.string()),
        variesByOption: z.array(z.string()),
      }),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { url, extraction } = data;

    // Map the Viator itinerary to the imported_tours.stops[] shape used by
    // the public reader. We don't have coordinates from Viator — leave x/y
    // at 0 and tag each as the optional flag so downstream UI can mark it.
    const stops = extraction.itinerary.map((step) => ({
      label: step.label,
      tag: step.optional ? "optional" : "stop",
      x: 0,
      y: 0,
    }));

    const row = {
      id: ARRABIDA_TOUR_ID,
      title: extraction.title,
      source_url: url,
      region: ARRABIDA_REGION,
      region_label: ARRABIDA_REGION_LABEL,
      duration: "fullday",
      duration_label: "Full Day",
      duration_hours: extraction.durationText,
      price_from: 0,
      theme: "Wine",
      styles: ["wine", "gastronomy"],
      highlights: extraction.itinerary
        .filter((s) => !s.optional)
        .slice(0, 5)
        .map((s) => s.label),
      pace: "balanced",
      tier: "signature",
      fits_best: "Couples · small groups · slow travelers",
      pace_cues: extraction.itinerary.slice(0, 3).map((s) => s.label),
      blurb: extraction.blurb,
      image_url: null,
      stops,
      ai_model: "google/gemini-3-flash-preview",
    };

    const { error } = await supabaseAdmin
      .from("imported_tours")
      .upsert(row, { onConflict: "id" });

    if (error) throw new Error(`DB upsert failed: ${error.message}`);

    return { ok: true, id: ARRABIDA_TOUR_ID, stopsSaved: stops.length };
  });

export type FetchedViatorArrabida = {
  url: string;
  extraction: ViatorExtraction;
};
