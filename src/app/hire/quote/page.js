import Link from "next/link";
import { connection } from "next/server";
import QuoteForm from "@/components/hire/QuoteForm";
import { todayISO } from "@/lib/hire/rules.mjs";


export const instant = false;

export const metadata = {
  title: "Request an Equipment Hire Quote",
  description:
    "Tell Oxsnow Studio about your production and get a custom equipment hire quote for Lesotho shoots.",
};

export default async function HireQuotePage() {
  await connection();
  return (
    <section className="mx-auto w-full max-w-4xl px-5 pb-24 pt-36 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-3">
            <span className="rule-fire" />
            Equipment Hire
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-metal sm:text-5xl">
            Request a quote.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel">
            Tell us the dates, the production and the kit you need. Studio staff will confirm real
            availability and pricing. Demo catalogue — this is a request, not a reservation.
          </p>
        </div>
        <Link href="/hire" className="btn btn-ghost">
          Browse equipment
        </Link>
      </div>
      <QuoteForm today={todayISO()} />
    </section>
  );
}
