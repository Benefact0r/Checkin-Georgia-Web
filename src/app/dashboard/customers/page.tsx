"use client";

import { getCustomers } from "@/lib/admin-api";
import { useAuthedData } from "../use-authed-data";

export default function CustomersPage() {
  const { data, error, loading } = useAuthedData(getCustomers);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">კლიენტები</h1>
        <p className="mt-1 text-sm text-ink-500">
          ვინ დაჯავშნა შენს ადგილებში
        </p>
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
                <th className="px-4 py-3">სახელი</th>
                <th className="px-4 py-3">ტელეფონი</th>
                <th className="px-4 py-3">ელ-ფოსტა</th>
                <th className="px-4 py-3">ჯავშნები</th>
                <th className="px-4 py-3">ბოლო ვიზიტი</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {data.items.map((c, i) => (
                <tr key={c.user_id ?? `${c.phone}-${i}`}>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {c.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-600">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-600">{c.bookings}</td>
                  <td className="px-4 py-3 text-ink-600">
                    {c.last_booking
                      ? new Date(c.last_booking).toLocaleDateString("ka-GE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-ink-400">ჯერ კლიენტები არ არის.</p>
      )}
    </div>
  );
}
