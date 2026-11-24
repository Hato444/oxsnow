"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowDown, ArrowUpRight, AudioLines, BookOpen, Camera, Clapperboard, Film, HelpCircle, MonitorPlay, Radio, SlidersHorizontal } from "lucide-react";
import { films, services } from "@/lib/site";
import ProjectBuilder from "./ProjectBuilder";

const icons = { commercial: Camera, broadcast: Radio, education: BookOpen, studio: SlidersHorizontal, general: HelpCircle };
const descriptions = {
  commercial: "Need a video for your business, organisation or story? Talk to us about making it, from the first idea to the finished video.",
  broadcast: "Want to show an Oxsnow film or use existing footage? Tell us where and how you would like to use it.",
  education: "Bring Basotho stories to your school, university or group through screenings and educational enquiries.",
  studio: "Need cameras, crew or help finishing a production? Tell us what you need for your project.",
  general: "Not sure which service is right for you? Tell us your idea and we can help you find a starting point.",
};
const helpService = { id: "general", title: "Help me choose", tag: "Not sure yet?", copy: descriptions.general, includes: [] };
const sequences = [
  { title: "Brief", copy: "Tell us your idea, who it is for and when you need it.", icon: Clapperboard },
  { title: "Plan", copy: "We discuss the work, budget, schedule and people needed.", icon: Clapperboard },
  { title: "Produce", copy: "The team brings the agreed idea to life.", icon: Camera },
  { title: "Deliver", copy: "We prepare and share the finished work in the agreed format.", icon: Film },
];

function ServiceVisual({ id }) {
  if (id === "commercial") return <div className="service-visual service-viewfinder" aria-hidden="true"><div className="service-frame"><span className="service-cross">+</span><Camera size={78} strokeWidth={0.8} /><span className="service-rec">● REC</span><span className="service-meta">CAM / 01 &nbsp; • &nbsp; FRAME</span></div></div>;
  if (id === "broadcast") return <div className="service-visual service-broadcast" aria-hidden="true"><div className="service-screen"><MonitorPlay size={64} strokeWidth={0.8} /><span>OXSNOW / DISTRIBUTION</span></div><div className="service-signal"><span /><span /><span /><span /><span /></div></div>;
  if (id === "education") return <div className="service-visual service-education" aria-hidden="true"><div className="service-book"><span>STORIES</span><Film size={58} strokeWidth={0.8} /><small>SCREEN / DISCOVER / DISCUSS</small></div><div className="service-orbit" /></div>;
  if (id === "studio") return <div className="service-visual service-studio" aria-hidden="true"><AudioLines size={94} strokeWidth={0.8} /><div className="service-faders">{[35, 65, 45, 75, 55].map((height, i) => <span key={i}><i style={{ bottom: `${height}%` }} /></span>)}</div><small>STUDIO / PRODUCTION</small></div>;
  return <div className="service-visual service-education" aria-hidden="true"><HelpCircle size={80} strokeWidth={0.8} /><div className="service-orbit" /></div>;
}

