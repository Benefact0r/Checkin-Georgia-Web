// Anonymous personalization session id.
// One UUID per device, mirrored to localStorage (durable) and a cookie
// (server-readable). Sent on every personalization request as X-Checkin-Session.
// Upgrades to a real account later via a server-side "claim".

const SID_KEY = "checkin-sid";
const COOKIE = "checkin_sid";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Get (or lazily create) this device's personalization session id. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(SID_KEY);
    if (!id || !UUID_RE.test(id)) {
      id = makeId();
      localStorage.setItem(SID_KEY, id);
    }
    // Refresh the cookie so SSR can read it (1 year, lax).
    document.cookie = `${COOKIE}=${id};path=/;max-age=31536000;samesite=lax`;
    return id;
  } catch {
    return "";
  }
}
