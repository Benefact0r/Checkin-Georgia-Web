"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { firebaseConfigured } from "@/lib/firebase";
import { useAuth } from "./auth-provider";
import { LoginForm } from "./login-form";

const NAV: {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
  adminOnly?: boolean;
}[] = [
  { href: "/dashboard", label: "მიმოხილვა", icon: "📊", exact: true },
  { href: "/dashboard/venues", label: "ადგილები", icon: "🏠" },
  { href: "/dashboard/bookings", label: "ჯავშნები", icon: "📅" },
  { href: "/dashboard/customers", label: "კლიენტები", icon: "👥" },
  {
    href: "/dashboard/users",
    label: "მომხმარებლები",
    icon: "🔑",
    adminOnly: true,
  },
];

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 text-sm text-ink-500">
      {children}
    </div>
  );
}

function ConfigNotice() {
  return (
    <Centered>
      <div className="max-w-md rounded-2xl border border-dashed border-ink-200 bg-white p-6 text-center">
        <p className="font-semibold text-ink-700">Firebase არ არის კონფიგურირებული</p>
        <p className="mt-2 text-xs text-ink-500">
          დააყენე <code className="rounded bg-ink-100 px-1">NEXT_PUBLIC_FIREBASE_*</code>{" "}
          ცვლადები (apiKey, authDomain, projectId, appId) და გადატვირთე.
        </p>
      </div>
    </Centered>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, logout } = useAuth();
  const pathname = usePathname();

  if (!firebaseConfigured) return <ConfigNotice />;
  if (loading) return <Centered>იტვირთება…</Centered>;
  if (!user) return <LoginForm />;

  const nav = NAV.filter((n) => !n.adminOnly || profile?.role === "admin");
  const isActive = (n: (typeof NAV)[number]) =>
    n.exact ? pathname === n.href : pathname.startsWith(n.href);

  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-ink-200 bg-white">
        <div className="flex items-center gap-2 px-5 py-5">
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
          <span className="font-bold tracking-tight text-ink-900">
            checkin <span className="text-ink-400">admin</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(n)
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-600 hover:bg-ink-50"
              }`}
            >
              <span aria-hidden>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-ink-200 p-4">
          <p className="truncate text-xs font-medium text-ink-700">
            {profile?.email ?? user.email}
          </p>
          <p className="text-xs text-ink-400">
            {profile?.role === "admin"
              ? "ადმინი"
              : profile?.role === "business_owner"
                ? "ბიზნესი"
                : "მომხმარებელი"}
          </p>
          <button
            onClick={() => logout()}
            className="mt-2 text-xs text-accent hover:underline"
          >
            გასვლა
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}