function ProductionTimeline() {
  const ref = useRef(null);
  const [stage, setStage] = useState(0);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!reduced) setStage(Math.min(3, Math.floor(value * 4)));
  });
  const selected = sequences[stage];
  const Icon = selected.icon;
  return (
    <section ref={ref} className="service-timeline-wrap border-y border-white/10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="eyebrow">How we work</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-black text-metal sm:text-5xl">From your idea to the finished work.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-silver-2">We start by listening, agree on a plan, make the work and share the finished result. Select a step to learn more.</p>
        <div className="service-timeline mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4"><span className="text-sm font-bold text-silver-2">The four steps</span><span className="font-mono text-xs text-ash">0{stage + 1} / 04</span></div>
          <div className="p-4 sm:p-7">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{sequences.map((item, index) => <button type="button" key={item.title} onClick={() => setStage(index)} aria-pressed={stage === index} className={`service-sequence-button ${stage === index ? "is-active" : ""}`}><span>0{index + 1}</span><strong>{item.title}</strong></button>)}</div>
            <div className="relative mt-4 h-12 border-y border-white/10"><div className="service-waveform" aria-hidden="true" /><span className="service-playhead" style={{ left: `${stage * 25 + 12.5}%` }} aria-hidden="true" /></div>
            <div className="mt-6 flex min-h-28 items-start gap-5"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-ember"><Icon size={22} aria-hidden="true" /></span><div aria-live="polite"><p className="text-xs uppercase tracking-[0.22em] text-ash">Step 0{stage + 1}</p><h3 className="mt-2 text-xl font-bold text-white">{selected.title}</h3><p className="mt-2 max-w-xl text-sm leading-relaxed text-silver-2">{selected.copy}</p></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ServicesExperience() {
  const [selected, setSelected] = useState("commercial");
  const reduced = useReducedMotion();
  const service = services.find((item) => item.id === selected) || helpService;
  return (
    <main>
      <section className="service-hero overflow-hidden pt-36"><div className="mx-auto grid min-h-[600px] max-w-7xl items-center gap-12 px-5 pb-20 sm:px-8 lg:grid-cols-[1fr_0.9fr]"><div><p className="eyebrow flex items-center gap-3"><span className="rule-fire" /> Oxsnow / Services</p><h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.03] tracking-tight text-metal sm:text-6xl xl:text-7xl">From imagination<br />to the final frame.</h1><p className="mt-6 text-lg font-semibold text-white sm:text-xl">One studio. Endless creative possibilities.</p><p className="mt-4 max-w-xl text-sm leading-relaxed text-silver-2">We help make videos, share films, organise screenings and support productions.</p><div className="mt-9 flex flex-wrap gap-3"><a href="#project-builder" className="btn btn-primary">Start a Project <ArrowUpRight size={16} aria-hidden="true" /></a><a href="#services" className="btn btn-ghost">Explore Our Services <ArrowDown size={16} aria-hidden="true" /></a></div></div><div className="service-hero-graphic" aria-hidden="true"><div className="service-hero-frame"><span className="service-hero-top">OXSNOW STUDIO <i>●</i> FRAME 001</span><div className="service-hero-cross">+</div><div className="service-hero-lens"><span /><span /><span /></div><span className="service-hero-bottom">CONCEPT &nbsp; / &nbsp; PRODUCTION &nbsp; / &nbsp; DELIVERY</span></div></div></div></section>

      <section id="services" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">What we offer</p><h2 className="mt-4 text-3xl font-black text-metal sm:text-5xl">How can we help?</h2></div><p className="max-w-sm text-sm leading-relaxed text-silver-2">Choose an option to learn more. If you&apos;re unsure, we can help you decide.</p></div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-1" aria-label="Services">{[...services, helpService].map((item, index) => { const Icon = icons[item.id]; return <button type="button" key={item.id} onClick={() => setSelected(item.id)} aria-pressed={selected === item.id} className={`service-nav-item ${selected === item.id ? "is-active" : ""}`}><span className="font-mono text-xs text-ash">0{index + 1}</span><Icon size={20} strokeWidth={1.5} aria-hidden="true" /><span className="flex-1 text-left">{item.title}</span><ArrowUpRight size={16} aria-hidden="true" /></button>; })}</div>
          <div className="min-w-0"><AnimatePresence mode="wait"><motion.div key={service.id} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0 }} transition={{ duration: reduced ? 0 : 0.2 }}><ServiceVisual id={service.id} /><div className="mt-7"><p className="eyebrow">{service.title}</p><h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{service.title}</h3><p className="mt-4 max-w-2xl text-base leading-relaxed text-silver-2">{descriptions[service.id]}</p>{service.id !== "general" && <><p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel">{service.copy}</p><ul className="mt-6 grid gap-x-8 gap-y-3 border-t border-white/10 pt-5 sm:grid-cols-2">{service.includes.map((item) => <li key={item} className="flex items-start gap-3 text-sm text-silver-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ember" />{item}</li>)}</ul></>}<a href="#project-builder" className="btn btn-primary mt-7">{service.id === "general" ? "Ask for help" : "Request this service"} <ArrowUpRight size={16} aria-hidden="true" /></a></div></motion.div></AnimatePresence></div>
        </div>
      </section>

      <ProductionTimeline />
      <ProjectBuilder selected={selected} onSelect={setSelected} />
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Made by Oxsnow</p><h2 className="mt-4 text-3xl font-black text-metal sm:text-5xl">Stories already in motion.</h2><p className="mt-4 max-w-xl text-sm text-silver-2">Explore productions from the Oxsnow film catalogue.</p></div><Link href="/films" className="btn btn-ghost">Explore the films <ArrowUpRight size={16} aria-hidden="true" /></Link></div><div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{films.map((film) => <Link key={film.title} href="/films" className="group min-w-0"><div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-ink-2"><Image src={film.cover} alt={`${film.title} poster`} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none" /></div><h3 className="mt-3 truncate text-sm font-bold text-white group-hover:text-ember">{film.title}</h3><p className="mt-1 text-xs text-silver-2">{film.type} · {film.year}</p></Link>)}</div></section>
    </main>
  );
}
