import Link from "next/link";
import { notFound } from "next/navigation";
import { getVenue, formatPrice } from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function VenuePage({ params }: PageProps) {
  const { slug } = await params;
  let venue;
  try {
    venue = await getVenue(slug);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-brand hover:underline">
        ← უკან
      </Link>

      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          {venue.vertical}
        </p>
        <h1 className="mt-1 text-4xl font-bold">{venue.name}</h1>
        <p className="mt-2 text-slate-600">{venue.address}</p>
        {venue.description && (
          <p className="mt-4 text-slate-700">{venue.description}</p>
        )}
      </header>

      {venue.resources.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            {venue.vertical === "salon" ? "თანამშრომლები" : "რესურსები"}
          </h2>
          <ul className="mt-4 space-y-3">
            {venue.resources.map((r) => (
              <li key={r.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-slate-500">
                  {r.kind} · capacity {r.capacity}
                </p>
                {r.bio && (
                  <p className="mt-2 text-sm text-slate-600">{r.bio}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {venue.services.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">სერვისები</h2>
          <ul className="mt-4 space-y-3">
            {venue.services.map((s) => (
              <li
                key={s.id}
                className="flex items-start justify-between rounded-xl border border-slate-200 p-4"
              >
                <div className="flex-1">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-slate-500">
                    {s.duration_minutes ? `${s.duration_minutes} წთ` : "—"}
                    {s.category && ` · ${s.category}`}
                  </p>
                  {s.description && (
                    <p className="mt-2 text-sm text-slate-600">
                      {s.description}
                    </p>
                  )}
                </div>
                <div className="ml-4 text-right">
                  <p className="font-semibold">
                    {formatPrice(s.price_minor, s.currency)}
                  </p>
                  <Link
                    href={`/venues/${venue.slug}/book?service=${s.id}`}
                    className="mt-2 inline-block rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-600"
                  >
                    დაჯავშნა
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Payment buttons moved to /bookings/[id] success page now that the
          booking flow is wired up. */}
    </main>
  );
}
