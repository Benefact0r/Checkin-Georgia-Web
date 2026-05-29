import { apiUrl, type Vertical } from "./api";

// ---------------------------------------------------------------------------
// Authed fetch — every admin call carries the Firebase ID token as Bearer.
// ---------------------------------------------------------------------------
async function authed<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type Role = "user" | "business_owner" | "admin";

export interface Me {
  id: string;
  firebase_uid: string;
  email: string | null;
  phone: string | null;
  role: Role;
}

export interface Overview {
  scope: "all" | "owned";
  venues: number;
  bookings: number;
  bookings_by_status: Record<string, number>;
  revenue_minor: number;
  customers: number;
}

export interface AdminVenue {
  id: string;
  slug: string;
  name: string;
  vertical: Vertical;
  district: string | null;
  city: string;
  address: string;
  status: "pending" | "active" | "paused" | "archived";
  owner_user_id?: string;
  created_at?: string;
}

export interface AdminBooking {
  id: string;
  status: string;
  starts_at: string;
  ends_at: string;
  party_size: number;
  total_minor: number | string;
  currency: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  venue_id: string;
  venue_name: string;
  service_name: string;
  resource_name: string;
}

export interface AdminCustomer {
  name: string | null;
  phone: string | null;
  email: string | null;
  user_id: string | null;
  bookings: number;
  last_booking: string | null;
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: Role;
  created_at: string;
}

export interface CreateVenueInput {
  slug: string;
  name: string;
  vertical: Vertical;
  address: string;
  city?: string;
  district?: string;
  description?: string;
}

export const getMe = (t: string) => authed<Me>("/me", t);

export const getOverview = (t: string) => authed<Overview>("/admin/overview", t);

export const getAdminVenues = (t: string) =>
  authed<{ items: AdminVenue[] }>("/admin/venues", t);

export const createVenue = (t: string, body: CreateVenueInput) =>
  authed<AdminVenue>("/admin/venues", t, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getAdminBookings = (t: string, params: { status?: string } = {}) => {
  const qs = params.status ? `?status=${encodeURIComponent(params.status)}` : "";
  return authed<{ items: AdminBooking[] }>(`/admin/bookings${qs}`, t);
};

export const getCustomers = (t: string) =>
  authed<{ items: AdminCustomer[] }>("/admin/customers", t);

export const getUsers = (t: string) =>
  authed<{ items: AdminUser[] }>("/admin/users", t);

export const setUserRole = (t: string, id: string, role: Role) =>
  authed<{ id: string; role: Role }>(`/admin/users/${id}/role`, t, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

// ---------------------------------------------------------------------------
// Venue detail + update, resources (workers/tables), services (menu).
// ---------------------------------------------------------------------------
export interface AdminVenueDetail extends AdminVenue {
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  cover_url: string | null;
  photos: string[];
  videos: string[];
  attributes: Record<string, unknown>;
}

export interface AdminResource {
  id: string;
  name: string;
  kind: "staff" | "table" | "seat" | "queue" | "room";
  capacity: number;
  photo_url: string | null;
  bio: string | null;
  position: number;
  active: boolean;
  attributes: Record<string, unknown>;
  service_ids: string[];
}

export interface AdminService {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_minutes: number | null;
  price_minor: number | null;
  currency: string;
  payment_mode: "on_site" | "deposit" | "prepay";
  deposit_minor: number | null;
  position: number;
  active: boolean;
}

export const getAdminVenue = (t: string, id: string) =>
  authed<AdminVenueDetail>(`/admin/venues/${id}`, t);

export const updateVenue = (
  t: string,
  id: string,
  patch: Record<string, unknown>,
) =>
  authed<AdminVenueDetail>(`/admin/venues/${id}`, t, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const getResources = (t: string, venueId: string) =>
  authed<{ items: AdminResource[] }>(`/admin/venues/${venueId}/resources`, t);

export const createResource = (
  t: string,
  venueId: string,
  body: Record<string, unknown>,
) =>
  authed<{ id: string }>(`/admin/venues/${venueId}/resources`, t, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateResource = (
  t: string,
  id: string,
  body: Record<string, unknown>,
) =>
  authed<{ id: string }>(`/admin/resources/${id}`, t, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteResource = (t: string, id: string) =>
  authed<{ id: string }>(`/admin/resources/${id}`, t, { method: "DELETE" });

export const getServices = (t: string, venueId: string) =>
  authed<{ items: AdminService[] }>(`/admin/venues/${venueId}/services`, t);

export const createService = (
  t: string,
  venueId: string,
  body: Record<string, unknown>,
) =>
  authed<{ id: string }>(`/admin/venues/${venueId}/services`, t, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateService = (
  t: string,
  id: string,
  body: Record<string, unknown>,
) =>
  authed<{ id: string }>(`/admin/services/${id}`, t, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteService = (t: string, id: string) =>
  authed<{ id: string }>(`/admin/services/${id}`, t, { method: "DELETE" });

// --- Messages (customer → venue inbox) --------------------------------------
export interface AdminMessage {
  id: string;
  venue_id: string;
  venue_name: string;
  sender_name: string | null;
  sender_phone: string | null;
  sender_email: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
  replies: number;
}

export const getMessages = (t: string) =>
  authed<{ items: AdminMessage[] }>("/admin/messages", t);

export const replyMessage = (t: string, id: string, body: string) =>
  authed<{ ok: true }>(`/admin/messages/${id}/reply`, t, {
    method: "POST",
    body: JSON.stringify({ body }),
  });

export const markMessageRead = (t: string, id: string) =>
  authed<{ ok: true }>(`/admin/messages/${id}/read`, t, { method: "PATCH" });
