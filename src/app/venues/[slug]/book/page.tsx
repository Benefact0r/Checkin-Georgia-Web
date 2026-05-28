import { notFound } from "next/navigation";
import Link from "next/link";
import { getVenue } from "@/lib/api";
import { BookingForm } from "./booking-form";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string }>;
}

export default async function BookPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { service: serviceId } = await searchParams;
  if (!serviceId) notFound();

  let venue;
  try {
    venue = await getVenue(slug);
  } catch {
    notFound();
  }

  const service = venue.services.find((s) => s.id === serviceId);
  if (!service) notFound();

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <Link
        href={`/venues/${slug}`}
        className="text-sm text-brand hover:underline"
      >
        ← უკან
      </Link>

      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          ჯავშანი · {venue.name}
        </p>
        <h1 className="mt-1 text-3xl font-bold">{service.name}</h1>
        <p className="mt-2 text-slate-600">
          {service.duration_minutes
            ? `${service.duration_minutes} წუთი`
            : "ხანგრძლივობა მითითებული არ არის"}
          {service.price_minor != null &&
            ` · ${(service.price_minor / 100).toFixed(0)} ${service.currency}`}
        </p>
      </header>

      <BookingForm venue={venue} service={service} />
    </main>
  );
}
