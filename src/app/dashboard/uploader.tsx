"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/api";
import { useAuth } from "./auth-provider";

/**
 * Uploads a single file to the API (which stores it in the private media
 * bucket) and returns the public URL `${apiUrl}/media/<key>`.
 */
export function Uploader({
  accept = "image/*",
  label = "📤 ატვირთვა",
  onUploaded,
}: {
  accept?: string;
  label?: string;
  onUploaded: (url: string) => void;
}) {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const t = await token();
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${apiUrl}/admin/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
        body: fd,
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? `HTTP ${res.status}`);
      }
      const { key } = (await res.json()) as { key: string };
      onUploaded(`${apiUrl}/media/${key}`);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "ატვირთვა ვერ მოხერხდა");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <label className="cursor-pointer rounded-lg border border-ink-200 px-3 py-1.5 text-sm text-ink-600 transition hover:border-brand hover:text-brand">
        {busy ? "იტვირთება…" : label}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={onPick}
          disabled={busy}
        />
      </label>
      {err && <span className="text-xs text-accent-700">{err}</span>}
    </span>
  );
}
