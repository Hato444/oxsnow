"use client";

import Link from "next/link";
import { useRef } from "react";
import { SONY_PACKAGES } from "@/lib/hire/sony-packages.mjs";

export default function SonyShowcase({ compact = false }) {
  const image = useRef(null);

  function tilt(event) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    image.current.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg) translateX(${x * 8}px)`;
  }

  function reset() { if (image.current) image.current.style.transform = ""; }

  return (
    <div className="card grid overflow-hidden lg:grid-cols-[1fr_1fr]">
      <div onPointerMove={tilt} onPointerLeave={reset} className="relative grid min-h-[240px] place-items-center overflow-hidden bg-[#f3f3f3] p-5 sm:min-h-[360px]">
        <img ref={image} src="/equipment/sony-zve10.webp" alt="Sony ZV-E10 camera shown with lens; package contents vary" className="h-full max-h-[380px] w-full object-contain transition-transform duration-300 ease-out motion-reduce:transition-none" />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-10">
        <p className="eyebrow">Oxsnow equipment hire</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-metal sm:text-4xl">Sony ZV-E10</h2>
        <p className="mt-4 text-sm leading-relaxed text-silver-2">Two ways to shoot. Choose your package and send the studio your dates.</p>
        <div className="mt-6 space-y-3">
          {SONY_PACKAGES.map((item) => <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-metal">{item.name.replace("Sony ZV-E10 ", "")}</h3><span className="font-bold text-ember">M{item.dailyRateMinor / 100}/day</span></div><p className="mt-2 text-xs leading-relaxed text-steel">{item.accessories.join(" · ")}</p><Link href={`/hire/${item.slug}`} className="mt-3 inline-block text-xs font-bold uppercase tracking-[0.12em] text-silver-2 hover:text-ember">Request this package →</Link></div>)}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ash">Availability, deposit and rig details are confirmed by the studio. Image shows camera with lens; package contents differ.</p>
        {compact && <Link href="/hire" className="btn btn-ghost mt-6 self-start">Explore equipment hire</Link>}
      </div>
    </div>
  );
}
