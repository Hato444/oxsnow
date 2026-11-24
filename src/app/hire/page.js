import Link from "next/link";
import { connection } from "next/server";
import Reveal from "@/components/Reveal";
import EquipmentCard from "@/components/hire/EquipmentCard";
import HireCartLink from "@/components/hire/HireCartLink";
import { listEquipment } from "@/lib/hire/data";
import { HIRE_CATEGORIES, RENTAL_DAY_RULE } from "@/lib/hire/rules.mjs";
import SonyShowcase from "@/components/hire/SonyShowcase";


export const instant = false;

export const metadata = {
  title: "Equipment Hire",
  description:
    "Request Sony ZV-E10 equipment hire from Oxsnow Studio in Maseru, Lesotho.",
};

export default async function HirePage({ searchParams }) {
  await connection();
  const sp = await searchParams;
  const category = typeof sp?.category === "string" ? sp.category : "";
  const items = await listEquipment({ category });

  return (
    <div>
      <section className="mx-auto w-full max-w-7xl px-5 pb-16 pt-36 sm:px-8">
        <Reveal>
          <p className="eyebrow flex items-center gap-3">
            <span className="rule-fire" />
            Equipment Hire · Oxsnow Studio
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-metal sm:text-6xl">
            The gear behind the story.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel">
            Find the right camera package for your next production. Send your dates and let the studio confirm availability.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#catalogue" className="btn btn-primary">
              Browse the catalogue
            </a>
            <Link href="/hire/quote" className="btn btn-ghost">
              Request a custom quote
            </Link>
            <HireCartLink />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 rounded-xl border border-ember/25 bg-ember/5 px-5 py-4 text-sm leading-relaxed text-silver-2">
            <span className="font-bold uppercase tracking-[0.16em] text-ember">Studio confirmation.</span>{" "}
            The Sony packages can be requested; availability, deposit and exact accessories are confirmed by the studio. No payment is taken with your request.
          </div>
        </Reveal>

        <div className="mt-10"><SonyShowcase /></div>
      </section>

      <section id="catalogue" className="mx-auto w-full max-w-7xl scroll-mt-28 px-5 pb-24 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-metal sm:text-4xl">
              Choose your equipment.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-steel">
            Sony package rates are in Lesotho loti per rental day. Deposit and availability are confirmed by the studio.
          </p>
        </div>

        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
          <Link
            href="/hire"
            className={`shrink-0 rounded-full border px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] transition-colors ${
              !category
                ? "border-ember bg-ember/10 text-white"
                : "border-white/12 text-steel hover:border-white/25"
            }`}
          >
            All
          </Link>
          {HIRE_CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/hire?category=${c.id}`}
              className={`shrink-0 rounded-full border px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] transition-colors ${
                category === c.id
                  ? "border-ember bg-ember/10 text-white"
                  : "border-white/12 text-steel hover:border-white/25"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="card mt-10 p-10 text-center">
            <h3 className="text-xl font-bold text-metal">No items in this category.</h3>
            <Link href="/hire" className="btn btn-ghost mt-5">
              View all equipment
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={Math.min(i * 0.04, 0.3)}>
                <EquipmentCard item={item} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-white/10 bg-ink-2/40">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
          <Reveal>
            <p className="eyebrow">How hire works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-metal sm:text-4xl">
              Request. Review. Collect.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Build a request",
                copy: "Choose a Sony package and dates, then send a request to the studio.",
              },
              {
                step: "02",
                title: "Studio review",
                copy: "Oxsnow staff confirm real availability, collection details and payment instructions. Pending requests do not hold stock.",
              },
              {
                step: "03",
                title: "Approve & pay",
                copy: "Once approved, follow the payment and deposit details confirmed by the studio.",
              },
              {
                step: "04",
                title: "Collect & return",
                copy: "Inspect at collection, use the gear and return it on the agreed date. The studio will confirm the terms.",
              },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 0.08}>
                <div className="relative border-l border-white/10 pl-5">
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-ember">
                    {s.step}
                  </p>
                  <h3 className="mt-3 text-lg font-bold text-metal">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel">{s.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-10 max-w-3xl text-[0.75rem] leading-relaxed text-ash">{RENTAL_DAY_RULE}</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        <Reveal>
          <div className="card flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow">Need a full package?</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-metal sm:text-3xl">
                Tell us the production. We&apos;ll build the kit list.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-steel">
                Multi-day shoots, crew packages and partner-owned gear can be quoted directly by
                the studio.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/hire/quote" className="btn btn-primary">
                Request a quote
              </Link>
              <Link href="/hire/terms" className="btn btn-ghost">
                Hire terms
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
