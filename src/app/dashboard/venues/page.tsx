"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createVenue,
  getAdminVenues,
  type CreateVenueInput,
} from "@/lib/admin-api";
import { VERTICAL_LIST } from "@/lib/verticals";
import { useAuth } from "../auth-provider";
import { useAuthedData } from "../use-authed-data";

const VERTICALS = VERTICAL_LIST.map((c) => ({ value: c.key, label: c.label }));

const STATUS_STYLE: Record<string, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-gold/15 text-gold",
  paused: "bg-ink-100 text-ink-500",
  archived: "bg-ink-100 text-ink-400",
};

export default function VenuesPage() {
  const { profile, token } = useAuth();
  const router = useRouter();
  const isAdmin = profile?.role === "admin";
  const { data, error, loading } = useAuthedData(getAdminVenues);

  const [open, setOpen] = useState(false);

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">ადგილები</h1>
          <p className="mt-1 text-sm text-ink-500">
            {isAdmin ? "ყველა ადგილი" : "შენი ადგილები"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-600"
          >
            {open ? "დახურვა" : "+ ახალი ადგილი"}
          </button>
        )}
      </header>

      {open && isAdmin && (
        <AddVenueForm
          createFn={(body) => token().then((t) => createVenue(t, body))}
          onCreated={(id) => router.push(`/dashboard/venues/${id}`)}
        />
      )}

      {error && (
        <p className="rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700">
          {error}
        </p>
      )}

      {loading && !data ? (
        <p className="text-sm text-ink-400">იტვირთება…</p>
      ) : data && data.items.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3">სახელი</th>
                <th className="px-4 py-3">ტიპი</th>
                <th className="px-4 py-3">ლოკაცია</th>
                <th className="px-4 py-3">სტატუსი</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {data.items.map((v) => (
                <tr key={v.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/dashboard/venues/${v.id}`}
                      className="text-brand hover:underline"
                    >
                      {v.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{v.vertical}</td>
                  <td className="px-4 py-3 text-ink-600">
                    {v.district ? `${v.district} · ` : ""}
                    {v.address}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLE[v.status] ?? "bg-ink-100 text-ink-500"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-ink-400">ჯერ ადგილები არ არის.</p>
      )}
    </div>
  );
}

function AddVenueForm({
  createFn,
  onCreated,
}: {
  createFn: (body: CreateVenueInput) => Promise<{ id: string }>;
  onCreated: (id: string) => void;
}) {
  const [form, setForm] = useState<CreateVenueInput>({
    slug: "",
    name: "",
    vertical: "salon",
    address: "",
    city: "Tbilisi",
    district: "",
    description: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof CreateVenueInput, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await createFn({
        ...form,
        district: form.district?.trim() || undefined,
        description: form.description?.trim() || undefined,
      });
      onCreated(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ვერ შეიქმნა");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-ink-200 bg-white p-5 md:grid-cols-2"
    >
      <Field label="სახელი">
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputCls}
        />
      </Field>
      <Field label="Slug (URL)">
        <input
          required
          value={form.slug}
          onChange={(e) =>
            set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
          }
          placeholder="demo-salon"
          className={inputCls}
        />
      </Field>
      <Field label="ტიპი">
        <select
          value={form.vertical}
          onChange={(e) => set("vertical", e.target.value)}
          className={inputCls}
        >
          {VERTICALS.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="უბანი (district)">
        <input
          value={form.district}
          onChange={(e) => set("district", e.target.value)}
          placeholder="Vake"
          className={inputCls}
        />
      </Field>
      <Field label="მისამართი">
        <input
          required
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          className={inputCls}
        />
      </Field>
      <Field label="ქალაქი">
        <input
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
          className={inputCls}
        />
      </Field>
      <div className="md:col-span-2">
        <Field label="აღწერა">
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className={inputCls}
          />
        </Field>
      </div>

      {error && (
        <p className="md:col-span-2 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">
          {error}
        </p>
      )}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-50"
        >
          {busy ? "იქმნება…" : "შექმნა"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "mt-1 block w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-600">{label}</span>
      {children}
    </label>
  );
}
