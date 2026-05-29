"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "cookie-consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  function decide(value: "accepted" | "rejected") {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-lg dark:border-ink-700 dark:bg-ink-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-600 dark:text-ink-300">
          ჩვენ ვიყენებთ ქუქი-ფაილებს საიტის გასაუმჯობესებლად. იხილე{" "}
          <Link href="/cookies" className="text-brand underline">
            ქუქი-პოლიტიკა
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => decide("rejected")}
            className="rounded-lg border border-ink-200 px-4 py-2 text-sm text-ink-600 dark:border-ink-700 dark:text-ink-300"
          >
            უარყოფა
          </button>
          <button
            onClick={() => decide("accepted")}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600"
          >
            თანხმობა
          </button>
        </div>
      </div>
    </div>
  );
}
