/** Loading placeholders that match the venue-card footprint. */

export function VenueCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800">
      <div className="h-40 w-full animate-pulse bg-ink-100 dark:bg-ink-700" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-ink-100 dark:bg-ink-700" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-ink-100 dark:bg-ink-700" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-ink-100 dark:bg-ink-700" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <VenueCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-64 shrink-0">
          <VenueCardSkeleton />
        </div>
      ))}
    </div>
  );
}
