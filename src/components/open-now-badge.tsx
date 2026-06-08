/** Open-now pill. Renders nothing when status is unknown (null/undefined) so we
 *  never falsely claim a venue is "closed" when we simply don't know its hours. */
export function OpenNowBadge({
  openNow,
  className = "",
}: {
  openNow?: boolean | null;
  className?: string;
}) {
  if (openNow == null) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold backdrop-blur ${
        openNow
          ? "bg-emerald-600/90 text-white"
          : "bg-black/55 text-ink-100"
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${openNow ? "bg-white" : "bg-ink-300"}`}
        aria-hidden
      />
      {openNow ? "ღიაა ახლა" : "დახურულია"}
    </span>
  );
}
