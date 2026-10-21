"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import VideoPlayer from "@/components/VideoPlayer";
import PaymentPanel from "./PaymentPanel";
import { useWatchlist } from "./WatchlistProvider";

const BUYER_KEY = "oxsnow-buyer-uid";

function getBuyerKey() {
  try {
    let key = localStorage.getItem(BUYER_KEY);
    if (!key) {
      key =
        (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
        `b-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(BUYER_KEY, key);
    }
    return key;
  } catch {
    return "anonymous";
  }
}

export default function WatchModal({ item, onClose }) {
  const [checkout, setCheckout] = useState(false);
  // view: "info" | "teaser" | "film"
  const [view, setView] = useState("info");
  const [streamUrl, setStreamUrl] = useState(null);
  const [entitled, setEntitled] = useState(false);
  const { has, toggle } = useWatchlist();
  const infoRef = useRef(null);
  const actionsRef = useRef(null);
  const playerRef = useRef(null);

  // reset per film (deferred so state never changes inside the effect body)
  useEffect(() => {
    const t = setTimeout(() => {
      setCheckout(false);
      setView("info");
      setStreamUrl(null);
      setEntitled(false);
    }, 0);
    return () => clearTimeout(t);
  }, [item]);

  // entitlement check — a returning renter gets the film instantly
  const checkEntitlement = useCallback(async () => {
    if (!item?.title) return false;
    try {
      const r = await fetch(
        `/api/stream?title=${encodeURIComponent(item.title)}&userKey=${encodeURIComponent(getBuyerKey())}`
      );
      const data = await r.json();
      if (data.ok && data.url) {
        setStreamUrl(data.url);
        setEntitled(true);
        return true;
      }
      setEntitled(false);
      setStreamUrl(null);
      return false;
    } catch {
      return false;
    }
  }, [item]);

  useEffect(() => {
    if (!item?.title) return;
    // defer so the check never blocks the modal opening
    const t = setTimeout(() => {
      checkEntitlement();
    }, 0);
    return () => clearTimeout(t);
  }, [item, checkEntitlement]);

  const playTeaser = () => {
    setView("teaser");
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleUnlocked = useCallback(async () => {
    const ok = await checkEntitlement();
    if (ok) {
      setView("film");
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [checkEntitlement]);

  const revealActions = () => {
    const info = infoRef.current;
    const actions = actionsRef.current;
    if (!info || !actions) return;
    const infoRect = info.getBoundingClientRect();
    const actRect = actions.getBoundingClientRect();
    const delta = actRect.top - infoRect.top;
    info.scrollTo({ top: info.scrollTop + delta - 16, behavior: "smooth" });
  };

  // Full film plays only from the entitlement-released URL; before payment the
  // public trailer stands in behind the lock.
  const watchingFilm = view === "film" && entitled && streamUrl;
  const watchingTeaser = view === "teaser";
  const playerSrc = watchingTeaser
    ? item?.teaser || item?.src
    : watchingFilm
      ? streamUrl
      : item?.src || item?.teaser;
  const locked = !watchingTeaser && !watchingFilm;

  return (
    <AnimatePresence onExitComplete={() => setCheckout(false)}>
      {item && (
        <motion.div
          key="watch-modal"
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
                  key={view + (entitled ? "-owned" : "")}
                  src={playerSrc}
                  poster={item.poster}
                  title={
                    watchingTeaser
                      ? `${item.title} — Official Teaser`
                      : item.title
                  }
                  locked={locked}
                  autoPlay={watchingTeaser || watchingFilm}
                  onLocked={revealActions}
                  onPlay={!watchingTeaser && !watchingFilm ? revealActions : undefined}
                  onBack={
                    watchingTeaser || watchingFilm ? () => setView("info") : undefined
                  }
                  backLabel={watchingTeaser ? "Back to details" : "Back to film"}
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
                  {watchingFilm && (
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-emerald-300">
                      Unlocked
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
                    {watchingFilm
                      ? "You own this film — enjoy the show"
                      : watchingTeaser
                        ? "You're watching the teaser"
                        : entitled
                          ? "Your film is unlocked"
                          : "Rent to watch the full film"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {!watchingFilm && (
                      <button
                        type="button"
                        onClick={() => {
                          if (entitled && streamUrl) {
                            setView("film");
                            playerRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          } else {
                            setCheckout(true);
                          }
                        }}
                        aria-haspopup={entitled ? undefined : "dialog"}
                        className="btn btn-primary"
                      >
                        {entitled ? "Watch Now" : "Pay / Unlock"}
                      </button>
                    )}
                    {(item.teaser || item.src) && !watchingFilm && (
                      <button
                        type="button"
                        onClick={watchingTeaser ? () => setView("info") : playTeaser}
                        className="btn btn-ghost"
                      >
                        {watchingTeaser ? "Stop Teaser" : "Watch Teaser"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggle(item)}
                      className={`btn ${has(item.title) ? "btn-ghost !border-ember/60 !text-ember" : "btn-ghost"}`}
                    >
                      {has(item.title) ? "✓ On Watchlist" : "Add to Watchlist"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {checkout && item && (
          <PaymentPanel
            key="payment-panel"
            item={item}
            onClose={() => setCheckout(false)}
            onUnlocked={handleUnlocked}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
