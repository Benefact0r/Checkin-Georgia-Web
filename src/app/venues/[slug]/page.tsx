import Link from "next/link";
import { notFound } from "next/navigation";
import { getVenue, getVenueReviews, formatPrice, type Vertical } from "@/lib/api";
import { VERTICAL_CONFIG } from "@/lib/verticals";
import { FavoriteButton } from "@/components/favorite-button";
import { RecentlyViewed } from "@/components/recently-viewed";
import { VenueViewLogger } from "@/components/venue-view-logger";
import { OpenNowBadge } from "@/components/open-now-badge";
import { WeeklyHours } from "@/components/weekly-hours";
import { ContactForm } from "./contact-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SERVES: Record<string, string> = {
  men: "მამაკაცი",
  women: "ქალი",
  unisex: "უნისექს",
};
const DRESS: Record<string, string> = {
  casual: "Casual",
  smart_casual: "Smart casual",
  formal: "Formal",
};
const MUSIC_TYPE: Record<string, string> = {
  none: "მუსიკის გარეშე",
  background: "ფონური მუსიკა",
  live: "ცოცხალი მუსიკა",
  dj: "DJ",
};

type Attrs = {
  priceRange?: string;
  serves?: string;
  cuisines?: string[];
  chef?: string;
  music?: { type?: string; genres?: string[]; nights?: string[] };
  dressCode?: string;
  ageLimit?: number;
  amenities?: string[];
  couples?: boolean;
  menu?: { section: string; items: { name: string; price?: string; description?: string }[] }[];
};

function badges(a: Attrs): string[] {
  const out: string[] = [];
  if (a.priceRange) out.push(a.priceRange);
  if (a.serves) out.push(SERVES[a.serves] ?? a.serves);
  if (a.cuisines?.length) out.push(a.cuisines.join(" · "));
  if (a.chef) out.push(`👨‍🍳 ${a.chef}`);
  if (a.music?.type) {
    const g = a.music.genres?.length ? ` (${a.music.genres.join(", ")})` : "";
    out.push(`🎵 ${MUSIC_TYPE[a.music.type] ?? a.music.type}${g}`);
  }
  if (a.dressCode) out.push(`👔 ${DRESS[a.dressCode] ?? a.dressCode}`);
  if (typeof a.ageLimit === "number") out.push(`${a.ageLimit}+`);
  if (a.couples) out.push("წყვილებისთვის");
  return out;
}

