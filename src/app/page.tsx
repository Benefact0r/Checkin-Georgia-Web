import Link from "next/link";
import { listVenues } from "@/lib/api";
import { CategorySections } from "./category-sections";

export default async function Home() {
  const { items } = await listVenues({ limit: 30 });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-10 overflow-hidden rounded-3xl bg-sunset px-8 py-14 text-white shadow-lg">
        <div className="flex items-center justify-between">
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
          <Link
            href="/bookings"
            className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/25"
          >
            ჩემი ჯავშნები
          </Link>
        </div>
        <h1 className="mt-6 text-5xl font-extrabold leading-tight">
          აღმოაჩინე, დაჯავშნე, გადაიხადე — ერთ აპში
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/80">
          სალონები · რესტორნები · კაფეები · ბარები — საქართველოს მასშტაბით.
        </p>
      </header>

      <CategorySections venues={items} />

      <footer className="mt-16 flex flex-col gap-3 border-t border-ink-200 pt-6 text-sm text-ink-500 dark:border-ink-700 dark:text-ink-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© Checkin Georgia · {items.length} ვენიუ</p>
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:text-brand">კონფიდენციალურობა</Link>
          <Link href="/terms" className="hover:text-brand">წესები</Link>
          <Link href="/cookies" className="hover:text-brand">ქუქი</Link>
        </nav>
      </footer>
    </main>
  );
}
