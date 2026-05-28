import Link from "next/link";
import { listVenues, type Vertical } from "@/lib/api";

const VERTICAL_LABELS: Record<Vertical, string> = {
  salon: "სალონები",
  restaurant: "რესტორნები",
  cafe: "კაფეები",
  bar: "ბარები",
};

export default async function Home() {
  const { items } = await listVenues({ limit: 30 });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand">
          Checkin Georgia
        </p>
        <h1 className="mt-2 text-5xl font-bold leading-tight">
          აღმოაჩინე, დაჯავშნე, გადაიხადე
          <span className="text-brand"> ერთ აპში</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          სალონები · რესტორნები · კაფეები · ბარები — საქართველოს მასშტაბით.
        </p>
      </header>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">ვენიუები ({items.length})</h2>
        {items.length === 0 ? (
          <p className="text-slate-500">ჯერ არ გვაქვს ვენიუები.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((v) => (
              <li
                key={v.id}
                className="rounded-2xl border border-slate-200 p-5 transition hover:border-brand hover:shadow-sm"
              >
                <Link href={`/venues/${v.slug}`} className="block">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                    {VERTICAL_LABELS[v.vertical]}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{v.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{v.address}</p>
                  {v.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                      {v.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-16 border-t border-slate-200 pt-6 text-sm text-slate-500">
        <p>
          Powered by{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
            checkin-georgia-api
          </code>{" "}
          on Cloud Run · {items.length} venue{items.length === 1 ? "" : "s"}{" "}
          loaded.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Build: {process.env.NEXT_PUBLIC_API_URL ?? "default"}
        </p>
      </footer>
    </main>
  );
}