export default async function VenuePage({ params }: PageProps) {
  const { slug } = await params;
  let venue;
  try {
    venue = await getVenue(slug);
  } catch {
    notFound();
  }

  const reviews = (await getVenueReviews(slug)).items;
  const cfg = VERTICAL_CONFIG[venue.vertical as Vertical];
  const a = (venue.attributes ?? {}) as Attrs;
  const staff = venue.resources.filter((r) => r.kind === "staff" || r.kind === "room");
  const tables = venue.resources.filter((r) => r.kind === "table" || r.kind === "seat");
  const servicesByCat = groupBy(venue.services, (s) => s.category ?? "");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <VenueViewLogger venueId={venue.id} />
      <Link href="/" className="text-sm text-brand hover:underline">← უკან</Link>

      {/* Hero */}
      <div className="relative mt-4">
        {venue.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={venue.cover_url} alt={venue.name} className="h-64 w-full rounded-3xl object-cover" />
        ) : (
          <div className="h-32 w-full rounded-3xl bg-sunset" />
        )}
        <div className="absolute right-3 top-3">
          <FavoriteButton venueId={venue.id} className="h-10 w-10" />
        </div>
      </div>

      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          {cfg?.icon} {cfg?.label}
        </p>
        <h1 className="mt-1 text-4xl font-extrabold text-ink-900 dark:text-ink-50">{venue.name}</h1>
        <p className="mt-2 text-ink-600">
          {venue.district ? `${venue.district} · ` : ""}{venue.address}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {venue.avg_rating != null && (
            <span className="text-sm text-ink-500">
              ⭐ {venue.avg_rating.toFixed(1)} ({venue.review_count})
            </span>
          )}
          <OpenNowBadge openNow={venue.open_now} />
        </div>
        {badges(a).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {badges(a).map((b, i) => (
              <span key={i} className="rounded-full border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800 px-3 py-1 text-sm text-ink-700">{b}</span>
            ))}
          </div>
        )}
        {venue.description && <p className="mt-4 text-ink-700">{venue.description}</p>}
        {a.amenities?.length ? (
          <p className="mt-3 text-sm text-ink-500">{a.amenities.map((x) => `· ${x}`).join(" ")}</p>
        ) : null}
      </header>

      {/* Gallery */}
      {(venue.photos.length > 0 || venue.videos.length > 0) && (
        <section className="mt-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {venue.photos.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={p} alt="" className="h-32 w-full rounded-xl object-cover" />
            ))}
            {venue.videos.map((v, i) => (
              <video key={i} src={v} controls className="h-32 w-full rounded-xl bg-ink-900 object-cover" />
            ))}
          </div>
        </section>
      )}

      {/* Staff / therapists (salon, spa) */}
      {cfg?.staffLike && staff.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-ink-900 dark:text-ink-50">{cfg.resourceLabelPlural}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {staff.map((r) => {
              const ra = (r.attributes ?? {}) as { role?: string; serves?: string };
              return (
                <div key={r.id} className="rounded-2xl border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800 p-4 text-center">
                  {r.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.photo_url} alt={r.name} className="mx-auto h-20 w-20 rounded-full object-cover" />
                  ) : (
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-2xl text-brand-700">
                      {r.name.charAt(0)}
                    </div>
                  )}
                  <p className="mt-2 font-semibold text-ink-900 dark:text-ink-50">{r.name}</p>
                  {ra.role && <p className="text-xs text-ink-500">{ra.role}</p>}
                  {ra.serves && (
                    <span className="mt-1 inline-block rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-600">
                      {SERVES[ra.serves] ?? ra.serves}
                    </span>
                  )}
                  {r.bio && <p className="mt-2 text-xs text-ink-500">{r.bio}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tables summary (restaurant, bar, club, cafe) */}
      {cfg?.tableLike && tables.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-2 text-xl font-bold text-ink-900 dark:text-ink-50">{cfg.resourceLabelPlural}</h2>
          <p className="text-sm text-ink-600">
            {tables.length} {cfg.resourceLabel} · {tables.reduce((n, t) => n + t.capacity, 0)} ადგილი
          </p>
        </section>
      )}

      {/* Bookable services */}
      {venue.services.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-ink-900 dark:text-ink-50">სერვისები</h2>
          {Object.entries(servicesByCat).map(([cat, items]) => (
            <div key={cat} className="mb-5">
              {cat && <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-400">{cat}</h3>}
              <ul className="space-y-2">
                {items.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-xl border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800 p-4">
                    <div>
                      <p className="font-semibold text-ink-900 dark:text-ink-50">{s.name}</p>
                      <p className="text-xs text-ink-500">
                        {s.duration_minutes ? `${s.duration_minutes} წთ` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-ink-800">
                        {s.price_minor != null ? formatPrice(s.price_minor, s.currency) : "—"}
                      </span>
                      <Link
                        href={`/venues/${venue.slug}/book?service=${s.id}`}
                        className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-600"
                      >
                        დაჯავშნა
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Food / drink menu (informational) */}
      {a.menu?.length ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-ink-900 dark:text-ink-50">მენიუ</h2>
          {a.menu.map((sec, i) => (
            <div key={i} className="mb-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-400">{sec.section}</h3>
              <ul className="divide-y divide-ink-100 rounded-xl border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800">
                {sec.items.map((it, j) => (
                  <li key={j} className="flex items-start justify-between gap-4 p-3">
                    <div>
                      <p className="text-sm font-medium text-ink-900 dark:text-ink-50">{it.name}</p>
                      {it.description && <p className="text-xs text-ink-500">{it.description}</p>}
                    </div>
                    {it.price && <span className="whitespace-nowrap text-sm text-ink-700">{it.price}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-ink-900 dark:text-ink-50">შეფასებები</h2>
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-700 dark:bg-ink-800"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink-900 dark:text-ink-100">
                    {r.reviewer_name ?? "მომხმარებელი"}
                  </p>
                  <p className="text-sm text-gold">
                    {"★".repeat(r.rating)}
                    <span className="text-ink-300 dark:text-ink-600">{"★".repeat(5 - r.rating)}</span>
                  </p>
                </div>
                {r.text && <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{r.text}</p>}
                {r.reply_text && (
                  <div className="mt-2 rounded-lg bg-ink-50 p-2 text-sm text-ink-600 dark:bg-ink-900 dark:text-ink-300">
                    <span className="text-xs font-semibold text-brand">პასუხი: </span>
                    {r.reply_text}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Opening hours */}
      <WeeklyHours hours={venue.hours} />

      {/* Contact the venue */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-ink-900 dark:text-ink-50">დაგვიკავშირდი</h2>
        <ContactForm slug={venue.slug} />
      </section>

      {/* Recently viewed (excludes this venue) */}
      <div className="mt-14">
        <RecentlyViewed excludeId={venue.id} />
      </div>
    </main>
  );
}

function groupBy<T>(arr: T[], key: (t: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of arr) {
    const k = key(item);
    (out[k] ??= []).push(item);
  }
  return out;
}
