import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Checkin Georgia",
  description:
    "Discover, book, and pay at salons, restaurants, cafes, and bars across Georgia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ka">
      <body>{children}</body>
    </html>
  );
}
