"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPreferences, savePreferences } from "@/lib/personalization";
import { ALL_DISTRICTS, districtLabel } from "@/lib/districts";
import { VERTICAL_LIST } from "@/lib/verticals";
import { ChipMultiSelect, type ChipOption } from "@/components/chips";

const VERTICAL_OPTIONS: ChipOption[] = VERTICAL_LIST.map((v) => ({
  value: v.key,
  label: v.label,
  icon: v.icon,
}));

const DISTRICT_OPTIONS: ChipOption[] = ALL_DISTRICTS.map((d) => ({
  value: d,
  label: districtLabel(d),
}));

const PRICE_OPTIONS: ChipOption[] = [
  { value: "$", label: "$ — ხელმისაწვდომი" },
  { value: "$$", label: "$$ — საშუალო" },
  { value: "$$$", label: "$$$ — პრემიუმი" },
  { value: "$$$$", label: "$$$$ — ლუქსი" },
];

// Curated taste tags. Values match the cuisine/tag strings stored on venues.
const TAG_OPTIONS: ChipOption[] = [
  { value: "Georgian", label: "ქართული" },
  { value: "European", label: "ევროპული" },
  { value: "Italian", label: "იტალიური" },
  { value: "Asian", label: "აზიური" },
  { value: "Japanese", label: "იაპონური" },
  { value: "Sushi", label: "სუში" },
  { value: "Pizza", label: "პიცა" },
  { value: "Seafood", label: "ზღვის პროდუქტები" },
  { value: "Vegan", label: "ვეგანური" },
  { value: "Breakfast", label: "საუზმე" },
  { value: "Coffee", label: "ყავა" },
  { value: "Wine", label: "ღვინო" },
  { value: "Cocktails", label: "კოქტეილები" },
  { value: "Dessert", label: "დესერტი" },
  { value: "BBQ", label: "მწვადი / BBQ" },
  { value: "Haircut", label: "თმის შეჭრა" },
  { value: "Nails", label: "მანიკიური" },
  { value: "Massage", label: "მასაჟი" },
];

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50">{title}</h2>
      {hint && <p className="mb-3 mt-0.5 text-sm text-ink-500">{hint}</p>}
      <div className={hint ? "" : "mt-3"}>{children}</div>
    </section>
  );
}

export default function PreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [verticals, setVerticals] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [prices, setPrices] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    getPreferences()
      .then((p) => {
        setVerticals(p.favorite_verticals ?? []);
        setDistricts(p.preferred_districts ?? []);
        setPrices(p.price_tiers ?? []);
        setTags(p.tags ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(goHome: boolean) {
    setSaving(true);
    setSaved(false);
    try {
      await savePreferences({
        favorite_verticals: verticals,
        preferred_districts: districts,
        price_tiers: prices,
        tags,
      });
      setSaved(true);
      if (goHome) router.push("/");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-brand hover:underline">
        ← მთავარი
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-ink-900 dark:text-ink-50">
        🎯 შენი გემოვნება
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        გვითხარი რა მოგწონს — და მთავარ გვერდზე შენთვის შერჩეულ ადგილებს გაჩვენებთ.
        ყველა ველი არასავალდებულოა.
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-ink-400">იტვირთება…</p>
      ) : (
        <div className="mt-8">
          <Section title="კატეგორიები" hint="რა ტიპის ადგილები გაინტერესებს?">
            <ChipMultiSelect
              options={VERTICAL_OPTIONS}
              selected={verticals}
              onChange={setVerticals}
            />
          </Section>

          <Section title="ლოკაცია" hint="თბილისის რომელ უბნებს ანიჭებ უპირატესობას?">
            <ChipMultiSelect
              options={DISTRICT_OPTIONS}
              selected={districts}
              onChange={setDistricts}
            />
          </Section>

          <Section title="ფასების დონე">
            <ChipMultiSelect
              options={PRICE_OPTIONS}
              selected={prices}
              onChange={setPrices}
            />
          </Section>

          <Section title="სამზარეულო და სერვისები" hint="რა გემოვნება გაქვს?">
            <ChipMultiSelect
              options={TAG_OPTIONS}
              selected={tags}
              onChange={setTags}
              searchable
              placeholder="მოძებნე სამზარეულო…"
            />
          </Section>

          <div className="sticky bottom-4 mt-10 flex items-center gap-3 rounded-2xl border border-ink-200 bg-white/90 p-3 backdrop-blur dark:border-ink-700 dark:bg-ink-800/90">
            <button
              type="button"
              onClick={() => save(true)}
              disabled={saving}
              className="flex-1 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              {saving ? "ინახება…" : "შენახვა და გაგრძელება"}
            </button>
            <button
              type="button"
              onClick={() => save(false)}
              disabled={saving}
              className="rounded-xl border border-ink-200 px-4 py-3 text-sm font-medium text-ink-600 transition hover:border-brand dark:border-ink-700 dark:text-ink-300"
            >
              შენახვა
            </button>
          </div>
          {saved && (
            <p className="mt-3 text-center text-sm text-success">✓ შენახულია</p>
          )}
        </div>
      )}
    </main>
  );
}
