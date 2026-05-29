"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { VenueDetail } from "@/lib/api";

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

/** Generate hourly time slots 09:00–20:00 over the next 7 days. */
function generateSlots(): { date: string; time: string; iso: string }[] {
  const slots: { date: string; time: string; iso: string }[] = [];
  const now = new Date();
  for (let d = 0; d < 7; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    day.setMinutes(0, 0, 0);
    for (let h = 9; h <= 20; h++) {
      day.setHours(h);
      // Skip slots already in the past (today)
      if (day.getTime() <= now.getTime()) continue;
      slots.push({
        date: day.toLocaleDateString("ka-GE", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        time: `${String(h).padStart(2, "0")}:00`,
        iso: day.toISOString(),
      });
    }
  }
  return slots;
}

export function BookingForm({ venue, service }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const slots = useMemo(generateSlots, []);

  const [slotIso, setSlotIso] = useState(slots[0]?.iso ?? "");
  const [resourceId, setResourceId] = useState(venue.resources[0]?.id ?? "");
  const [partySize, setPartySize] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");

  if (venue.resources.length === 0) {
    return (
      <p className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        ვენიუს ჯერ არ აქვს რესურსები — ჯავშანი ჯერ შეუძლებელია.
      </p>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`${API_URL}/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
            throw new Error("ეს დრო უკვე დაკავებულია — აარჩიე სხვა");
          }
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const booking = (await res.json()) as { id: string };
        router.push(`/bookings/${booking.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "უცნობი შეცდომა");
      }
    });
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-6">
      {/* Slot picker */}
      <div>
        <label className="block text-sm font-medium text-slate-700">
          აარჩიე დრო
        </label>
        <select
          value={slotIso}
          onChange={(e) => setSlotIso(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          required
        >
          {slots.map((s) => (
            <option key={s.iso} value={s.iso}>
              {s.date} · {s.time}
            </option>
          ))}
        </select>
      </div>

      {/* Resource picker */}
      <div>
        <label className="block text-sm font-medium text-slate-700">
          {venue.vertical === "salon" ? "თანამშრომელი" : "რესურსი"}
        </label>
        <select
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          required
        >
          {venue.resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} · {KIND_LABEL[r.kind]}
              {r.capacity > 1 ? ` (${r.capacity})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Party size */}
      {(venue.vertical === "restaurant" || venue.vertical === "bar") && (
        <div>
          <label className="block text-sm font-medium text-slate-700">
            სტუმრის რაოდენობა
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={partySize}
            onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      )}

      {/* Guest checkout */}
      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="col-span-2 mb-1 text-sm font-medium text-slate-700">
          საკონტაქტო ინფო (guest checkout)
        </legend>
        <div>
          <label className="block text-xs text-slate-600">სახელი</label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600">ტელეფონი</label>
          <input
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="+995555000000"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          შენიშვნა (არასავალდებულო)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-50"
      >
        {isPending ? "იქმნება..." : "დაჯავშნა"}
      </button>

      <p className="text-center text-xs text-slate-500">
        ჯავშნა იქმნება {service.payment_mode === "prepay" ? "წინასწარი" : ""}
        {service.payment_mode === "deposit" ? "დეპოზიტით" : ""}
        {service.payment_mode === "on_site" ? "ადგილზე გადახდით" : ""}.
        გადახდის ღილაკები შემდეგ ეკრანზე.
      </p>
    </form>
  );
}
