"use client";

import { useEffect, useState } from "react";
import { getRecentlyViewed, type VenueCardData } from "@/lib/personalization";
import { VenueRail } from "./venue-rail";

/** "Recently viewed" rail. Renders nothing until it has venues to show.
 *  Pass excludeId on a venue page to hide the venue you're currently on. */
export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [items, setItems] = useState<VenueCardData[]>([]);

  useEffect(() => {
    let alive = true;
    getRecentlyViewed().then((v) => {
      if (alive) setItems(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  const shown = excludeId ? items.filter((v) => v.id !== excludeId) : items;
  if (shown.length === 0) return null;

  return <VenueRail title="ბოლოს ნანახი" venues={shown} />;
}
