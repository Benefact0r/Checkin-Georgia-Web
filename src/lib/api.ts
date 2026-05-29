const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://checkin-georgia-api-171625154738.europe-west1.run.app";

export type Vertical =
  | "salon"
  | "restaurant"
  | "cafe"
  | "bar"
  | "night_club"
  | "spa";

export interface Venue {
  id: string;
  slug: string;
  name: string;
  vertical: Vertical;
  description: string | null;
  address: string;
  city: string;
  district: string | null;
  cover_url: string | null;
  photos: string[];
  videos: string[];
  attributes: Record<string, unknown>;
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
    kind: "staff" | "table" | "seat" | "queue" | "room";
    capacity: number;
    photo_url: string | null;
    bio: string | null;
    position: number;
    attributes: Record<string, unknown>;
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

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type PaymentProvider =
  | "bog"
  | "tbc"
  | "apple_pay"
  | "google_pay"
  | "mock";

export interface PaymentRow {
  id: string;
  provider: PaymentProvider;
  status: "pending" | "succeeded" | "failed" | "refunded";
  amount_minor: number;
  created_at: string;
  is_mock: boolean;
}

export interface BookingDetail {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  starts_at: string;
  ends_at: string;
  party_size: number;
  notes: string | null;
  total_minor: string | number;
  currency: string;
  status: BookingStatus;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  // joins
  venue_id: string;
  venue_slug: string;
  venue_name: string;
  vertical: Vertical;
  venue_address: string;
  service_id: string;
  service_name: string;
  duration_minutes: number | null;
  payment_mode: "on_site" | "deposit" | "prepay";
  resource_id: string;
  resource_name: string;
  resource_kind: string;
  payments: PaymentRow[] | null;
}

export async function getBooking(id: string): Promise<BookingDetail> {
  const res = await fetch(`${API_URL}/bookings/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`booking_fetch_failed: ${res.status}`);
  return res.json();
}

export async function contactVenue(
  slug: string,
  body: { name?: string; phone?: string; email?: string; body: string },
): Promise<{ ok: true }> {
  const res = await fetch(`${API_URL}/venues/${slug}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const apiUrl = API_URL;
