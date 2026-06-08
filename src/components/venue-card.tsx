import Link from "next/link";
import { VERTICAL_CONFIG } from "@/lib/verticals";
import { districtLabel } from "@/lib/districts";
import type { VenueCardData } from "@/lib/personalization";
import { FavoriteButton } from "./favorite-button";
import { OpenNowBadge } from "./open-now-badge";

/** Reusable venue card — cover, rating, price, district, heart.
 *  Used by the landing sections, favorites, recently-viewed, and the feed. */
export function VenueCard({
  venue,
  label,
}: {
  venue: VenueCardData;
  label?: string;
}) {
  const cfg = VERTICAL_CONFIG[venue.vertical];
  const price =
    typeof venue.attributes?.priceRange === "string"
      ? (venue.attributes.priceRange as string)
      : null;
  const rating = venue.avg_rating && venue.avg_rating > 0 ? venue.avg_rating : null;

  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-ink-200 bg-white transition hover:border-brand hover:shadow-md dark:border-ink-700 dark:bg-ink-800"
    >
      {/* Cover */}
      <div className="relative h-40 w-full overflow-hidden bg-sunset">
        {venue.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venue.cover_url}
            alt={venue.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-5xl opacity-90"
            aria-hidden
          >
            {cfg?.icon}
          </div>
        )}
        <div className="absolute right-2 top-2">
          <FavoriteButton venueId={venue.id} />
        </div>
        {price && (
          <span className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur">
            {price}
          </span>
        )}
        <OpenNowBadge openNow={venue.open_now} className="absolute bottom-2 left-2" />
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            {label ?? cfg?.label}
          </p>
          {rating && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-ink-500">
              <span className="text-gold">★</span>
              {rating.toFixed(1)}
              {venue.review_count ? (
                <span className="text-ink-400">({venue.review_count})</span>
              ) : null}
            </span>
          )}
        </div>
        <h3 className="mt-1 truncate text-lg font-semibold text-ink-900 dark:text-ink-50">
          {venue.name}
        </h3>
        <p className="mt-0.5 truncate text-sm text-ink-600 dark:text-ink-300">
          {venue.district ? `${districtLabel(venue.district)} · ` : ""}
          {venue.address}
          {venue.distance_km != null ? ` · ${venue.distance_km} კმ` : ""}
        </p>
        {venue.description && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">
            {venue.description}
          </p>
        )}
      </div>
    </Link>
  );
}
