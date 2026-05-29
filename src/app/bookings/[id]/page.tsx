import { notFound } from "next/navigation";
import Link from "next/link";
import { getBooking, formatPrice } from "@/lib/api";
import { PayButtons } from "./pay-buttons";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-ink-100 text-ink-700 border-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:border-ink-700",
  no_show: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "მოლოდინში",
  confirmed: "დადასტურებული ✓",
  cancelled: "გაუქმდა",
  completed: "შესრულდა",
  no_show: "ვერ მოვიდა",
};

export default async function BookingPage({ params }: PageProps) {
  const { id } = await params;
  let booking;
  try {
    booking = await getBooking(id);
  } catch {
    notFound();
  }

  const total =
    typeof booking.total_minor === "string"
      ? parseInt(booking.total_minor)
      : booking.total_minor;
  const succeededPayment = booking.payments?.find(
    (p) => p.status === "succeeded",
  );

  const startDate = new Date(booking.starts_at);
  const formattedDate = startDate.toLocaleString("ka-GE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <div className="flex gap-4 text-sm">
        <Link href="/" className="text-brand hover:underline">← მთავარი</Link>
        <Link href="/bookings" className="text-brand hover:underline">ჩემი ჯავშნები</Link>
      </div>

      <div
        className={`mt-6 rounded-2xl border px-5 py-3 text-sm font-semibold ${
          STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending
        }`}
      >
        ჯავშანი: {STATUS_LABEL[booking.status] ?? booking.status}
      </div>

      <section className="mt-6 space-y-1">
        <p className="text-xs uppercase tracking-wider text-brand">
          {booking.vertical}
        </p>
        <h1 className="text-3xl font-bold">{booking.venue_name}</h1>
        <p className="text-ink-600 dark:text-ink-300">{booking.venue_address}</p>
        <Link
          href={`/venues/${booking.venue_slug}/book?service=${booking.service_id}`}
          className="inline-block pt-1 text-sm text-brand hover:underline"
        >
          ისევ დაჯავშნა →
        </Link>
      </section>

      <dl className="mt-6 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        <Row label="სერვისი" value={booking.service_name} />
        <Row
          label="დრო"
          value={`${formattedDate}${
            booking.duration_minutes ? ` (${booking.duration_minutes} წთ)` : ""
          }`}
        />
        <Row
          label="რესურსი"
          value={`${booking.resource_name} · ${booking.resource_kind}`}
        />
        <Row label="სტუმრების რაოდენობა" value={String(booking.party_size)} />
        {booking.guest_name && (
          <Row
            label="საკონტაქტო"
            value={`${booking.guest_name}${
              booking.guest_phone ? ` · ${booking.guest_phone}` : ""
            }`}
          />
        )}
        {booking.notes && <Row label="შენიშვნა" value={booking.notes} />}
        <Row
          label="ჯამური"
          value={total > 0 ? formatPrice(total, booking.currency) : "ადგილზე"}
        />
      </dl>

      <section className="mt-8 rounded-2xl border border-ink-200 p-5 dark:border-ink-700">
        {succeededPayment ? (
          <>
            <p className="text-sm font-semibold text-emerald-700">
              ✓ გადახდილია · {succeededPayment.provider}
              {succeededPayment.is_mock && " (mock)"}
            </p>
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
              {new Date(succeededPayment.created_at).toLocaleString("ka-GE")} ·{" "}
              {formatPrice(succeededPayment.amount_minor, booking.currency)}
            </p>
          </>
        ) : booking.status === "cancelled" ? (
          <p className="text-sm text-ink-500 dark:text-ink-400">
            ჯავშანი გაუქმდა — გადახდა მიუღებელია.
          </p>
        ) : (
          <PayButtons bookingId={booking.id} />
        )}
      </section>

      <p className="mt-6 text-center text-xs text-ink-400">
        ID: <code className="rounded bg-ink-100 px-1.5 py-0.5 dark:bg-ink-800">{booking.id}</code>
      </p>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400">
        {label}
      </dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
