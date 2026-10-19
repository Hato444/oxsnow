"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useWatchlist } from "@/components/watch/WatchlistProvider";
import { useWatch } from "@/components/watch/WatchProvider";
import HoverVideo from "@/components/HoverVideo";

function addedLabel(addedAt) {
  if (!addedAt) return null;
  try {
    return new Date(addedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return null;
  }
}

export default function WatchlistPage() {
  const { items, remove, clear, count } = useWatchlist();
  const { open } = useWatch();

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-3">
            <span className="rule-fire" />
            My Watchlist
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-metal sm:text-6xl">
            Saved for later
          </h1>
          <p className="mt-4 text-sm text-steel">
            {count === 0
              ? "Films you save will live here."
              : `${count} ${count === 1 ? "title" : "titles"} saved on this device.`}
          </p>
        </div>
        {count > 0 && (
          <button
            type="button"
            onClick={clear}
            className="rounded-full border border-white/12 px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-steel transition-colors hover:border-red-500/50 hover:text-red-300"
          >
            Clear all
          </button>
        )}
      </div>

      {count === 0 ? (
        <div className="card mt-14 flex flex-col items-center justify-center gap-5 px-8 py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-ember/50 bg-ember/10">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 text-ember"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <h2 className="text-xl font-black tracking-tight text-white">
            Your watchlist is empty
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-steel">
            Tap the bookmark on any film — in the films grid, the VOD storefront
            or inside a trailer — and it will show up here, ready for release day.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/films" className="btn btn-primary">
              Browse Films
            </Link>
            <Link href="/vod" className="btn btn-ghost">
              Explore VOD
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.article
                key={item.title}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                role="button"
                tabIndex={0}
                onClick={() =>
                  open({
                    title: item.title,
                    meta: item.meta,
                    poster: item.poster,
                    src: item.src,
                    teaser: item.teaser,
                    movie: item.movie,
                    logline: item.logline,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open({
                      title: item.title,
                      meta: item.meta,
                      poster: item.poster,
                      src: item.src,
                      teaser: item.teaser,
                      movie: item.movie,
                      logline: item.logline,
                    });
                  }
                }}
                className="card group flex cursor-pointer flex-col overflow-hidden"
              >
                <div className="relative flex h-56 items-end overflow-hidden bg-gradient-to-br from-ink-3 via-ink-2 to-black">
                  {item.preview || item.teaser ? (
                    <HoverVideo
                      src={item.preview || item.teaser}
                      poster={item.poster}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : item.poster ? (
                    <Image
                      src={item.poster}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 opacity-70"
                      style={{
                        background:
                          "radial-gradient(120% 90% at 20% 0%, rgba(255,69,0,0.20), transparent 55%)",
                      }}
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 to-transparent" />

                  {item.status && (
                    <span className="relative z-10 ml-4 mb-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-silver keep-light backdrop-blur">
                      {item.status}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(item.title);
                    }}
                    aria-label={`Remove ${item.title} from watchlist`}
                    title="Remove from watchlist"
                    className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/60 text-silver backdrop-blur transition-colors hover:border-red-500/60 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  {item.meta && (
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ember">
                      {item.meta}
                    </p>
                  )}
                  <h3 className="mt-2 text-lg font-bold text-white transition-colors group-hover:text-ember">
                    {item.title}
                  </h3>
                  {item.logline && (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-steel line-clamp-3">
                      {item.logline}
                    </p>
                  )}
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-[0.65rem] uppercase tracking-[0.18em] text-ash">
                      {addedLabel(item.addedAt)
                        ? `Added ${addedLabel(item.addedAt)}`
                        : "Saved"}
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
      )}
    </section>
  );
}
