"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const FRIENDLY: Record<string, string> = {
  "auth/invalid-credential": "არასწორი ელ-ფოსტა ან პაროლი",
  "auth/invalid-email": "არასწორი ელ-ფოსტა",
  "auth/email-already-in-use": "ეს ელ-ფოსტა უკვე გამოყენებულია",
  "auth/weak-password": "პაროლი ძალიან სუსტია (მინ. 6 სიმბოლო)",
};

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(FRIENDLY[code] ?? (err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-6 dark:bg-ink-900">
      <div className="w-full max-w-sm rounded-3xl border border-ink-200 bg-white p-8 shadow-sm dark:border-ink-700 dark:bg-ink-800">
        <div className="mb-6 flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="#6D28E8"
            />
            <path
              d="M8.6 9.2l2.2 2.2 4.4-4.6"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span className="text-lg font-bold tracking-tight text-ink-900">
            checkin <span className="text-ink-400">admin</span>
          </span>
        </div>

        <h1 className="text-xl font-bold text-ink-900 dark:text-ink-50">
          {mode === "signin" ? "შესვლა" : "რეგისტრაცია"}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          ბიზნესის და ადმინის პანელი
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-600">
              ელ-ფოსტა
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-600">
              პაროლი
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-50"
          >
            {busy
              ? "..."
              : mode === "signin"
                ? "შესვლა"
                : "ანგარიშის შექმნა"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
          className="mt-4 w-full text-center text-xs text-brand hover:underline"
        >
          {mode === "signin"
            ? "ანგარიში არ გაქვს? შექმენი"
            : "უკვე გაქვს ანგარიში? შედი"}
        </button>
      </div>
    </div>
  );
}
