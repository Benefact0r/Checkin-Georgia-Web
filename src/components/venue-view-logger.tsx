"use client";

import { useEffect } from "react";
import { logVenueView } from "@/lib/personalization";

/** Invisible: logs a venue view once on mount (implicit personalization signal). */
export function VenueViewLogger({
  venueId,
  source = "detail",
}: {
  venueId: string;
  source?: string;
}) {
  useEffect(() => {
    logVenueView(venueId, source);
  }, [venueId, source]);
  return null;
}
