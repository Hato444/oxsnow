"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SONY_PACKAGES } from "@/lib/hire/sony-packages.mjs";

function CameraTurntable() {
  const stage = useRef(null);
  const video = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = video.current;
    const container = stage.current;
    if (!element || !container) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      if (!visible || motion.matches || document.hidden) { element.pause(); return; }
      element.play().catch((error) => { if (error.name !== "AbortError") setFailed(true); });
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: 0.1 });
    observer.observe(container);
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); motion.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); element.pause(); };
  }, []);

  return <div ref={stage} className="relative flex w-full items-center justify-center overflow-hidden bg-black" aria-label="Sony ZV-E10 camera">
    <video ref={video} muted loop playsInline preload="metadata" poster="/equipment/sony-zve10-turntable-poster.webp" aria-hidden="true" onError={() => setFailed(true)} className={`w-full max-w-[740px] object-contain motion-reduce:hidden ${failed ? "hidden" : "block"}`}>
      <source src="/equipment/sony-zve10-turntable.mp4" type="video/mp4" />
    </video>
    <img src="/equipment/sony-zve10-turntable-poster.webp" alt="" className={`w-full max-w-[740px] object-contain motion-reduce:block ${failed ? "block" : "hidden"}`} />
  </div>;
}

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

  if (compact) return (
    <div className="grid items-center gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
      <div className="order-2 pb-8 lg:order-1 lg:py-12">
        <p className="eyebrow flex items-center gap-3"><span className="rule-fire" /> Equipment Hire</p>
        <h2 className="mt-6 max-w-xl text-4xl font-black leading-[1.04] tracking-tight text-metal sm:text-6xl">Your vision.<br />Our gear.</h2>
        <p className="mt-6 text-lg font-semibold text-white">Sony ZV-E10</p>
        <p className="mt-3 max-w-md text-base leading-relaxed text-silver-2">Professional filmmaking equipment, available for your next production.</p>
        <div className="mt-8 max-w-sm border-y border-white/10 py-4 text-sm text-silver-2"><div className="flex justify-between gap-4 py-2"><span>Camera body</span><span className="font-bold text-white">M600/day</span></div><div className="flex justify-between gap-4 py-2"><span>Ready-to-shoot package</span><span className="font-bold text-white">M850/day</span></div></div>
        <Link href="/hire" className="btn btn-primary mt-8">Explore Equipment <span aria-hidden="true">→</span></Link>
        <p className="mt-5 max-w-md text-xs leading-relaxed text-ash">Availability and deposit are confirmed by the studio. The image shows a lens; package contents vary.</p>
      </div>
      <div className="order-1 lg:order-2"><CameraTurntable /></div>
    </div>
  );

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
      </div>
    </div>
  );
}
