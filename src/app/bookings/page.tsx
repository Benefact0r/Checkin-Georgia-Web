"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBooking, formatPrice, type BookingDetail } from "@/lib/api";
import { formatDateTime } from "@/lib/datetime";

const STATUS_LABEL: Record<string, string> = {
  pending: "მოლოდინში",
  confirmed: "დადასტურებული",
  cancelled: "გაუქმდა",
  completed: "შესრულდა",
  no_show: "ვერ მოვიდა",
};
const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold/15 text-gold",
  confirmed: "bg-success/10 text-success",
  completed: "bg-brand-50 text-brand-700",
  cancelled: "bg-accent-50 text-accent-700",
  no_show: "bg-accent-50 text-accent-700",
};

export default function MyBookings() {
  const [items, setItems] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let ids: string[] = [];
      try {
        ids = JSON.parse(localStorage.getItem("checkin-bookings") || "[]");
      } catch {
        /* ignore */
      }
      const results = await Promise.all(ids.map((id) => getBooking(id).catch(() => null)));
      setItems(results.filter((b): b is BookingDetail => b !== null));
      setLoading(false);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-brand hover:underline">← მთავარი</Link>
      <h1 className="mt-4 text-3xl font-extrabold text-ink-900 dark:text-ink-50">ჩემი ჯავშნები</h1>
      <p className="mt-1 text-sm text-ink-500">ამ მოწყობილობაზე გაკეთებული ჯავშნები</p>

      {loading ? (
        <p className="mt-6 text-sm text-ink-400">იტვირთება…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-ink-400">ჯერ ჯავშნები არ გაქვს.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((b) => (
            <li
              key={b.id}
              className="rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-700 dark:bg-ink-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-900 dark:text-ink-50">{b.venue_name}</p>
                  <p className="text-sm text-ink-600 dark:text-ink-300">{b.service_name}</p>
                  <p className="mt-1 text-xs text-ink-400">
                    {formatDateTime(b.starts_at, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[b.status] ?? "bg-ink-100 text-ink-500"}`}>
                  {STATUS_LABEL[b.status] ?? b.status}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <Link href={`/bookings/${b.id}`} className="text-brand hover:underline">ნახვა</Link>
                <Link
                  href={`/venues/${b.venue_slug}/book?service=${b.service_id}`}
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-600"
                >
                  ისევ დაჯავშნა
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
