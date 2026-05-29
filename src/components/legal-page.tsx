import Link from "next/link";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-brand hover:underline">
        ← მთავარი
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-ink-900 dark:text-ink-50">
        {title}
      </h1>
      <p className="mt-1 text-xs text-ink-400">განახლდა: 2026-05-29</p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-700 dark:text-ink-300">
        {children}
      </div>
    </main>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="pt-2 text-lg font-bold text-ink-900 dark:text-ink-100">
      {children}
    </h2>
  );
}
