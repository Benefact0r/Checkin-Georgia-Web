"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getAvailability, type Availability, type VenueDetail } from "@/lib/api";
import { getSessionId } from "@/lib/session";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://checkin-georgia-api-171625154738.europe-west1.run.app";

type Service = VenueDetail["services"][number];
type Resource = VenueDetail["resources"][number];

interface Props {
  venue: VenueDetail;
  service: Service;
}

const KIND_LABEL: Record<Resource["kind"], string> = {
  staff: "თანამშრომელი",
  table: "მაგიდა",
  seat: "ადგილი",
  queue: "რიგი",
  room: "ოთახი",
};

const WD: Record<string, string> = {
  sun: "კვ",
  mon: "ორშ",
  tue: "სამ",
  wed: "ოთხ",
  thu: "ხუთ",
  fri: "პარ",
  sat: "შაბ",
};

const chipBase = "rounded-lg border px-3 py-2 text-sm font-medium transition";
const chipOn = "border-brand bg-brand text-white";
const chipOff =
  "border-ink-200 bg-white text-ink-700 hover:border-brand dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200";
const chip = (on: boolean) => `${chipBase} ${on ? chipOn : chipOff}`;
const selectCls =
  "mt-1 block w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-white px-3 py-2 text-sm dark:bg-ink-900 dark:text-ink-100 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

function dayLabel(dateStr: string, weekday: string): string {
  const dd = Number(dateStr.slice(8, 10));
  return `${WD[weekday] ?? ""} ${dd}`;
}

