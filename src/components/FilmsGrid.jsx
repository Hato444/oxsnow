"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { filmFilters } from "@/lib/site";
import { useWatch } from "@/components/watch/WatchProvider";
import WatchlistButton from "@/components/watch/WatchlistButton";
import HoverVideo from "@/components/HoverVideo";

export default function FilmsGrid({ films }) {
  const [filter, setFilter] = useState("All");
  const { open } = useWatch();

  const modalItem = (f) => ({
    title: f.title,
    meta: `${f.type} - ${f.year} - ${f.runtime}`,
    poster: f.cover,
    src: f.src,
    teaser: f.teaser,
    movie: f.movie,
    logline: f.logline,
    status: f.status,
    preview: f.preview,
  });

  const shown = useMemo(() => {
    const list =
      filter === "All" ? films : films.filter((f) => f.type === filter);
    // Newest first, oldest last.
    return [...list].sort((a, b) => Number(b.year) - Number(a.year));
  }, [filter, films]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {filmFilters.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-all ${
                active
                  ? "border-ember bg-ember/10 text-white shadow-[0_0_20px_-6px_rgba(255,69,0,0.7)]"
                  : "border-white/12 text-steel hover:border-white/30 hover:text-silver"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((f) => (
            <motion.article
              key={f.title}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              role="button"
              tabIndex={0}
              onClick={() => open(modalItem(f))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  open(modalItem(f));
                }
              }}
              className="card group flex cursor-pointer flex-col overflow-hidden"
            >
              <div className="relative flex h-56 items-end overflow-hidden bg-gradient-to-br from-ink-3 via-ink-2 to-black">
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
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0 opacity-70"
                    style={{
                      background:
                        "radial-gradient(120% 90% at 20% 0%, rgba(255,69,0,0.20), transparent 55%), radial-gradient(90% 80% at 100% 120%, rgba(192,192,192,0.10), transparent 60%)",
                    }}
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 to-transparent" />
                <span className="relative z-10 ml-4 mb-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-silver keep-light backdrop-blur">
                  {f.status}
                </span>
                <span className="absolute left-4 top-4 z-10 text-[0.6rem] uppercase tracking-[0.2em] text-ash">
                  {f.year}
                </span>
                <WatchlistButton
                  item={modalItem(f)}
                  className="absolute right-4 top-4 z-20"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ember">
                  {f.type}
                </p>
                <h3 className="mt-2 text-lg font-bold text-white transition-colors group-hover:text-ember">
                  {f.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {f.logline}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[0.65rem] uppercase tracking-[0.18em] text-ash">
                    {f.runtime}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-silver-2 transition-colors group-hover:text-ember">
                    Watch Trailer →
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
