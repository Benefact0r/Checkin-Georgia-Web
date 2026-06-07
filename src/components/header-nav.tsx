"use client";

import Link from "next/link";
import { useFavorites } from "@/contexts/favorites-context";

const pill =
  "rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/25";

/** Top-right nav for the public header. Shows live favorites count. */
export function HeaderNav() {
  const { count } = useFavorites();

  return (
    <nav className="flex flex-wrap items-center justify-end gap-2">
      <Link href="/preferences" className={pill}>
        🎯 გემოვნება
      </Link>
      <Link href="/favorites" className={pill}>
        ❤️ ფავორიტები
        {count > 0 && (
          <span className="ml-1.5 rounded-full bg-white/25 px-1.5 text-xs">
            {count}
          </span>
        )}
      </Link>
      <Link href="/bookings" className={pill}>
        ჩემი ჯავშნები
      </Link>
    </nav>
  );
}
