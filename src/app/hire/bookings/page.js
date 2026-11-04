import Link from "next/link";
import HireBookings from "@/components/hire/HireBookings";

export const metadata = {
  title: "My Hire Bookings",
  description: "View and manage your Oxsnow equipment hire requests.",
};

export default function HireBookingsPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-3">
            <span className="rule-fire" />
            Equipment Hire
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-metal sm:text-5xl">
            My bookings.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-steel">
            Requests, approval status and payment reports — all in one place.
          </p>
        </div>
        <Link href="/hire" className="btn btn-ghost">
          Browse equipment
        </Link>
      </div>
      <HireBookings />
    </section>
  );
}
