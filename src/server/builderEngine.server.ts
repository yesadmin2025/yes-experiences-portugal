/**
 * Logic engine for the Experience Builder.
 * Server-only: pure functions, no React, no fetch. Called from
 * createServerFn handlers.
 *
 * Hard rules:
 *  - max experience hours (from builder_routing_rules)
 *  - max driving hours (sum of segment drive times)
 *  - region grouping (route stays inside one region key)
 *  - stop compatibility (compatible_with hints boost adjacency)
 *  - pace logic (relaxed shrinks count, full grows count)
 *
 * The engine is deterministic given the same input + DB state.
 * No randomness from the AI layer touches route shape.
 */

export type Mood = "slow" | "curious" | "romantic" | "open" | "energetic";
export type Pace = "relaxed" | "balanced" | "full";
export type Who = "couple" | "family" | "friends" | "solo";
export type Intention =
  | "wine"
  | "gastronomy"
  | "nature"
  | "heritage"
  | "coast"
  | "hidden"
  | "wonder"
  | "wellness";

export interface BuilderInput {
  mood: Mood;
  who: Who;
  intention: Intention;
  // Optional explicit region; otherwise the engine picks the best fit.
  regionKey?: string;
  pace?: Pace;
  // Stops the user has already locked in (keys). Engine keeps them and
  // fills the rest, respecting hard rules.
  pinnedStopKeys?: string[];
  // Stops the user explicitly removed. Never include them.
  excludedStopKeys?: string[];
}

export interface StopRow {
  key: string;
  region_key: string;
  label: string;
  blurb: string | null;
  tag: string | null;
  lat: number;
  lng: number;
  duration_minutes: number;
  mood_tags: string[];
  pace_tags: string[];
  intention_tags: string[];
  who_tags: string[];
  compatible_with: string[];
  weight: number;
}

export interface RegionRow {
  key: string;
  label: string;
  blurb: string | null;
  lat: number;
  lng: number;
}

export interface RoutingRules {
  max_experience_hours: number;
  max_driving_hours: number;
  min_stops: number;
  max_stops: number;
  default_pace: string;
  base_price_per_person_eur: number;
  pace_multiplier_relaxed: number;
  pace_multiplier_balanced: number;
  pace_multiplier_full: number;
}

export interface RoutedStop extends StopRow {
  driveMinutesFromPrev: number;
}

export interface BuilderRoute {
  region: RegionRow;
  pace: Pace;
  stops: RoutedStop[];
  totals: {
    experienceMinutes: number;
    drivingMinutes: number;
    stopMinutes: number;
  };
  pricePerPersonEur: number;
  feasible: boolean;
  warnings: string[];
}

// ---------- math ----------
const KM_PER_DEG_LAT = 111;
const AVG_KMH = 70; // Portuguese highways + N-roads blended
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}
function driveMinutesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  // 1.25x detour factor over haversine to approximate real roads
  const km = haversineKm(a, b) * 1.25;
  return Math.round((km / AVG_KMH) * 60);
}
const _kmPerDegLat = KM_PER_DEG_LAT; // kept for tooling; not exported

// ---------- region picker ----------
const INTENTION_REGION_BIAS: Record<Intention, Record<string, number>> = {
  wine: { porto: 3, lisbon: 2, alentejo: 3, algarve: 0 },
  gastronomy: { porto: 2, lisbon: 3, alentejo: 2, algarve: 1 },
  nature: { algarve: 3, alentejo: 2, lisbon: 2, porto: 2 },
  heritage: { porto: 3, lisbon: 3, alentejo: 3, algarve: 1 },
  coast: { algarve: 3, lisbon: 3, alentejo: 1, porto: 1 },
  hidden: { alentejo: 3, algarve: 2, porto: 1, lisbon: 1 },
  wonder: { lisbon: 3, porto: 2, algarve: 2, alentejo: 2 },
  wellness: { algarve: 2, alentejo: 3, lisbon: 1, porto: 1 },
};

export function pickRegion(input: BuilderInput, regions: RegionRow[]): RegionRow {
  if (input.regionKey) {
    const found = regions.find((r) => r.key === input.regionKey);
    if (found) return found;
  }
  // Score regions by intention bias; tie-break by sort (already done in DB)
  const bias = INTENTION_REGION_BIAS[input.intention] ?? {};
  let best = regions[0];
  let bestScore = -1;
  for (const r of regions) {
    const score = bias[r.key] ?? 0;
    if (score > bestScore) {
      best = r;
      bestScore = score;
    }
  }
  return best;
}

// ---------- pace -> stop count ----------
export function paceToTargetStops(pace: Pace, rules: RoutingRules) {
  const min = rules.min_stops;
  const max = rules.max_stops;
  if (pace === "relaxed") return Math.max(min, Math.min(max, min + 1)); // 4
  if (pace === "full") return Math.min(max, max); // 6
  return Math.max(min, Math.min(max, min + 2)); // 5
}

// ---------- scoring ----------
function scoreStop(stop: StopRow, input: BuilderInput): number {
  let s = stop.weight;
  if (stop.mood_tags.includes(input.mood)) s += 30;
  if (stop.who_tags.includes(input.who)) s += 20;
  if (stop.intention_tags.includes(input.intention)) s += 35;
  if (input.pace && stop.pace_tags.includes(input.pace)) s += 10;
  return s;
}

