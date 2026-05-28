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
