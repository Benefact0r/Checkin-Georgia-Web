"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getFeed, type PersonalizedFeed } from "@/lib/personalization";
import { VenueRail } from "./venue-rail";
import { RailSkeleton } from "./skeletons";

/** Personalized "for you" feed of rails. Loads without geo (no surprise
 *  permission prompt); offers an opt-in "near me" that re-fetches with coords. */
export function ForYouFeed() {
  const [feed, setFeed] = useState<PersonalizedFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  const load = useCallback((geo?: { lat: number; lng: number }) => {
    setLoading(true);
    getFeed(geo)
      .then(setFeed)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        load({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setLocating(false),
      { timeout: 6000, maximumAge: 600_000 },
    );
  };

  if (loading && !feed) {
    return (
      <div className="mb-10">
        <div className="mb-4 h-6 w-44 animate-pulse rounded bg-ink-100 dark:bg-ink-700" />
        <RailSkeleton />
      </div>
    );
  }

  if (!feed || feed.sections.length === 0) return null;

  const showColdStart = feed.meta.cold_start && !feed.meta.has_preferences;

  return (
    <div className="mb-4">
      {showColdStart && (
        <Link
          href="/preferences"
          className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 transition hover:border-brand dark:border-brand-700 dark:bg-brand-900/30"
        >
          <div>
            <p className="font-semibold text-brand-700 dark:text-brand-100">
              🎯 მიიღე შენთვის შერჩეული რეკომენდაციები
            </p>
            <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-300">
              გვითხარი რა მოგწონს — წამიერი პერსონალიზაცია
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
            დაწყება →
          </span>
        </Link>
      )}

      {!feed.meta.has_geo && (
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-4 py-1.5 text-sm font-medium text-ink-700 transition hover:border-brand dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
        >
          📍 {locating ? "მდებარეობის ძებნა…" : "ნახე ახლოს შენთან"}
        </button>
      )}

      {feed.sections.map((s) => (
        <VenueRail
          key={s.key}
          title={s.title}
          venues={s.venues}
          action={
            s.key === "for_you" ? (
              <Link href="/preferences" className="text-sm font-medium text-brand hover:underline">
                გემოვნება →
              </Link>
            ) : undefined
          }
        />
      ))}
    </div>
  );
}
