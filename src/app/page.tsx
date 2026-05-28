import { listVenues } from "@/lib/api";
import { CategorySections } from "./category-sections";

export default async function Home() {
  const { items } = await listVenues({ limit: 30 });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-10 overflow-hidden rounded-3xl bg-sunset px-8 py-14 text-white shadow-lg">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="#FFFFFF"
            />
            <path
              d="M8.6 9.2l2.2 2.2 4.4-4.6"
              stroke="#6D28E8"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span className="text-lg font-bold tracking-tight">checkin</span>
        </div>
        <h1 className="mt-6 text-5xl font-extrabold leading-tight">
          აღმოაჩინე, დაჯავშნე, გადაიხადე — ერთ აპში
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/80">
          სალონები · რესტორნები · კაფეები · ბარები — საქართველოს მასშტაბით.
        </p>
      </header>

      <CategorySections venues={items} />

      <footer className="mt-16 border-t border-ink-200 pt-6 text-sm text-ink-500">
        <p>
          Powered by{" "}
          <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">
            checkin-georgia-api
          </code>{" "}
          on Cloud Run · {items.length} venue{items.length === 1 ? "" : "s"}{" "}
          loaded.
        </p>
        <p className="mt-1 text-xs text-ink-400">
          API: {process.env.NEXT_PUBLIC_API_URL ?? "default"}
        </p>
      </footer>
    </main>
  );
}
