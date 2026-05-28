const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://checkin-georgia-api-171625154738.europe-west1.run.app";

export type Vertical = "salon" | "restaurant" | "cafe" | "bar";

export interface Venue {
  id: string;
  slug: string;
  name: string;
  vertical: Vertical;
  description: string | null;
  address: string;
  city: string;
  cover_url: string | null;
  photos: string[];
  lng: number | null;
  lat: number | null;
}

export interface VenueDetail extends Venue {
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: Record<string, [string, string][]>;
  resources: Array<{
    id: string;
    name: string;
    kind: "staff" | "table" | "seat" | "queue";
    capacity: number;
    photo_url: string | null;
    bio: string | null;
    position: number;
  }>;
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    duration_minutes: number | null;
    price_minor: number | null;
    currency: string;
    photo_url: string | null;
    payment_mode: "on_site" | "deposit" | "prepay";
    deposit_minor: number | null;
    position: number;
  }>;
  avg_rating: number | null;
  review_count: number;
}

export async function listVenues(params: {
  vertical?: Vertical;
  q?: string;
  limit?: number;
} = {}): Promise<{ items: Venue[] }> {
  const url = new URL(`${API_URL}/venues`);
  if (params.vertical) url.searchParams.set("vertical", params.vertical);
  if (params.q) url.searchParams.set("q", params.q);
  url.searchParams.set("limit", String(params.limit ?? 30));
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`venues_fetch_failed: ${res.status}`);
  return res.json();
}

export async function getVenue(slug: string): Promise<VenueDetail> {
  const res = await fetch(`${API_URL}/venues/${slug}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`venue_fetch_failed: ${res.status}`);
  return res.json();
}

export function formatPrice(minor: number | null, currency = "GEL"): string {
  if (minor == null) return "—";
  const major = minor / 100;
  return `${major.toFixed(0)} ${currency}`;
}
