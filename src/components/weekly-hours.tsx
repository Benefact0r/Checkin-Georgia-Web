// Weekly opening-hours table. Renders nothing when hours are unknown (empty {}),
// so we never show a misleading all-closed schedule. Today (Asia/Tbilisi) is
// highlighted. `hours` shape: { mon: [["09:00","20:00"]], ... }.

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const DAY_LABEL: Record<string, string> = {
  mon: "ორშაბათი",
  tue: "სამშაბათი",
  wed: "ოთხშაბათი",
  thu: "ხუთშაბათი",
  fri: "პარასკევი",
  sat: "შაბათი",
  sun: "კვირა",
};

function tbilisiTodayKey(): string {
  // "Mon".."Sun" in Asia/Tbilisi → "mon".."sun" (matches the hours keys).
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Asia/Tbilisi",
  })
    .format(new Date())
    .toLowerCase();
}

export function WeeklyHours({
  hours,
}: {
  hours?: Record<string, [string, string][]> | null;
}) {
  if (!hours || Object.keys(hours).length === 0) return null;
  const today = tbilisiTodayKey();

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50">
        სამუშაო საათები
      </h2>
      <ul className="mt-3 max-w-sm divide-y divide-ink-100 rounded-2xl border border-ink-200 bg-white dark:divide-ink-700 dark:border-ink-700 dark:bg-ink-800">
        {DAY_ORDER.map((d) => {
          const intervals = hours[d] ?? [];
          const isToday = d === today;
          return (
            <li
              key={d}
              className={`flex items-center justify-between px-4 py-2 text-sm ${
                isToday ? "font-semibold text-brand" : "text-ink-700 dark:text-ink-300"
              }`}
            >
              <span>{DAY_LABEL[d]}</span>
              <span>
                {intervals.length
                  ? intervals.map(([o, c]) => `${o}–${c}`).join(", ")
                  : "დაკეტილია"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
