"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, type PaymentProvider } from "@/lib/api";

const PROVIDERS: { id: PaymentProvider; label: string }[] = [
  { id: "bog", label: "BOG" },
  { id: "tbc", label: "TBC" },
  { id: "apple_pay", label: "Apple Pay" },
  { id: "google_pay", label: "Google Pay" },
];

export function PayButtons({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<PaymentProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pay(provider: PaymentProvider) {
    setActive(provider);
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`${apiUrl}/payments/mock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking_id: bookingId, provider }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "გადახდის შეცდომა");
        setActive(null);
      }
    });
  }

  return (
    <>
      <p className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-200">
        გადახდის მეთოდი
      </p>
      <p className="mb-3 text-xs text-ink-500 dark:text-ink-400">
        ⚠ MVP — გადახდები mock-ია. რეალური BOG/TBC API მერე ჩაერთვება.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={pending}
            onClick={() => pay(p.id)}
            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium transition hover:border-accent hover:bg-accent hover:text-white disabled:opacity-50 dark:border-ink-700 dark:text-ink-200"
          >
            {pending && active === p.id ? "..." : p.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </>
  );
}
