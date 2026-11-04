import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import EquipmentBooking from "@/components/hire/EquipmentBooking";
import HireCartLink from "@/components/hire/HireCartLink";
import { getEquipmentBySlug, getRelatedEquipment } from "@/lib/hire/data";
import { RENTAL_DAY_RULE, todayISO } from "@/lib/hire/rules.mjs";
import { money } from "@/lib/hire/ui";

export const instant = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await getEquipmentBySlug(slug);
  if (!item) return { title: "Equipment not found" };
  return {
    title: `${item.name} — Equipment Hire`,
    description: item.description.slice(0, 180),
  };
}

export default async function EquipmentPage({ params }) {
  await connection();
  const { slug } = await params;
  const item = await getEquipmentBySlug(slug);
  if (!item) notFound();
  const related = await getRelatedEquipment(item.category, item.id);
  const today = todayISO();
  const image = item.images?.[0] || "/equipment/demo-card.svg";

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/hire"
          className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ash transition-colors hover:text-ember"
        >
          ← All equipment
        </Link>
        <HireCartLink />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-2">
            <img src={image} alt={item.name} className="aspect-[3/2] w-full object-cover" />
          </div>
          {item.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {item.images.slice(1, 5).map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="aspect-[3/2] w-full rounded-lg border border-white/10 object-cover"
                />
              ))}
            </div>
          )}

          <div className="mt-8">
            <p className="eyebrow">{item.categoryLabel}</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-metal sm:text-5xl">
              {item.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-steel">
              {item.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-ember/30 bg-ember/5 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ember">
                Demo listing
              </span>
              <span className="rounded-full border border-white/12 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-steel">
                {item.quantityTotal} unit{item.quantityTotal === 1 ? "" : "s"} in demo stock
              </span>
              <span className="rounded-full border border-white/12 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-steel">
                {item.ownership === "partner" ? "Partner-owned" : "Oxsnow-owned"}
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-lg font-bold text-metal">Specifications</h2>
              {item.specs.length === 0 ? (
                <p className="mt-3 text-sm text-ash">Specifications to be confirmed by the studio.</p>
              ) : (
                <dl className="mt-4 space-y-2.5 text-sm">
                  {item.specs.map((s, i) => (
                    <div key={`${s.label}-${i}`} className="flex justify-between gap-4 border-b border-white/8 pb-2">
                      <dt className="text-ash">{s.label}</dt>
                      <dd className="text-right text-silver-2">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-metal">Included accessories</h2>
              {item.accessories.length === 0 ? (
                <p className="mt-3 text-sm text-ash">Accessories to be confirmed by the studio.</p>
              ) : (
                <ul className="mt-4 space-y-2 text-sm text-steel">
                  {item.accessories.map((a, i) => (
                    <li key={`${a}-${i}`} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-white/10 bg-ink-2 p-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-metal">Pricing</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-2xl font-black text-fire">{money(item.dailyRateMinor)}</p>
                <p className="text-[0.65rem] uppercase tracking-[0.16em] text-ash">per rental day</p>
              </div>
              <div>
                <p className="text-2xl font-black text-metal">{money(item.depositMinor)}</p>
                <p className="text-[0.65rem] uppercase tracking-[0.16em] text-ash">
                  refundable deposit
                </p>
              </div>
            </div>
            <p className="mt-4 text-[0.72rem] leading-relaxed text-ash">{RENTAL_DAY_RULE}</p>
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-28">
          <EquipmentBooking equipment={item} today={today} />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-white/10 pt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">More in {item.categoryLabel}</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-metal">
                Complete the package.
              </h2>
            </div>
            <Link href={`/hire?category=${item.category}`} className="btn btn-ghost">
              View category
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link key={r.id} href={`/hire/${r.slug}`} className="card overflow-hidden">
                <img
                  src={r.images?.[0] || "/equipment/demo-card.svg"}
                  alt={r.name}
                  className="h-36 w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-[0.58rem] uppercase tracking-[0.18em] text-ash">
                    {r.categoryLabel}
                  </p>
                  <h3 className="mt-1.5 font-bold text-metal">{r.name}</h3>
                  <p className="mt-1 text-sm text-fire">{money(r.dailyRateMinor)}/day</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
