"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Venue, Vertical } from "@/lib/api";

// Landing-page category taxonomy. The first four map to real backend verticals;
// `night_club` and `spa` are presentation-only until the backend vertical model
// is extended.
type CategoryKey = Vertical | "night_club" | "spa";

const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
  { key: "salon", label: "სალონები", icon: "💇" },
  { key: "restaurant", label: "რესტორნები", icon: "🍽️" },
  { key: "cafe", label: "კაფეები", icon: "☕" },
  { key: "bar", label: "ბარები", icon: "🍸" },
  { key: "night_club", label: "ღამის კლუბები", icon: "🪩" },
  { key: "spa", label: "სპა და სხეული", icon: "💆" },
];

// Known Tbilisi districts → Georgian dropdown labels.
const DISTRICT_LABELS: Record<string, string> = {
  Vake: "ვაკე",
  Saburtalo: "საბურთალო",
  Vera: "ვერა",
  Mtatsminda: "მთაწმინდა",
  Sololaki: "სოლოლაკი",
  "Old Tbilisi": "ძველი თბილისი",
  Marjanishvili: "მარჯანიშვილი",
};
const districtLabel = (key: string) => DISTRICT_LABELS[key] ?? key;

// Use the structured `district` field when present. Fall back to deriving it
// from the address keyword so filtering works before the API is redeployed
// with the district column.
function districtOf(v: Venue): string | null {
  if (v.district) return v.district;
  const a = v.address.toLowerCase();
  if (a.includes("chavchavadze") || a.includes("vake")) return "Vake";
  if (a.includes("erekle") || a.includes("old tbilisi")) return "Old Tbilisi";
  if (a.includes("aghmashenebeli")) return "Marjanishvili";
  if (a.includes("atoneli")) return "Sololaki";
  return null;
}

export function CategorySections({ venues }: { venues: Venue[] }) {
  const enriched = useMemo(
    () => venues.map((v) => ({ venue: v, district: districtOf(v) })),
    [venues],
  );
  // Selected district per category (empty string = all).
  const [selected, setSelected] = useState<Record<string, string>>({});

  return (
    <>
      {/* Category quick-nav — anchor-jumps to each section */}
      <nav className="mb-12 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <a
            key={c.key}
            href={`#${c.key}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition hover:border-brand hover:text-brand"
          >
            <span aria-hidden>{c.icon}</span>
            {c.label}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        {CATEGORIES.map((c) => {
          const all = enriched.filter((e) => e.venue.vertical === c.key);
          const districts = Array.from(
            new Set(all.map((e) => e.district).filter((d): d is string => !!d)),
          ).sort();
          const sel = selected[c.key] ?? "";
          const shown = sel ? all.filter((e) => e.district === sel) : all;

          return (
            <section key={c.key} id={c.key} className="scroll-mt-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-2xl font-bold">
                    <span className="mr-2" aria-hidden>
                      {c.icon}
                    </span>
                    {c.label}
                  </h2>
                  {all.length > 0 && (
                    <span className="text-sm text-ink-400">{shown.length}</span>
                  )}
                </div>

                {districts.length > 0 && (
                  <select
                    value={sel}
                    onChange={(e) =>
                      setSelected((s) => ({ ...s, [c.key]: e.target.value }))
                    }
                    aria-label={`${c.label} — ლოკაცია`}
                    className="rounded-full border border-ink-200 bg-white px-4 py-1.5 text-sm text-ink-700 transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="">ყველა ლოკაცია</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {districtLabel(d)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {all.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ink-200 bg-white/50 px-6 py-10 text-center">
                  <p className="text-sm font-medium text-ink-500">მალე</p>
                  <p className="mt-1 text-xs text-ink-400">
                    ამ კატეგორიაში ვენიუები მალე დაემატება
                  </p>
                </div>
              ) : shown.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ink-200 bg-white/50 px-6 py-8 text-center">
                  <p className="text-sm text-ink-500">
                    ამ ლოკაციაზე ვენიუ ვერ მოიძებნა
                  </p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {shown.map(({ venue: v, district }) => (
                    <li
                      key={v.id}
                      className="rounded-2xl border border-ink-200 bg-white p-5 transition hover:border-brand hover:shadow-sm"
                    >
                      <Link href={`/venues/${v.slug}`} className="block">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                          {c.label}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">{v.name}</h3>
                        <p className="mt-1 text-sm text-ink-600">
                          {district ? `${districtLabel(district)} · ` : ""}
                          {v.address}
                        </p>
                        {v.description && (
                          <p className="mt-3 line-clamp-2 text-sm text-ink-500">
                            {v.description}
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
