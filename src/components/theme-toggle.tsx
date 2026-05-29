"use client";

import { useEffect, useState } from "react";

/** Toggles `html.dark` and persists the choice. Pairs with the no-flash
 * script in layout.tsx that sets the class before first paint. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="თემის გადართვა"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-base transition hover:border-brand dark:border-ink-700 dark:bg-ink-800 ${className}`}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