// ---------- nearest-neighbor ordering ----------
function orderByNearestNeighbor(start: { lat: number; lng: number }, stops: StopRow[]): StopRow[] {
  if (stops.length <= 1) return stops.slice();
  const remaining = stops.slice();
  const ordered: StopRow[] = [];
  let cursor = start;
  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(cursor, remaining[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    cursor = next;
  }
  return ordered;
}

// ---------- main: generate ----------
export function generateRoute(
  input: BuilderInput,
  regions: RegionRow[],
  allStops: StopRow[],
  rules: RoutingRules,
): BuilderRoute {
  const region = pickRegion(input, regions);
  const pace: Pace = input.pace ?? (rules.default_pace as Pace) ?? "balanced";

  const candidates = allStops
    .filter((s) => s.region_key === region.key)
    .filter((s) => !(input.excludedStopKeys ?? []).includes(s.key));

  // 1. force-include pinned stops in this region
  const pinned = candidates.filter((s) => (input.pinnedStopKeys ?? []).includes(s.key));

  // 2. score & sort the rest
  const remaining = candidates
    .filter((s) => !pinned.includes(s))
    .map((s) => ({ s, score: scoreStop(s, input) }))
    .sort((a, b) => b.score - a.score);

  // 3. fill up to target with hard rule checks
  const target = paceToTargetStops(pace, rules);
  const maxExpMin = rules.max_experience_hours * 60;
  const maxDriveMin = rules.max_driving_hours * 60;

  const chosen: StopRow[] = [...pinned];
  const trySequence = (seq: StopRow[]) => {
    const ordered = orderByNearestNeighbor(region, seq);
    let drive = 0;
    let stay = 0;
    let cursor: { lat: number; lng: number } = region;
    for (const s of ordered) {
      drive += driveMinutesBetween(cursor, s);
      stay += s.duration_minutes;
      cursor = s;
    }
    return { ordered, drive, stay, total: drive + stay };
  };

  for (const { s } of remaining) {
    if (chosen.length >= target) break;
    const trial = [...chosen, s];
    const t = trySequence(trial);
    if (t.total <= maxExpMin && t.drive <= maxDriveMin) {
      chosen.push(s);
    }
  }

  // 4. ensure min_stops; if pinned/excluded made it too small, pad with
  // best-fit ignoring intention tags last
  if (chosen.length < rules.min_stops) {
    const fallback = candidates
      .filter((s) => !chosen.includes(s))
      .sort((a, b) => b.weight - a.weight);
    for (const s of fallback) {
      if (chosen.length >= rules.min_stops) break;
      const t = trySequence([...chosen, s]);
      if (t.total <= maxExpMin && t.drive <= maxDriveMin) {
        chosen.push(s);
      } else {
        break;
      }
    }
  }

  // 5. final ordering and totals
  const final = trySequence(chosen);
  let prev: { lat: number; lng: number } = region;
  const routedStops: RoutedStop[] = final.ordered.map((s) => {
    const d = driveMinutesBetween(prev, s);
    prev = s;
    return { ...s, driveMinutesFromPrev: d };
  });

  // 6. price
  const paceMult =
    pace === "relaxed"
      ? rules.pace_multiplier_relaxed
      : pace === "full"
        ? rules.pace_multiplier_full
        : rules.pace_multiplier_balanced;
  const stopFactor = 1 + (routedStops.length - rules.min_stops) * 0.08;
  const pricePerPersonEur = Math.round(rules.base_price_per_person_eur * paceMult * stopFactor);

  const warnings: string[] = [];
  if (routedStops.length < rules.min_stops) warnings.push("Fewer stops than ideal for this pace.");
  if (final.drive > maxDriveMin) warnings.push("Driving time exceeds the comfortable maximum.");

  return {
    region,
    pace,
    stops: routedStops,
    totals: {
      drivingMinutes: final.drive,
      stopMinutes: final.stay,
      experienceMinutes: final.total,
    },
    pricePerPersonEur,
    feasible: final.total <= maxExpMin && final.drive <= maxDriveMin && routedStops.length >= rules.min_stops,
    warnings,
  };
}

// ---------- deterministic narrative fallback ----------
export function fallbackNarrative(route: BuilderRoute, input: BuilderInput): string {
  const moodWord =
    input.mood === "slow"
      ? "unhurried"
      : input.mood === "romantic"
        ? "intimate"
        : input.mood === "curious"
          ? "curious"
          : input.mood === "open"
            ? "wide-open"
            : "energetic";
  const intentionWord =
    input.intention === "wine"
      ? "wine"
      : input.intention === "gastronomy"
        ? "long, generous lunches"
        : input.intention === "nature"
          ? "nature"
          : input.intention === "heritage"
            ? "old stone and story"
            : input.intention === "coast"
              ? "the coast"
              : input.intention === "hidden"
                ? "the quiet, lesser-known corners"
                : input.intention === "wonder"
                  ? "places that make you stop and look"
                  : "ease and silence";
  const placeList = route.stops.slice(0, 3).map((s) => s.label).join(", ");
  return `An ${moodWord} day across ${route.region.label} — built around ${intentionWord}. You'll move through ${placeList}${route.stops.length > 3 ? ", and a few more" : ""}, at a ${route.pace} rhythm.`;
}
