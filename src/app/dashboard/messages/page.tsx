"use client";

import { useState } from "react";
import {
  getMessages,
  replyMessage,
  markMessageRead,
  type AdminMessage,
} from "@/lib/admin-api";
import { formatDateTime } from "@/lib/datetime";
import { useAuth } from "../auth-provider";
import { useAuthedData } from "../use-authed-data";

export default function MessagesPage() {
  const [refresh, setRefresh] = useState(0);
  const { data, error, loading } = useAuthedData(getMessages, [refresh]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50">შეტყობინებები</h1>
        <p className="mt-1 text-sm text-ink-500">კლიენტებისგან მიღებული მესიჯები</p>
      </header>

      {error && (
        <p className="rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700">{error}</p>
      )}

      {loading && !data ? (
        <p className="text-sm text-ink-400">იტვირთება…</p>
      ) : data && data.items.length > 0 ? (
        <ul className="space-y-3">
          {data.items.map((m) => (
            <MessageCard key={m.id} m={m} onChanged={() => setRefresh((n) => n + 1)} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-400">ჯერ შეტყობინებები არ არის.</p>
      )}
    </div>
  );
}

function MessageCard({ m, onChanged }: { m: AdminMessage; onChanged: () => void }) {
  const { token } = useAuth();
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!reply.trim()) return;
    setBusy(true);
    try {
      await replyMessage(await token(), m.id, reply.trim());
      setReply("");
      setOpen(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  }
  async function markRead() {
    await markMessageRead(await token(), m.id);
    onChanged();
  }

  return (
    <li
      className={`rounded-2xl border p-4 ${
        m.read_at
          ? "border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800"
          : "border-brand-200 bg-brand-50 dark:border-brand-700 dark:bg-brand-900/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
            {m.sender_name ?? "სტუმარი"}
            {m.sender_phone ? <span className="font-normal text-ink-400"> · {m.sender_phone}</span> : null}
          </p>
          <p className="text-xs text-ink-400">{m.venue_name} · {formatDateTime(m.created_at)}</p>
        </div>
        {!m.read_at && (
          <button onClick={markRead} className="text-xs text-brand hover:underline">წაკითხულად მონიშვნა</button>
        )}
      </div>
      <p className="mt-2 text-sm text-ink-700 dark:text-ink-300">{m.body}</p>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={() => setOpen((v) => !v)} className="text-xs font-medium text-brand hover:underline">
          {open ? "დახურვა" : "პასუხი"}
        </button>
        {m.replies > 0 && <span className="text-xs text-ink-400">{m.replies} პასუხი</span>}
      </div>
      {open && (
        <div className="mt-2 flex gap-2">
          <input
            className="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand focus:outline-none dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
            placeholder="პასუხი…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <button
            onClick={send}
            disabled={busy}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
          >
            გაგზავნა
          </button>
        </div>
      )}
    </li>
  );
}
