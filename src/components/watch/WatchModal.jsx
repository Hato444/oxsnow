"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import VideoPlayer from "@/components/VideoPlayer";
import { useWatchlist } from "./WatchlistProvider";

export default function WatchModal({ item, onClose }) {
  const [checkout, setCheckout] = useState(false);
  const [watchingTeaser, setWatchingTeaser] = useState(false);
  const { has, toggle } = useWatchlist();
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
                  src={watchingTeaser ? item.teaser || item.src : item.movie || item.src}
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
                      {(item.teaser || item.src) && (
                        <button
                          type="button"
                          onClick={watchingTeaser ? stopTeaser : playTeaser}
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

                <AnimatePresence>
                  {checkout && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <CheckoutPanel item={item} />
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

const STATUS_COPY = {
  awaiting_authorisation: "Check your phone — enter your M-Pesa PIN to authorise.",
  paid: "Payment confirmed. The film is unlocked — press Play.",
  failed: "Payment failed. You were not charged. Try again.",
  cancelled: "Payment cancelled. No charge was made.",
  expired: "This order expired. Start again when you're ready.",
};

function CheckoutPanel({ item }) {
  const [method, setMethod] = useState("mpesa");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [simulated, setSimulated] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (id) => {
    stopPolling();
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts += 1;
      if (attempts > 40) {
        stopPolling();
        setStatus("expired");
        return;
      }
      try {
        const r = await fetch(
          `/api/payments?orderId=${encodeURIComponent(id)}&userKey=${encodeURIComponent(getBuyerKey())}`
        );
        const data = await r.json();
        if (data.ok && data.status) {
          if (["paid", "failed", "cancelled", "expired", "purchased"].includes(data.status)) {
            stopPolling();
          }
          setStatus(data.status);
        }
      } catch {
        /* transient network error — keep polling */
      }
    }, 2500);
  };

  const pay = async () => {
    setError("");
    if (!/^5\d{7}$/.test(phone.replace(/[\s-]/g, ""))) {
      setError("Enter a valid 8-digit M-Pesa number starting with 5.");
      return;
    }
    setStatus("busy");
    try {
      const r = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: item.title, userKey: getBuyerKey(), phone }),
      });
      const data = await r.json();
      if (data.alreadyOwned) {
        setStatus("purchased");
        return;
      }
      if (data.ok && data.orderId) {
        setOrderId(data.orderId);
        setSimulated(Boolean(data.simulated));
        setStatus(data.status || "awaiting_authorisation");
        startPolling(data.orderId);
        return;
      }
      setStatus("");
      setError(data.error || "Could not start payment.");
    } catch {
      setStatus("");
      setError("Network error — please try again.");
    }
  };

  const success = status === "paid" || status === "purchased";

  return (
    <div className="mt-5 rounded-xl border border-ember/40 bg-ember/5 p-5">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-ember">
        Choose payment method
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-md">
        <button
          type="button"
          onClick={() => setMethod("mpesa")}
          className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 transition-colors ${
            method === "mpesa"
              ? "border-ember bg-ember/10"
              : "border-white/15 bg-ink hover:border-white/35"
          }`}
        >
          <span
            className="grid h-10 w-10 place-items-center rounded-full text-[0.65rem] font-extrabold tracking-tight text-white"
            style={{ background: "#E2001A" }}
          >
            M-Pesa
          </span>
          <span className="text-xs font-semibold text-silver">M-Pesa</span>
          <span className="text-[0.55rem] uppercase tracking-[0.18em] text-ember">Lesotho</span>
        </button>

        <button
          type="button"
          disabled
          className="flex cursor-not-allowed flex-col items-center gap-2 rounded-xl border border-white/10 bg-ink/60 px-4 py-4 opacity-50"
        >
          <span
            className="grid h-10 w-10 place-items-center rounded-full text-[0.6rem] font-extrabold tracking-tight text-white"
            style={{ background: "#007A3D" }}
          >
            EcoCash
          </span>
          <span className="text-xs font-semibold text-silver">EcoCash</span>
          <span className="text-[0.55rem] uppercase tracking-[0.18em] text-ash">Coming soon</span>
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-ink/70 p-4 text-sm">
        <div className="flex flex-wrap justify-between gap-2 text-silver-2">
          <span className="text-steel">{item.title}</span>
          <span className="font-semibold text-metal">M 25.00 LSL</span>
        </div>
        <p className="mt-1 text-[0.7rem] text-ash">
          Pay with {method === "mpesa" ? "M-Pesa" : "EcoCash"} — fixed price, no conversion.
        </p>
      </div>

      {!success && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="M-Pesa number (5X XX XX XX)"
            disabled={status === "busy" || status === "awaiting_authorisation"}
            className="h-11 w-full max-w-xs rounded-full border border-white/15 bg-ink px-4 text-sm text-silver outline-none placeholder:text-ash focus:border-ember disabled:opacity-50"
          />
          <button
            type="button"
            onClick={pay}
            disabled={status === "busy" || status === "awaiting_authorisation"}
            className="btn btn-primary disabled:opacity-60"
          >
            {status === "busy"
              ? "Starting…"
              : status === "awaiting_authorisation"
                ? "Waiting for PIN…"
                : "Pay M25"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}

      {STATUS_COPY[status] && (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm leading-relaxed ${
            success
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : status === "awaiting_authorisation" || status === "busy"
                ? "border-ember/40 bg-ember/5 text-silver-2"
                : "border-red-500/40 bg-red-500/10 text-red-300"
          }`}
        >
          {STATUS_COPY[status] || status}
          {simulated && (
            <span className="mt-1 block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-amber-400">
              Test mode — simulated payment, no real money
            </span>
          )}
        </div>
      )}

      {orderId && (
        <p className="mt-3 break-all text-[0.65rem] text-ash">Order: {orderId}</p>
      )}
    </div>
  );
}
