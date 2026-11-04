import Link from "next/link";
import { connection } from "next/server";
import { getSettings } from "@/lib/hire/data";
import { RENTAL_DAY_RULE } from "@/lib/hire/rules.mjs";


export const instant = false;

export const metadata = {
  title: "Equipment Hire Terms",
  description:
    "Oxsnow Studio equipment hire terms — draft policies for review, plus collection, deposits, inspection and cancellation.",
};

function DraftBadge({ status }) {
  return (
    <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-amber-200">
      {status === "approved" ? "Approved" : "Draft — needs approval"}
    </span>
  );
}

export default async function HireTermsPage() {
  await connection();
  const settings = await getSettings();
  const terms = settings.terms;
  const payment = settings.paymentInstructions;
  const rows = [
    ["Collection & return", terms.collection_return],
    ["Deposits", terms.deposits],
    ["Inspection", terms.inspection],
    ["Damage & missing items", terms.damage],
    ["Cancellation", terms.cancellation],
    ["Late returns", terms.late_returns],
  ];

  return (
    <section className="mx-auto w-full max-w-4xl px-5 pb-24 pt-36 sm:px-8">
      <p className="eyebrow flex items-center gap-3">
        <span className="rule-fire" />
        Equipment Hire
      </p>
      <h1 className="mt-5 text-4xl font-black tracking-tight text-metal sm:text-5xl">
        Hire terms.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel">
        These policies are drafts prepared for Oxsnow Studio review. They are not legal advice and
        are not binding until the studio approves them. Staff will confirm final terms with you
        before any equipment is released.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <DraftBadge status={terms.status} />
        <span className="rounded-full border border-white/12 px-3 py-1 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-steel">
          Demo catalogue
        </span>
      </div>

      <div className="mt-8 rounded-xl border border-ember/25 bg-ember/5 px-5 py-4 text-sm leading-relaxed text-silver-2">
        <span className="font-bold uppercase tracking-[0.16em] text-ember">No online payment.</span>{" "}
        Do not send money until Oxsnow staff confirm your booking and send verified payment details.
        {terms.note ? ` ${terms.note}` : ""}
      </div>

      <div className="card mt-8 divide-y divide-white/8 p-0">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-2 px-6 py-5 sm:grid-cols-[200px_1fr]">
            <h2 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ash">{label}</h2>
            <p className="text-sm leading-relaxed text-silver-2">{value || "To be confirmed."}</p>
          </div>
        ))}
      </div>

      <div className="card mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-metal">Payment instructions</h2>
          <DraftBadge status={payment.status} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-steel">{payment.note}</p>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-white/8 pb-3">
            <dt className="text-ash">Bank transfer</dt>
            <dd className="text-right text-silver-2">{payment.bank_transfer}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-white/8 pb-3">
            <dt className="text-ash">M-Pesa</dt>
            <dd className="text-right text-silver-2">{payment.mpesa}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ash">EcoCash</dt>
            <dd className="text-right text-silver-2">{payment.ecocash}</dd>
          </div>
        </dl>
      </div>

      <div className="card mt-8 p-6">
        <h2 className="text-lg font-bold text-metal">Rental days</h2>
        <p className="mt-3 text-sm leading-relaxed text-steel">{RENTAL_DAY_RULE}</p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/hire" className="btn btn-primary">
          Browse equipment
        </Link>
        <Link href="/hire/quote" className="btn btn-ghost">
          Request a quote
        </Link>
        <Link href="/contact" className="btn btn-ghost">
          Contact the studio
        </Link>
      </div>
    </section>
  );
}
