"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFavorites, type VenueCardData } from "@/lib/personalization";
import { VenueCard } from "@/components/venue-card";
import { CardGridSkeleton } from "@/components/skeletons";

export default function FavoritesPage() {
  const [items, setItems] = useState<VenueCardData[] | null>(null);

  useEffect(() => {
    getFavorites().then(setItems);
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/" className="text-sm text-brand hover:underline">
        ← მთავარი
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-ink-900 dark:text-ink-50">
        ❤️ ფავორიტები
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        შენახული ადგილები ამ მოწყობილობაზე
      </p>

      {items === null ? (
        <div className="mt-8">
          <CardGridSkeleton count={3} />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-ink-200 bg-white/50 px-6 py-14 text-center dark:border-ink-700 dark:bg-ink-800/40">
          <p className="text-base font-medium text-ink-600 dark:text-ink-300">
            ჯერ ფავორიტები არ გაქვს
          </p>
          <p className="mt-1 text-sm text-ink-400">
            დააჭირე ❤️ ნებისმიერ ადგილს, რომ აქ შეინახო
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            აღმოაჩინე ადგილები
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((v) => (
            <li key={v.id}>
              <VenueCard venue={v} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
