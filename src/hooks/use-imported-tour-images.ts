import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signatureTours } from "@/data/signatureTours";

type Row = { id: string; image_url: string | null; source_url: string };

/**
 * Fetches imported tour image URLs from Lovable Cloud and exposes a resolver
 * that returns the live image for a SignatureTour when available, otherwise
 * the curated fallback `tour.img`. Matching is done by `source_url` →
 * `bookingUrl`, since signature ids and scraped slugs differ.
 */
export function useImportedTourImages() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("imported_tours")
        .select("id, image_url, source_url")
        .not("image_url", "is", null);
      if (cancelled || error || !data) return;
      setRows(data as Row[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byUrl = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) if (r.image_url) m.set(normalize(r.source_url), r.image_url);
    return m;
  }, [rows]);

  const resolve = useMemo(() => {
    return (tour: (typeof signatureTours)[number]): string => {
      const live = byUrl.get(normalize(tour.bookingUrl));
      return live ?? tour.img;
    };
  }, [byUrl]);

  return { resolve, hasLive: rows.length > 0 };
}

function normalize(url: string): string {
  return url.replace(/\/+$/, "").toLowerCase();
}
