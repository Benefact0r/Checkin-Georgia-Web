import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";

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
    <html lang="ka" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
