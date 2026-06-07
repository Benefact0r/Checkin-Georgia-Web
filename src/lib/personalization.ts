// Client-side personalization API. All calls carry the anonymous session id.
import { getSessionId } from "./session";
import type { Venue } from "./api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://checkin-georgia-api-171625154738.europe-west1.run.app";

// A venue plus the personalization extras the feed/favorites endpoints add.
export interface VenueCardData extends Venue {
  tags?: string[];
  favorite_count?: number;
  avg_rating?: number;
  review_count?: number;
  distance_km?: number;
}

export interface FeedSection {
  key: "for_you" | "near_you" | "popular";
  title: string;
  venues: VenueCardData[];
}

export interface PersonalizedFeed {
  sections: FeedSection[];
  meta: {
    cold_start: boolean;
    has_preferences: boolean;
    has_geo: boolean;
    signal_count: number;
  };
}

export interface Preferences {
  favorite_verticals: string[];
  preferred_districts: string[];
  price_tiers: string[];
  tags: string[];
  onboarded_at: string | null;
}

function headers(json = false): Record<string, string> {
  const h: Record<string, string> = { "X-Checkin-Session": getSessionId() };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

/** Fire-and-forget view log. Never throws. */
export async function logVenueView(venueId: string, source = "detail"): Promise<void> {
  try {
    await fetch(`${API_URL}/views`, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({ venue_id: venueId, source }),
      keepalive: true,
    });
  } catch {
    /* analytics — swallow */
  }
}

export async function getFavorites(): Promise<VenueCardData[]> {
  try {
    const res = await fetch(`${API_URL}/favorites`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()).items ?? [];
  } catch {
    return [];
  }
}

export async function addFavorite(venueId: string): Promise<void> {
  await fetch(`${API_URL}/favorites/${venueId}`, { method: "POST", headers: headers() });
}

export async function removeFavorite(venueId: string): Promise<void> {
  await fetch(`${API_URL}/favorites/${venueId}`, { method: "DELETE", headers: headers() });
}

export async function getRecentlyViewed(): Promise<VenueCardData[]> {
  try {
    const res = await fetch(`${API_URL}/recently-viewed`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()).items ?? [];
  } catch {
    return [];
  }
}

export async function getPreferences(): Promise<Preferences> {
  const res = await fetch(`${API_URL}/preferences`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`preferences_fetch_failed: ${res.status}`);
  return res.json();
}

export async function savePreferences(
  patch: Partial<Omit<Preferences, "onboarded_at">>,
): Promise<Preferences> {
  const res = await fetch(`${API_URL}/preferences`, {
    method: "PUT",
    headers: headers(true),
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`preferences_save_failed: ${res.status}`);
  return res.json();
}

export async function getFeed(geo?: { lat: number; lng: number }): Promise<PersonalizedFeed> {
  const url = new URL(`${API_URL}/feed`);
  if (geo) {
    url.searchParams.set("lat", String(geo.lat));
    url.searchParams.set("lng", String(geo.lng));
  }
  const res = await fetch(url, { headers: headers(), cache: "no-store" });
  if (!res.ok) throw new Error(`feed_fetch_failed: ${res.status}`);
  return res.json();
}