export function BookingForm({ venue, service }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [avail, setAvail] = useState<Availability | null>(null);
  const [availError, setAvailError] = useState(false);
  const [loadingAvail, setLoadingAvail] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [slotIso, setSlotIso] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");

  const resourceById = useMemo(() => {
    const m = new Map<string, Resource>();
    for (const r of venue.resources) m.set(r.id, r);
    return m;
  }, [venue.resources]);

  useEffect(() => {
    let alive = true;
    getAvailability(venue.slug, service.id, 7)
      .then((a) => {
        if (!alive) return;
        setAvail(a);
        const first = a.days.find((d) => d.slots.length > 0);
        if (first) setSelectedDate(first.date);
      })
      .catch(() => {
        if (alive) setAvailError(true);
      })
      .finally(() => {
        if (alive) setLoadingAvail(false);
      });
    return () => {
      alive = false;
    };
  }, [venue.slug, service.id]);

  const daysWithSlots = useMemo(
    () => avail?.days.filter((d) => d.slots.length > 0) ?? [],
    [avail],
  );
  const currentDay = useMemo(
    () => avail?.days.find((d) => d.date === selectedDate),
    [avail, selectedDate],
  );
  const selectedSlot = currentDay?.slots.find((s) => s.iso === slotIso) ?? null;
  const freeResources = selectedSlot?.resource_ids ?? [];

  function pickDate(date: string) {
    setSelectedDate(date);
    setSlotIso("");
    setResourceId("");
  }
  function pickSlot(iso: string) {
    setSlotIso(iso);
    const slot = currentDay?.slots.find((s) => s.iso === iso);
    setResourceId(slot?.resource_ids[0] ?? "");
  }

  if (venue.resources.length === 0) {
    return (
      <p className="mt-8 rounded-xl bg-gold/10 p-4 text-sm text-ink-600 dark:text-ink-300">
        ვენიუს ჯერ არ აქვს რესურსები — ჯავშანი ჯერ შეუძლებელია.
      </p>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slotIso || !resourceId) {
      setError("აირჩიე დრო");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`${API_URL}/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Checkin-Session": getSessionId(),
          },
          body: JSON.stringify({
            venue_id: venue.id,
            resource_id: resourceId,
            service_id: service.id,
            starts_at: slotIso,
            party_size: partySize,
            guest_name: guestName.trim() || undefined,
            guest_phone: guestPhone.trim() || undefined,
            notes: notes.trim() || undefined,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (res.status === 409) {
            // Someone grabbed it between load and submit — refresh availability.
            setSlotIso("");
            setResourceId("");
            getAvailability(venue.slug, service.id, 7)
              .then(setAvail)
              .catch(() => {});
            throw new Error("ეს დრო ახლახან დაიკავეს — აირჩიე სხვა");
          }
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const booking = (await res.json()) as { id: string };
        try {
          const KEY = "checkin-bookings";
          const prev: string[] = JSON.parse(localStorage.getItem(KEY) || "[]");
          localStorage.setItem(
            KEY,
            JSON.stringify([booking.id, ...prev.filter((x) => x !== booking.id)].slice(0, 50)),
          );
        } catch {
          /* ignore */
        }
        router.push(`/bookings/${booking.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "უცნობი შეცდომა");
      }
    });
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-6">
      {loadingAvail ? (
        <p className="text-sm text-ink-400">თავისუფალი დროის ძებნა…</p>
      ) : availError ? (
        <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">
          დროის ჩატვირთვა ვერ მოხერხდა — სცადე თავიდან.
        </p>
      ) : daysWithSlots.length === 0 ? (
        <p className="rounded-xl bg-gold/10 p-4 text-sm text-ink-600 dark:text-ink-300">
          უახლოეს 7 დღეში თავისუფალი დრო არ მოიძებნა. დაუკავშირდი ვენიუს პირდაპირ.
        </p>
      ) : (
        <>
          {/* Day picker */}
          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200">
              აირჩიე დღე
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {daysWithSlots.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => pickDate(d.date)}
                  className={chip(selectedDate === d.date)}
                >
                  {dayLabel(d.date, d.weekday)}
                </button>
              ))}
            </div>
          </div>

          {/* Time picker */}
          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200">
              აირჩიე დრო
            </label>
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {currentDay?.slots.map((s) => (
                <button
                  key={s.iso}
                  type="button"
                  onClick={() => pickSlot(s.iso)}
                  className={chip(slotIso === s.iso)}
                >
                  {s.time}
                </button>
              ))}
            </div>
          </div>

          {/* Resource picker — only the resources free at the chosen time */}
          {selectedSlot && freeResources.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200">
                {venue.vertical === "salon" ? "თანამშრომელი" : "რესურსი"}
              </label>
              {freeResources.length === 1 ? (
                <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                  {resourceById.get(freeResources[0] ?? "")?.name ?? "—"}
                </p>
              ) : (
                <select
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  className={selectCls}
                  required
                >
                  {freeResources.map((rid) => {
                    const r = resourceById.get(rid);
                    return (
                      <option key={rid} value={rid}>
                        {r?.name ?? rid}
                        {r ? ` · ${KIND_LABEL[r.kind]}` : ""}
                        {r && r.capacity > 1 ? ` (${r.capacity})` : ""}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          )}

          {/* Party size */}
          {(venue.vertical === "restaurant" ||
            venue.vertical === "bar" ||
            venue.vertical === "night_club") && (
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200">
                სტუმრის რაოდენობა
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                className="mt-1 block w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-white px-3 py-2 text-sm dark:bg-ink-900 dark:text-ink-100"
              />
            </div>
          )}

          {/* Guest checkout */}
          <fieldset className="grid grid-cols-2 gap-3">
            <legend className="col-span-2 mb-1 text-sm font-medium text-ink-700 dark:text-ink-200">
              საკონტაქტო ინფო
            </legend>
            <div>
              <label className="block text-xs text-ink-600 dark:text-ink-300">სახელი</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-white px-3 py-2 text-sm dark:bg-ink-900 dark:text-ink-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-ink-600 dark:text-ink-300">ტელეფონი</label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+995555000000"
                className="mt-1 block w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-white px-3 py-2 text-sm dark:bg-ink-900 dark:text-ink-100"
                required
              />
            </div>
          </fieldset>

          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200">
              შენიშვნა (არასავალდებულო)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-white px-3 py-2 text-sm dark:bg-ink-900 dark:text-ink-100"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !slotIso || !resourceId}
            className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-50"
          >
            {isPending ? "იქმნება..." : "დაჯავშნა"}
          </button>

          <p className="text-center text-xs text-ink-500 dark:text-ink-400">
            ჯავშნა იქმნება{" "}
            {service.payment_mode === "prepay" ? "წინასწარი გადახდით" : ""}
            {service.payment_mode === "deposit" ? "დეპოზიტით" : ""}
            {service.payment_mode === "on_site" ? "ადგილზე გადახდით" : ""}.
            გადახდის ღილაკები შემდეგ ეკრანზე.
          </p>
        </>
      )}
    </form>
  );
}
