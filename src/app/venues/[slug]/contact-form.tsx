"use client";

import { useState } from "react";
import { contactVenue } from "@/lib/api";

const input =
  "mt-1 block w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100";

export function ContactForm({ slug }: { slug: string }) {
  const [f, setF] = useState({ name: "", phone: "", body: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setErr(null);
    try {
      await contactVenue(slug, {
        name: f.name || undefined,
        phone: f.phone || undefined,
        body: f.body,
      });
      setState("sent");
      setF({ name: "", phone: "", body: "" });
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "ვერ გაიგზავნა");
      setState("error");
    }
  }

  if (state === "sent")
    return (
      <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-sm text-success">
        ✓ შეტყობინება გაიგზავნა — ვენიუ მალე დაგიკავშირდებათ.
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className={input} placeholder="სახელი" value={f.name} onChange={(e) => set("name", e.target.value)} />
        <input className={input} placeholder="ტელეფონი" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>
      <textarea
        className={input}
        rows={3}
        required
        placeholder="შეტყობინება…"
        value={f.body}
        onChange={(e) => set("body", e.target.value)}
      />
      {err && <p className="text-sm text-accent-700">{err}</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-50"
      >
        {state === "sending" ? "იგზავნება…" : "გაგზავნა"}
      </button>
    </form>
  );
}
