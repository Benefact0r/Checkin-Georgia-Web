"use client";

import { useEffect, useState } from "react";
import { getUsers, setUserRole, type AdminUser, type Role } from "@/lib/admin-api";
import { useAuth } from "../auth-provider";
import { useAuthedData } from "../use-authed-data";

const ROLES: { value: Role; label: string }[] = [
  { value: "user", label: "მომხმარებელი" },
  { value: "business_owner", label: "ბიზნესი" },
  { value: "admin", label: "ადმინი" },
];

export default function UsersPage() {
  const { profile, token } = useAuth();
  const { data, error, loading } = useAuthedData(getUsers);
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (data) setRows(data.items);
  }, [data]);

  if (profile && profile.role !== "admin") {
    return (
      <p className="rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700">
        წვდომა აკრძალულია — მხოლოდ ადმინისთვის.
      </p>
    );
  }

  async function changeRole(id: string, role: Role) {
    setSavingId(id);
    try {
      const t = await token();
      await setUserRole(t, id, role);
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, role } : r)));
    } catch {
      // leave as-is; a refetch would resync
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">მომხმარებლები</h1>
        <p className="mt-1 text-sm text-ink-500">როლების მართვა</p>
      </header>

      {error && (
        <p className="rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700">
          {error}
        </p>
      )}

      {loading && rows.length === 0 ? (
        <p className="text-sm text-ink-400">იტვირთება…</p>
      ) : rows.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3">სახელი</th>
                <th className="px-4 py-3">ელ-ფოსტა</th>
                <th className="px-4 py-3">ტელეფონი</th>
                <th className="px-4 py-3">როლი</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {u.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{u.email ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-600">{u.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={savingId === u.id}
                      onChange={(e) => changeRole(u.id, e.target.value as Role)}
                      className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm focus:border-brand focus:outline-none disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-ink-400">მომხმარებლები არ არის.</p>
      )}
    </div>
  );
}
