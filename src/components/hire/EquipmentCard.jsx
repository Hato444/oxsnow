"use client";

import Link from "next/link";
import EquipmentGallery from "./EquipmentGallery";
import { money } from "@/lib/hire/ui";

export default function EquipmentCard({ item, free = 0 }) {
  const unresolved = (item.images?.length ?? 0) === 0;
  const priced = item.dailyRateMinor > 0;

  return (
    <article className="card group flex h-full flex-col overflow-hidden">
      <div className="relative">
        <EquipmentGallery name={item.name} images={item.images} variant="card" />
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-2">
          <span className="rounded-full bg-ink/85 px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-silver backdrop-blur">
            Demo
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.14em] backdrop-blur ${
              unresolved
                ? "bg-amber-500/20 text-amber-200"
                : free > 0
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "bg-red-500/20 text-red-200"
            }`}
          >
            {unresolved ? "Model to confirm" : free > 0 ? `${free} free today` : "Booked today"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-ash">{item.categoryLabel}</p>
        <h3 className="mt-2 text-lg font-bold text-metal">{item.name}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-steel">
          {item.description}
        </p>
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/8 pt-4">
          <div>
            {priced ? (
              <>
                <p className="text-lg font-black text-fire">
                  {money(item.dailyRateMinor)}
                  <span className="ml-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ash">
                    / day
                  </span>
                </p>
                <p className="text-[0.65rem] text-ash">
                  {money(item.depositMinor)} refundable deposit
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-amber-200">Price on request</p>
                <p className="text-[0.65rem] text-ash">Hire details to be confirmed</p>
              </>
            )}
          </div>
          <Link
            href={`/hire/${item.slug}`}
            className="rounded-full border border-white/15 px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-silver transition-colors group-hover:border-ember group-hover:text-ember"
          >
            {unresolved ? "View details" : "View & book"}
          </Link>
        </div>
      </div>
    </article>
  );
}
