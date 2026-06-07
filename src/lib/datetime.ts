// All venue times are Asia/Tbilisi. Always format in that zone so a booking
// reads the same wall-clock time regardless of the viewer's device timezone.
const TZ = "Asia/Tbilisi";

export function formatDateTime(
  iso: string | Date,
  opts: Intl.DateTimeFormatOptions = {},
): string {
  return new Date(iso).toLocaleString("ka-GE", { timeZone: TZ, ...opts });
}

export function formatDate(
  iso: string | Date,
  opts: Intl.DateTimeFormatOptions = {},
): string {
  return new Date(iso).toLocaleDateString("ka-GE", { timeZone: TZ, ...opts });
}
