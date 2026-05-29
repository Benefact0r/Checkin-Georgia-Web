import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/cookie-consent";
import { ThemeToggle } from "@/components/theme-toggle";

// Sets html.dark before first paint (no flash). Honors stored choice, else OS.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

// Georgian-capable brand font. Single family covers ka + latin for script
// consistency. Swap to FiraGO (bundled) later for more character.
const sans = Noto_Sans_Georgian({
  subsets: ["georgian", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Checkin Georgia",
  description:
    "Discover, book, and pay at salons, restaurants, cafes, and bars across Georgia.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ka" className={sans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <div className="fixed right-4 top-4 z-40">
          <ThemeToggle />
        </div>
        <CookieConsent />
      </body>
    </html>
  );
}
