import Link from "next/link";
import { connection } from "next/server";
import CartCheckout from "@/components/hire/CartCheckout";
import { todayISO } from "@/lib/hire/rules.mjs";


export const instant = false;

export const metadata = {
  title: "Booking list — Equipment Hire",
  description: "Review your equipment hire list, check availability and submit a booking request.",
};

export default async function CheckoutPage() {
  await connection();
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <p className="eyebrow flex items-center gap-3">
        <span className="rule-fire" />
        Equipment Hire · Booking list
      </p>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-metal sm:text-5xl">
            Build your request.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel">
            Check dates, confirm demo availability and send the request to studio staff. Submitting
            does not reserve equipment or take payment.
          </p>
        </div>
        <Link
          href="/hire"
          className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ash hover:text-ember"
        >
          ← Keep browsing
        </Link>
      </div>
      <CartCheckout today={todayISO()} />
    </section>
  );
}
