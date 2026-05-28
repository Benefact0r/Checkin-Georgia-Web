"use client";

import { getOverview } from "@/lib/admin-api";
import { formatPrice } from "@/lib/api";
import { useAuth } from "./auth-provider";
import { useAuthedData } from "./use-authed-data";

const STATUS_LABEL: Record<string, string> = {
  pending: "მოლოდინში",
  confirmed: "დადასტურებული",
  cancelled: "გაუქმებული",
  completed: "შესრულებული",
  no_show: "არ მოვიდა",
};

export default function OverviewPage() {
  const { profile } = useAuth();
  const { data, error, loading } = useAuthedData(getOverview);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">მიმოხილვა</h1>
        <p className="mt-1 text-sm text-ink-500">
          {profile?.role === "admin"
            ? "მთელი პლატფორმის მაჩვენებლები"
            : "შენი ადგილების მაჩვენებლები"}
        </p>
      </header>

      {error && (
        <p className="rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700">
          {error}
        </p>
      )}

      {loading && !data ? (
        <p className="text-sm text-ink-400">იტვირთება…</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi label="ადგილები" value={data.venues} />
            <Kpi label="ჯავშნები" value={data.bookings} />
            <Kpi
              label="შემოსავალი"
              value={formatPrice(data.revenue_minor, "GEL")}
            />
            <Kpi label="კლიენტები" value={data.customers} />
          </div>

          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-ink-700">
              ჯავშნები სტატუსით
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.bookings_by_status).length === 0 ? (
                <span className="text-sm text-ink-400">ჯერ ჯავშნები არ არის</span>
              ) : (
                Object.entries(data.bookings_by_status).map(([status, n]) => (
                  <span
                    key={status}
                    className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
                  >
                    {STATUS_LABEL[status] ?? status}:{" "}
                    <span className="font-semibold text-ink-900">{n}</span>
                  </span>
                ))
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-extrabold text-ink-900">{value}</p>
    </div>
  );
}
