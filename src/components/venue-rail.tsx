import { VenueCard } from "./venue-card";
import type { VenueCardData } from "@/lib/personalization";

/** A titled, horizontally-scrolling row of venue cards. */
export function VenueRail({
  title,
  venues,
  action,
}: {
  title: string;
  venues: VenueCardData[];
  action?: React.ReactNode;
}) {
  if (!venues.length) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">{title}</h2>
        {action}
      </div>
      <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {venues.map((v) => (
          <div key={v.id} className="w-64 shrink-0 snap-start">
            <VenueCard venue={v} />
          </div>
        ))}
      </div>
    </section>
  );
}
