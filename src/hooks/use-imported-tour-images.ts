import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches imported tour image URLs (id → image_url) from Lovable Cloud.
 * Used to overlay live, scraped imagery on top of curated signature tour cards
 * without changing the seeded fallback images.
 */
export function useImportedTourImages(): Record<string, string> {
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("imported_tours")
        .select("id, image_url")
        .not("image_url", "is", null);
      if (cancelled || error || !data) return;
      const next: Record<string, string> = {};
      for (const row of data) {
        if (row.image_url) next[row.id] = row.image_url;
      }
      setMap(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return map;
}
