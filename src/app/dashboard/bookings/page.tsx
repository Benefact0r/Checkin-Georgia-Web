"use client";

import { useCallback, useState } from "react";
import { getAdminBookings, type AdminBooking } from "@/lib/admin-api";
import { formatPrice } from "@/lib/api";
import { useAuthedData } from "../use-authed-data";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "ყველა სტატუსი" },
  { value: "pending", label: "მოლოდინში" },
  { value: "confirmed", label: "დადასტურებული" },
  { value: "completed", label: "შესრულებული" },
  { value: "cancelled", label: "გაუქმებული" },
  { value: "no_show", label: "არ მოვიდა" },
];

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold/15 text-gold",
  confirmed: "bg-success/10 text-success",
  completed: "bg-brand-50 text-brand-700",
  cancelled: "bg-accent-50 text-accent-700",
  no_show: "bg-accent-50 text-accent-700",
};

export default function BookingsPage() {
  const [status, setStatus] = useState("");
  const fetcher = useCallback(
    (t: string) => getAdminBookings(t, { status: status || undefined }),
    [status],
  );
  const { data, error, loading } = useAuthedData(fetcher, [status]);

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">ჯავშნები</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-ink-200 bg-white px-4 py-1.5 text-sm text-ink-700 focus:border-brand focus:outline-none"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </header>

      {error && (
        <p className="rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700">
          {error}
        </p>
      )}

      {loading && !data ? (
        <p className="text-sm text-ink-400">იტვირთება…</p>
      ) : data && data.items.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3">დრო</th>
                <th className="px-4 py-3">ადგილი</th>
                <th className="px-4 py-3">სერვისი</th>
                <th className="px-4 py-3">კლიენტი</th>
                <th className="px-4 py-3">თანხა</th>
                <th className="px-4 py-3">სტატუსი</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {data.items.map((b) => (
                <Row key={b.id} b={b} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-ink-400">ჯავშნები ვერ მოიძებნა.</p>
      )}
    </div>
  );
}

function Row({ b }: { b: AdminBooking }) {
  const total = typeof b.total_minor === "string" ? Number(b.total_minor) : b.total_minor;
  return (
    <tr>
      <td className="px-4 py-3 text-ink-600">
        {new Date(b.starts_at).toLocaleString("ka-GE", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="px-4 py-3 font-medium text-ink-900">{b.venue_name}</td>
      <td className="px-4 py-3 text-ink-600">{b.service_name}</td>
      <td className="px-4 py-3 text-ink-600">
        {b.customer_name ?? "—"}
        {b.customer_phone ? (
          <span className="block text-xs text-ink-400">{b.customer_phone}</span>
        ) : null}
      </td>
      <td className="px-4 py-3 text-ink-600">
        {total > 0 ? formatPrice(total, b.currency) : "—"}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            STATUS_STYLE[b.status] ?? "bg-ink-100 text-ink-500"
          }`}
        >
          {b.status}
        </span>
      </td>
    </tr>
  );
}
