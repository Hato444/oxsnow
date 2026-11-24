"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import VideoPlayer from "@/components/VideoPlayer";
import PaymentPanel from "./PaymentPanel";
import CreditIndicator from "./CreditIndicator";
import { useWatchlist } from "./WatchlistProvider";

export default function WatchModal({ item, onClose }) {
  const [checkout, setCheckout] = useState(false);
  // view: "info" | "teaser" | "film"
  const [view, setView] = useState("info");
  const [streamUrl, setStreamUrl] = useState(null);
  const [entitled, setEntitled] = useState(false);
  const [teaserStatus, setTeaserStatus] = useState("loading");
  const [access, setAccess] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [initialTime, setInitialTime] = useState(0);
  const lastProgress = useRef(0);
  const [streamError, setStreamError] = useState("");
  const confirming = useRef(false);
  const confirmed = useRef(false);
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
      setAccess(null);
      setSessionId(null);
      confirmed.current = false;
    }, 0);
    return () => clearTimeout(t);
  }, [item]);

  // entitlement check — a returning renter gets the film instantly
  const checkEntitlement = useCallback(async () => {
    if (!item?.title) return false;
    try {
      const r = await fetch(
        `/api/stream?title=${encodeURIComponent(item.title)}`
      );
      const data = await r.json();
      if (!data.ok) { setAccess(null); setEntitled(false); return false; }
      setAccess(data);
      const canWatch = Boolean(data.available && (data.passExpiresAt || data.legacyFilm || data.remaining > 0 || data.activeSession));
      setEntitled(canWatch);
      return canWatch;
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
    setTeaserStatus("loading");
    setView("teaser");
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleUnlocked = useCallback(async () => {
    await checkEntitlement();
  }, [checkEntitlement]);

  const startPlayback = async () => {
    setStreamError("");
    try {
      const response = await fetch("/api/stream", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start", title: item.title }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start playback.");
      confirmed.current = false;
      setSessionId(data.sessionId);
      setInitialTime(data.position || 0);
      lastProgress.current = Date.now();
      setStreamUrl(data.url);
      setView("film");
    } catch (error) { setStreamError(error.message); }
  };

  const playbackStatus = async (status) => {
    if (status !== "playing" || !sessionId || confirmed.current || confirming.current) return;
    confirming.current = true;
    try {
      const response = await fetch("/api/stream", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "playing", sessionId }) });
      if (!response.ok) throw new Error("Could not confirm playback. Please try again.");
      confirmed.current = true;
      await checkEntitlement();
    } catch (error) { setStreamError(error.message); }
    finally { confirming.current = false; }
  };

  const finishPlayback = async () => {
    if (!sessionId) return;
    await fetch("/api/stream", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "complete", sessionId }) });
    setView("info");
    setStreamUrl(null);
    setSessionId(null);
    await checkEntitlement();
  };

  const saveProgress = (position) => {
    if (!sessionId || !confirmed.current || Date.now() - lastProgress.current < 10000) return;
    lastProgress.current = Date.now();
    fetch("/api/stream", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "progress", sessionId, position }) }).catch(() => {});
  };

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
                  protectedPlayback={Boolean(watchingFilm)}
                  autoPlay={watchingTeaser || watchingFilm}
                  onPlaybackStatus={watchingTeaser ? setTeaserStatus : watchingFilm ? playbackStatus : undefined}
                  onEnded={watchingFilm ? finishPlayback : undefined}
                  initialTime={watchingFilm ? initialTime : 0}
                  onProgress={watchingFilm ? saveProgress : undefined}
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
                  {access?.passExpiresAt ? <p className="mb-3 text-sm text-silver-2">Cultural Pass Active · Unlimited viewing · Expires {new Date(access.passExpiresAt).toLocaleDateString()}</p> : access && <div className="mb-3"><CreditIndicator remaining={access.remaining} /></div>}
                  {streamError && <p role="alert" className="mb-3 text-sm text-red-300">{streamError}</p>}
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-ember">
                    {watchingFilm
                      ? "Enjoy the show"
                      : watchingTeaser
                        ? teaserStatus === "playing"
                          ? "You're watching the teaser"
                          : teaserStatus === "error"
                            ? "Unable to play the teaser"
                            : teaserStatus === "blocked" || teaserStatus === "paused"
                              ? "Press play to watch the teaser"
                              : "Loading teaser…"
                        : entitled
                          ? "Your film is unlocked"
                          : "Rent to watch the full film"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {!watchingFilm && (
                      <button
                        type="button"
                        onClick={() => {
                          if (entitled) {
                            startPlayback();
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
