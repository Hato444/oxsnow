"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, BookOpen, Camera, HelpCircle, Radio, SlidersHorizontal } from "lucide-react";
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
  { title: "Brief", copy: "Tell us your idea, who it is for and when you need it." },
  { title: "Plan", copy: "We discuss the work, budget, schedule and people needed." },
  { title: "Produce", copy: "The team brings the agreed idea to life." },
  { title: "Deliver", copy: "We prepare and share the finished work in the agreed format." },
];

// Illustrative Unsplash photographs; these do not depict Oxsnow productions.
const imagery = {
  commercial: { src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80", alt: "Camera and lenses on a dark surface" },
  broadcast: { src: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80", alt: "An empty cinema auditorium" },
  education: { src: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1400&q=80", alt: "A speaker addressing an audience" },
  studio: { src: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1400&q=80", alt: "A video editing timeline on a screen" },
};

function ServiceVisual({ id }) {
  const photo = imagery[id];
  if (!photo) return null;
  return <figure className="services-photo"><img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" /><figcaption>Illustrative photo · Unsplash</figcaption></figure>;
}

function ProductionTimeline() {
  return (
    <section className="services-process border-y border-white/10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="eyebrow">How we work</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-black text-metal sm:text-5xl">From your idea to the finished work.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-silver-2">We start by listening, agree on a plan, make the work and share the finished result.</p>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{sequences.map((item, index) => <li key={item.title} className="border-t border-white/20 pt-5"><span className="text-xs font-bold tracking-[0.2em] text-ember">0{index + 1}</span><h3 className="mt-4 text-xl font-bold text-white">{item.title}</h3><p className="mt-3 max-w-xs text-sm leading-relaxed text-silver-2">{item.copy}</p></li>)}</ol>
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
      <section className="services-hero relative overflow-hidden pt-32 sm:pt-36">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 sm:px-8 lg:min-h-[700px] lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div className="relative z-10"><p className="eyebrow flex items-center gap-3"><span className="rule-fire" /> Oxsnow / Services</p><h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.03] tracking-tight text-metal sm:text-6xl xl:text-7xl">From imagination<br />to the final frame.</h1><p className="mt-6 max-w-lg text-lg leading-relaxed text-silver-2 sm:text-xl">Professional filmmaking and production services for businesses, institutions and creatives.</p><div className="mt-9 flex flex-wrap gap-3"><a href="#project-builder" className="btn btn-primary">Start a Project <ArrowUpRight size={16} aria-hidden="true" /></a><a href="#services" className="btn btn-ghost">Explore Services <ArrowDown size={16} aria-hidden="true" /></a></div></div>
          <figure className="services-hero-photo"><img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=85" alt="A film clapperboard on location" fetchPriority="high" /><figcaption>Illustrative photo · Unsplash</figcaption></figure>
        </div>
      </section>

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
