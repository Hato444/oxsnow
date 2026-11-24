"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clapperboard, Camera, AudioLines, ClipboardList, ArrowUpRight } from "lucide-react";
import { academy } from "@/lib/site";
import Reveal from "@/components/Reveal";
import AcademyForm from "./AcademyForm";

const visuals = {
  direction: { icon: Clapperboard, image: "/posters/konono.jpg" },
  camera: { icon: Camera, image: "/posters/lehlaba-phieo.jpg" },
  sound: { icon: AudioLines, image: "/posters/phirimana.jpg" },
  producing: { icon: ClipboardList, image: "/posters/ho-lekane.jpg" },
};

export default function AcademyExperience() {
  const [track, setTrack] = useState("direction");
  const reduced = useReducedMotion();
  const selected = academy.tracks.find((item) => item.id === track) || academy.tracks[0];

  return <main>
    <section className="relative flex min-h-[85svh] items-end overflow-hidden bg-black pt-36">
      <Image src="/gallery/IMG-20261014-WA0080.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-40" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 sm:pb-24">
        <p className="eyebrow flex items-center gap-3"><span className="rule-fire" /> The Oxsnow Academy</p>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-metal sm:text-7xl">Your name belongs<br />in the credits.</h1>
        <p className="mt-6 text-xl font-semibold text-white sm:text-2xl">Don&apos;t just study cinema. Make it.</p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-silver-2">{academy.intro}</p>
        <a href="#apply" className="btn btn-primary mt-8">Join the crew <ArrowUpRight size={16} aria-hidden /></a>
        <div className="mt-14 grid max-w-3xl grid-cols-1 gap-5 border-t border-white/20 pt-6 sm:grid-cols-3">{[["Duration", academy.duration], ["Intake", academy.intake], ["First intake", academy.cost]].map(([label, value]) => <div key={label}><p className="text-[0.6rem] uppercase tracking-[0.22em] text-silver-2">{label}</p><p className="mt-2 text-sm font-bold text-white">{value}</p></div>)}</div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal><p className="eyebrow">Four tracks · one slate</p><h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-metal sm:text-5xl">Find your place on set.</h2></Reveal>
      <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="space-y-2" aria-label="Select a discipline">{academy.tracks.map((item, i) => { const Icon = visuals[item.id].icon; return <button key={item.id} type="button" aria-pressed={track === item.id} onClick={() => setTrack(item.id)} className={`flex w-full items-center gap-4 border-b px-2 py-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ember ${track === item.id ? "border-ember text-white" : "border-white/10 text-steel hover:text-white"}`}><span className="text-xs text-ash">0{i + 1}</span><Icon size={22} strokeWidth={1.5} /><span className="flex-1 text-base font-bold sm:text-lg">{item.title}</span><ArrowUpRight size={17} /></button>; })}</div>
        <div className="relative min-h-[380px] overflow-hidden rounded-xl bg-ink-2 sm:min-h-[460px]">
          <AnimatePresence mode="wait"><motion.div key={selected.id} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.3 }} className="absolute inset-0"><Image src={visuals[selected.id].image} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-center opacity-45" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" /><div className="absolute inset-x-0 bottom-0 p-7 sm:p-10"><p className="eyebrow">Selected discipline</p><h3 className="mt-3 text-2xl font-bold text-white">{selected.title}</h3><p className="mt-3 max-w-md text-sm leading-relaxed text-silver-2">{selected.copy}</p><a href="#apply" className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-ember">Apply for this track <ArrowUpRight size={15} /></a></div></motion.div></AnimatePresence>
        </div>
      </div>
    </section>

    <section className="border-y border-white/10 bg-ink-2/40 py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8"><Reveal><p className="eyebrow">The production journey</p><h2 className="mt-4 text-3xl font-black text-metal sm:text-5xl">From application to credit.</h2></Reveal><div className="mt-12 border-l border-white/20 pl-8 sm:pl-12">{academy.steps.map((step) => <Reveal key={step.step}><div className="relative mb-14 max-w-2xl last:mb-0"><span className="absolute -left-[2.4rem] top-1 h-3 w-3 rounded-full border border-ember bg-ink sm:-left-[3.4rem]" /><p className="text-xs font-bold tracking-[0.22em] text-ember">SCENE {step.step}</p><h3 className="mt-3 text-2xl font-bold text-white">{step.title}</h3><p className="mt-3 text-sm leading-relaxed text-silver-2">{step.copy}</p></div></Reveal>)}</div><Reveal><div className="mt-20 overflow-hidden border-y border-white/10 py-14 text-center"><p className="text-xs uppercase tracking-[0.35em] text-steel">An Oxsnow production</p><motion.p initial={reduced ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: reduced ? 0 : 0.8 }} className="mt-5 text-3xl font-black tracking-[0.12em] text-white sm:text-5xl">YOUR NAME HERE</motion.p><p className="mt-4 text-xs uppercase tracking-[0.3em] text-ash">The next story starts with you</p></div></Reveal></div></section>

    <section id="apply" className="mx-auto grid max-w-7xl scroll-mt-24 gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-32"><div><p className="eyebrow">Join the crew</p><h2 className="mt-4 text-3xl font-black text-metal sm:text-5xl">Your story starts here.</h2><p className="mt-6 max-w-md text-sm leading-relaxed text-silver-2">No degree, no gear, no experience required. Tell us who you are and why you want to join.</p><p className="mt-6 text-sm text-steel">{academy.duration} · {academy.intake} · {academy.cost}</p></div><AcademyForm track={track} onTrackChange={setTrack} /></section>
  </main>;
}
