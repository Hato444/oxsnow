"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import WatchTrigger from "@/components/watch/WatchTrigger";
import HoverVideo from "@/components/HoverVideo";

export default function FeaturedRail({ films }) {
  const railRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const update = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    update();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const step = () => {
    const el = railRef.current;
    if (!el) return 320;
    const card = el.querySelector("[data-card]");
    const w = card ? card.getBoundingClientRect().width + 20 : 320;
    return w;
  };

  const scrollBy = useCallback((dir) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * step(), behavior: "smooth" });
  }, []);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollBy(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollBy(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      railRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    } else if (e.key === "End") {
      e.preventDefault();
      const el = railRef.current;
      el?.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    }
  };

  return (
    <div className="relative mt-10">
      <div
        ref={railRef}
        tabIndex={0}
        role="region"
        aria-label="Featured projects — use arrow keys to browse"
        onKeyDown={onKeyDown}
        onMouseDown={() => setDragging(true)}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        className={`no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0a0a] ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ scrollPaddingLeft: "0px" }}
      >
        {films.map((f) => (
          <div
            key={f.title}
            data-card
            className="snap-start shrink-0"
          >
            <WatchTrigger
              item={{
                title: f.title,
                meta: `${f.type} - ${f.year}`,
                poster: f.cover,
                src: f.src,
                teaser: f.teaser,
                logline: f.logline,
              }}
              className="card group block h-full w-[280px] overflow-hidden text-left sm:w-[320px]"
            >
              <div className="relative flex h-48 items-end overflow-hidden bg-gradient-to-br from-ink-3 via-ink-2 to-black">
                {f.preview || f.teaser ? (
                  <HoverVideo
                    src={f.preview || f.teaser}
                    poster={f.cover}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : f.cover ? (
                  <Image
                    src={f.cover}
                    alt={f.title}
                    fill
                    sizes="320px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{
                      background:
                        "radial-gradient(120% 90% at 15% 0%, rgba(255,69,0,0.22), transparent 55%), radial-gradient(90% 80% at 100% 120%, rgba(192,192,192,0.10), transparent 60%)",
                    }}
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 to-transparent" />
                <span className="relative z-10 ml-4 mb-4 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-silver keep-light backdrop-blur">
                  {f.status}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-white transition-colors group-hover:text-ember">
                  {f.title}
                </h3>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-ember">
                  {f.type} - {f.year}
                </p>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-steel">
                  {f.logline}
                </p>
              </div>
            </WatchTrigger>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ember to-[#e25822] transition-[width] duration-200"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canLeft}
            aria-label="Previous films"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.03] text-silver transition-colors hover:border-ember hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember disabled:cursor-not-allowed disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canRight}
            aria-label="Next films"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.03] text-silver transition-colors hover:border-ember hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember disabled:cursor-not-allowed disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
