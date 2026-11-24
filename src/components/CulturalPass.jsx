"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CulturalPass({ films }) {
  const [selected, setSelected] = useState(0);
  const [preview, setPreview] = useState(null);
  const active = preview ?? selected;

  return (
    <div className="card relative overflow-hidden px-6 py-14 text-center sm:px-16 sm:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {films.map((film, i) => (
          <div key={film.title} className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${i === active ? "opacity-100" : "opacity-0"}`}>
            <Image src={film.cover} alt="" fill sizes="(max-width: 768px) 100vw, 1280px" className="object-cover object-center" />
          </div>
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.86),rgba(10,10,10,0.91)_55%,rgba(10,10,10,0.96))]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_100%_at_50%_120%,rgba(255,69,0,0.22),transparent_65%)]" />
      </div>
      <div className="relative">
        <p className="eyebrow">The Cultural Pass</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight text-metal sm:text-5xl">Stream the stories that built a nation.</h2>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-silver-2">Two film viewings for M25, or 30 days of unlimited viewing of published VOD films with the M100 Cultural Pass.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link href="/vod" className="btn btn-primary cultural-pass-sweep hover:transform-none">Enter VOD</Link>
          <Link href="/contact" className="btn btn-ghost transition-colors duration-200 hover:transform-none hover:border-ember hover:text-ember motion-reduce:transition-none">Partner With Us <span aria-hidden="true">→</span></Link>
        </div>
        {films.length > 0 && (
          <div className="mx-auto mt-12 max-w-2xl border-t border-white/10 pt-6 text-left">
            <div className="mb-3 flex items-center justify-between gap-4"><p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-silver-2">Explore the stories</p><span aria-hidden="true" className="text-xs text-ash sm:hidden">Swipe →</span></div>
            <div className="flex snap-x gap-3 overflow-x-auto pb-2" aria-label="Choose a film to preview">
              {films.map((film, i) => (
                <button key={film.title} type="button" aria-pressed={selected === i} onClick={() => { setSelected(i); setPreview(null); }} onPointerEnter={(e) => { if (e.pointerType === "mouse") setPreview(i); }} onPointerLeave={() => setPreview(null)} onFocus={() => setPreview(i)} onBlur={() => setPreview(null)} className={`flex min-w-[145px] snap-start items-center gap-3 rounded-lg border p-2 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember motion-reduce:transition-none ${active === i ? "border-ember/60 bg-white/10" : "border-white/10 bg-black/35 hover:border-white/30"}`}>
                  <span className="relative h-16 w-11 shrink-0 overflow-hidden rounded"><Image src={film.cover} alt="" fill sizes="44px" className="object-cover" /></span>
                  <span><span className="block text-xs font-semibold text-white">{film.title}</span><span className={`mt-2 block h-0.5 w-5 rounded-full ${active === i ? "bg-ember" : "bg-white/20"}`} /></span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
