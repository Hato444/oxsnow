import Link from "next/link";
import { Suspense } from "react";
import HireBookingDetail from "@/components/hire/HireBookingDetail";

export const instant = false;

export const metadata = {
  title: "Hire Booking",
  description: "View your Oxsnow equipment hire booking, payments and status.",
};

export default async function HireBookingPage({ params }) {
  const { reference } = await params;
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <Link
        href="/hire/bookings"
        className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ash hover:text-ember"
      >
        ← All bookings
      </Link>
      <h1 className="mt-5 text-4xl font-black tracking-tight text-metal sm:text-5xl">
        Booking details.
      </h1>
      <Suspense
        fallback={
          <div className="mt-12 grid place-items-center py-16">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-ember" />
          </div>
        }
      >
        <HireBookingDetail reference={reference} />
      </Suspense>
    </section>
  );
}
