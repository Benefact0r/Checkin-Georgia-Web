"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getAvailability,
  type Availability,
  type AvailResource,
  type VenueDetail,
} from "@/lib/api";
import { getSessionId } from "@/lib/session";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://checkin-georgia-api-171625154738.europe-west1.run.app";

type Service = VenueDetail["services"][number];

const KIND_LABEL: Record<AvailResource["kind"], string> = {
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

const ANY = "__any__";

function dayLabel(dateStr: string, weekday: string): string {
  const dd = Number(dateStr.slice(8, 10));
  return `${WD[weekday] ?? ""} ${dd}`;
}

function initials(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

export function BookingForm({ venue, service }: { venue: VenueDetail; service: Service }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [avail, setAvail] = useState<Availability | null>(null);
  const [availError, setAvailError] = useState(false);
  const [loadingAvail, setLoadingAvail] = useState(true);

  // Staff-first selection (salon/spa). "" = not chosen yet, ANY = no preference.
  const [chosenStaff, setChosenStaff] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [slotIso, setSlotIso] = useState("");
  const [tableId, setTableId] = useState(""); // resource picker for table-like venues
  const [partySize, setPartySize] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");

  function loadAvailability(): Promise<Availability | null> {
    return getAvailability(venue.slug, service.id, 7).catch(() => {
      setAvailError(true);
      return null;
    });
  }

  useEffect(() => {
    let alive = true;
    loadAvailability()
      .then((a) => {
        if (!alive || !a) return;
        setAvail(a);
      })
      .finally(() => {
        if (alive) setLoadingAvail(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue.slug, service.id]);

  // Eligible team (with profiles) for this service.
  const eligible = avail?.resources ?? [];
  const staff = useMemo(() => eligible.filter((r) => r.kind === "staff"), [eligible]);
  const isStaffMode = staff.length > 0;

  // Which staff have at least one free slot in the next 7 days.
  const availableStaffIds = useMemo(() => {
    const s = new Set<string>();
    avail?.days.forEach((d) => d.slots.forEach((sl) => sl.resource_ids.forEach((id) => s.add(id))));
    return s;
  }, [avail]);

  // The chosen scope: a specific staff id, ANY, or — for table venues — ANY.
  const scope = isStaffMode ? chosenStaff : ANY;

  // Days/slots filtered to the chosen scope.
  const filteredDays = useMemo(() => {
    if (!avail) return [];
    if (isStaffMode && !chosenStaff) return []; // must pick a professional first
    return avail.days
      .map((d) => ({
        ...d,
        slots: d.slots.filter((sl) =>
          scope === ANY ? sl.resource_ids.length > 0 : sl.resource_ids.includes(scope),
        ),
      }))
      .filter((d) => d.slots.length > 0);
  }, [avail, isStaffMode, chosenStaff, scope]);

  // Keep selectedDate valid as the scope changes.
  useEffect(() => {
    if (filteredDays.length === 0) {
      if (selectedDate) setSelectedDate("");
      return;
    }
    if (!filteredDays.some((d) => d.date === selectedDate)) {
      setSelectedDate(filteredDays[0]!.date);
      setSlotIso("");
      setTableId("");
    }
  }, [filteredDays, selectedDate]);

  const currentDay = filteredDays.find((d) => d.date === selectedDate);
  const selectedSlot = currentDay?.slots.find((s) => s.iso === slotIso) ?? null;
  const tablesForSlot = selectedSlot?.resource_ids ?? [];
  const resourceById = useMemo(() => {
    const m = new Map<string, AvailResource>();
    for (const r of eligible) m.set(r.id, r);
    return m;
  }, [eligible]);

  function pickStaff(id: string) {
    setChosenStaff(id);
    setSlotIso("");
    setTableId("");
  }
  function pickDate(date: string) {
    setSelectedDate(date);
    setSlotIso("");
    setTableId("");
  }
  function pickSlot(iso: string) {
    setSlotIso(iso);
    const slot = currentDay?.slots.find((s) => s.iso === iso);
    setTableId(slot?.resource_ids[0] ?? "");
  }

  // Resolve which resource id to book.
  function resolveResourceId(): string {
    if (isStaffMode) {
      if (chosenStaff && chosenStaff !== ANY) return chosenStaff;
      return selectedSlot?.resource_ids[0] ?? ""; // "any professional" → first free
    }
    return tableId; // table-like venues use the explicit picker
  }

  if (!loadingAvail && !availError && eligible.length === 0) {
    return (
      <p className="mt-8 rounded-xl bg-gold/10 p-4 text-sm text-ink-600 dark:text-ink-300">
        ამ სერვისზე ჯავშანი ჯერ შეუძლებელია — ვენიუს არ აქვს მიბმული რესურსი.
      </p>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const resourceId = resolveResourceId();
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
            setTableId("");
            loadAvailability().then((a) => a && setAvail(a));
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

  const noSlotsForScope =
    !loadingAvail && !availError && isStaffMode && chosenStaff && filteredDays.length === 0;
  const noSlotsAtAll = !loadingAvail && !availError && !isStaffMode && filteredDays.length === 0;

  return (
    <form onSubmit={submit} className="mt-8 space-y-6">
      {loadingAvail ? (
        <p className="text-sm text-ink-400">თავისუფალი დროის ძებნა…</p>
      ) : availError ? (
        <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">
          დროის ჩატვირთვა ვერ მოხერხდა — სცადე თავიდან.
        </p>
      ) : (
        <>
          {/* Step 1 (salon/spa): choose your professional */}
          {isStaffMode && (
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200">
                აირჩიე სპეციალისტი
              </label>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {/* Any professional */}
                <button
                  type="button"
                  onClick={() => pickStaff(ANY)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    chosenStaff === ANY
                      ? "border-brand bg-brand/5"
                      : "border-ink-200 hover:border-brand dark:border-ink-700"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sunset text-lg">
                    ✨
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink-900 dark:text-ink-50">
                      ნებისმიერი სპეციალისტი
                    </span>
                    <span className="block text-xs text-ink-500">ყველაზე ადრე ხელმისაწვდომი</span>
                  </span>
                </button>

                {staff.map((r) => {
                  const free = availableStaffIds.has(r.id);
                  const on = chosenStaff === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      disabled={!free}
                      onClick={() => pickStaff(r.id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-50 ${
                        on
                          ? "border-brand bg-brand/5"
                          : "border-ink-200 hover:border-brand dark:border-ink-700"
                      }`}
                    >
                      {r.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.photo_url}
                          alt={r.name}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand">
                          {initials(r.name)}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink-900 dark:text-ink-50">
                          {r.name}
                        </span>
                        {r.role && (
                          <span className="block truncate text-xs font-medium text-brand">
                            {r.role}
                          </span>
                        )}
                        {r.bio && (
                          <span className="block truncate text-xs text-ink-500">{r.bio}</span>
                        )}
                        {!free && (
                          <span className="block text-xs text-ink-400">
                            ამ კვირაში თავისუფალი დრო არ აქვს
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {noSlotsForScope && (
            <p className="rounded-xl bg-gold/10 p-4 text-sm text-ink-600 dark:text-ink-300">
              ამ სპეციალისტს უახლოეს 7 დღეში თავისუფალი დრო არ აქვს — აირჩიე სხვა ან „ნებისმიერი“.
            </p>
          )}
          {noSlotsAtAll && (
            <p className="rounded-xl bg-gold/10 p-4 text-sm text-ink-600 dark:text-ink-300">
              უახლოეს 7 დღეში თავისუფალი დრო არ მოიძებნა. დაუკავშირდი ვენიუს პირდაპირ.
            </p>
          )}

          {/* Step 2: day + time (shown once a scope is chosen / for table venues) */}
          {(!isStaffMode || chosenStaff) && filteredDays.length > 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-ink-700 dark:text-ink-200">
                  აირჩიე დღე
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {filteredDays.map((d) => (
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

              {/* Table picker — only for table-like venues, after a time is chosen */}
              {!isStaffMode && selectedSlot && tablesForSlot.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-200">
                    რესურსი
                  </label>
                  {tablesForSlot.length === 1 ? (
                    <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                      {resourceById.get(tablesForSlot[0] ?? "")?.name ?? "—"}
                    </p>
                  ) : (
                    <select
                      value={tableId}
                      onChange={(e) => setTableId(e.target.value)}
                      className={selectCls}
                      required
                    >
                      {tablesForSlot.map((rid) => {
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

              {/* Confirmation of who you're booking with (salon/spa) */}
              {isStaffMode && selectedSlot && (
                <p className="rounded-lg bg-brand/5 px-3 py-2 text-sm text-ink-700 dark:text-ink-200">
                  {chosenStaff === ANY
                    ? `${selectedSlot.time} · ${
                        resourceById.get(resolveResourceId())?.name ?? "ხელმისაწვდომი სპეციალისტი"
                      }`
                    : `${selectedSlot.time} · ${resourceById.get(chosenStaff)?.name ?? ""}`}
                </p>
              )}

              {/* Party size — table-like venues */}
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
                <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={isPending || !slotIso || !resolveResourceId()}
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
        </>
      )}
    </form>
  );
}
