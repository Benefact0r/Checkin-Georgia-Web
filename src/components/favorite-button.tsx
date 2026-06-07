"use client";

import { useFavorites } from "@/contexts/favorites-context";

/** Heart toggle. Safe to drop inside a <Link> — it stops propagation. */
export function FavoriteButton({
  venueId,
  className = "",
}: {
  venueId: string;
  className?: string;
}) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(venueId);

  return (
    <button
      type="button"
      aria-pressed={fav}
      aria-label={fav ? "ფავორიტებიდან მოშორება" : "ფავორიტებში დამატება"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(venueId);
      }}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-accent shadow-sm backdrop-blur transition hover:scale-110 active:scale-95 dark:bg-ink-900/70 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        fill={fav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21s-6.716-4.297-9.193-8.243C1.07 9.61 2.343 6 5.5 6c2.04 0 3.3 1.265 4 2.343C10.2 7.265 11.46 6 13.5 6c3.157 0 4.43 3.61 2.693 6.757C18.716 16.703 12 21 12 21z"
        />
      </svg>
    </button>
  );
}
