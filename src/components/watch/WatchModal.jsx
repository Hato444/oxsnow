"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import VideoPlayer from "@/components/VideoPlayer";

export default function WatchModal({ item, onClose }) {
  const [checkout, setCheckout] = useState(false);
  const [watchingTeaser, setWatchingTeaser] = useState(false);
  const locked = !watchingTeaser;
  const infoRef = useRef(null);
  const actionsRef = useRef(null);
  const playerRef = useRef(null);

  const playTeaser = () => {
    setWatchingTeaser(true);
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const stopTeaser = () => setWatchingTeaser(false);

  useEffect(() => {
    setWatchingTeaser(false);
    setCheckout(false);
  }, [item]);

  const revealActions = () => {
    const info = infoRef.current;
    const actions = actionsRef.current;
    if (!info || !actions) return;
    const infoRect = info.getBoundingClientRect();
    const actRect = actions.getBoundingClientRect();
    const delta = actRect.top - infoRect.top;
    info.scrollTo({ top: info.scrollTop + delta - 16, behavior: "smooth" });
  };

  return (
    <AnimatePresence onExitComplete={() => setCheckout(false)}>
      {item && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/60 text-silver keep-light backdrop-blur transition-colors hover:border-ember hover:text-ember sm:right-6 sm:top-6"
          >
            ✕
          </button>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-3xl"
          >
            <div className="card flex max-h-[88svh] flex-col overflow-hidden">
              <div ref={playerRef} className="shrink-0 scroll-mt-2">
                <VideoPlayer
                  key={watchingTeaser ? "teaser" : "film"}
                  src={watchingTeaser ? item.teaser || item.src : item.src}
                  poster={item.poster}
                  title={watchingTeaser ? `${item.title} — Official Teaser` : item.title}
                  locked={locked}
                  autoPlay={watchingTeaser}
                  onLocked={revealActions}
                  onPlay={watchingTeaser ? undefined : revealActions}
                  onBack={watchingTeaser ? stopTeaser : undefined}
                  backLabel="Back to film"
                  hoverPreview={item.teaser}
                />
              </div>

              <div
                ref={infoRef}
                className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-6"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <h2 className="text-xl font-bold text-metal sm:text-2xl">
                    {item.title}
                  </h2>
                  {item.meta && (
                    <span className="text-[0.65rem] uppercase tracking-[0.22em] text-ember">
                      {item.meta}
                    </span>
                  )}
                </div>

                {item.logline && (
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
                    {item.logline}
                  </p>
                )}

                <div ref={actionsRef} className="mt-5 scroll-mt-4">
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-ember">
                      {watchingTeaser ? "You're watching the teaser" : "Rent to watch the full film"}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCheckout((v) => !v)}
                        className="btn btn-primary"
                      >
                        Rent - M25
                      </button>
                      <button
                        type="button"
                        onClick={watchingTeaser ? stopTeaser : playTeaser}
                        className="btn btn-ghost"
                      >
                        {watchingTeaser ? "Stop Teaser" : "Watch Teaser"}
                      </button>
                      <button type="button" className="btn btn-ghost">
                        Add to Watchlist
                      </button>
                    </div>
                </div>

                <AnimatePresence>
                  {checkout && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 rounded-xl border border-ember/40 bg-ember/5 p-5">
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-ember">
                          M-Pesa Checkout
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-silver-2">
                          Secure mobile payment is being wired up. Soon you&apos;ll
                          enter your M-Pesa number, get a prompt on your phone and
                          confirm with your PIN — just like topping up airtime.
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <input
                            type="tel"
                            placeholder="M-Pesa number (e.g. 5X XX XX XX)"
                            className="h-11 w-full max-w-xs rounded-full border border-white/15 bg-ink px-4 text-sm text-silver outline-none placeholder:text-ash focus:border-ember"
                          />
                          <button type="button" disabled className="btn btn-ghost opacity-60">
                            Pay M25 — Coming Soon
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
