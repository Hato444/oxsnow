"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
  awaiting_authorisation: "Check your phone — approve the M-Pesa prompt and enter your PIN.",
  paid: "Payment confirmed. Your film is unlocked.",
  purchased: "You already own this film. It's unlocked.",
  failed: "Payment failed — you were not charged.",
  cancelled: "Payment cancelled. No charge was made.",
  expired: "This order expired. Start again when you're ready.",
};

const isTerminal = (s) => ["paid", "failed", "cancelled", "expired", "purchased"].includes(s);

const METHODS = [
  {
    id: "mpesa",
    name: "M-PESA",
    logo: "/brand/payments/mpesa.png",
    available: true,
    badgeBg: "#FFFFFF",
  },
  {
    id: "ecocash",
    name: "EcoCash",
    logo: "/brand/payments/ecocash.jpg",
    available: false,
    badgeBg: "#FFFFFF",
  },
];

export default function PaymentPanel({
  item,
  onClose,
  onUnlocked,
  movieId = null,
  priceLabel = "M 25.00 LSL",
  passMode = false,
}) {
  const reduced = useReducedMotion();
  const [method, setMethod] = useState("mpesa");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [simulated, setSimulated] = useState(false);
  const panelRef = useRef(null);
  const pollRef = useRef(null);
  const returnFocusRef = useRef(null);

  const titleId = movieId || item?.title || "";

  const pending = status === "busy" || status === "awaiting_authorisation";
  const submitting = status === "busy";
  const success = status === "paid" || status === "purchased";

  useEffect(() => {
    returnFocusRef.current = document.activeElement;
    panelRef.current?.focus();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      returnFocusRef.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

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
          if (isTerminal(data.status)) stopPolling();
          setStatus(data.status);
        }
      } catch {
        /* transient network error — keep polling */
      }
    }, 2500);
  };

  const pay = async () => {
    setError("");
    if (method !== "mpesa") return;
    if (!/^5\d{7}$/.test(phone.replace(/[\s-]/g, ""))) {
      setError("Enter a valid 8-digit M-Pesa number starting with 5.");
      return;
    }
    setStatus("busy");
    try {
      const r = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: titleId, userKey: getBuyerKey(), phone }),
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

  const dur = reduced ? 0 : 0.22;
  const detailTransition = { duration: dur, ease: [0.22, 1, 0.36, 1] };

  const primaryLabel = pending
    ? status === "busy"
      ? "Starting…"
      : "Waiting for approval…"
    : success
      ? "Watch film"
      : method === "ecocash"
        ? "EcoCash coming soon"
        : status
          ? "Try again"
          : "Continue with M-PESA";

  const onPrimary = () => {
    if (success) {
      onUnlocked?.();
      onClose();
      return;
    }
    pay();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: dur }}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={submitting ? undefined : onClose} />

      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-title"
        initial={{ opacity: 0, y: reduced ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduced ? 0 : 12 }}
        transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-2xl border border-white/12 bg-[#101010] shadow-[0 -24px_60px_-20px_rgba(0,0,0,0.9)] outline-none sm:max-w-[470px] sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-ember">Pay / Unlock</p>
            <h2 id="pay-title" className="mt-1 text-lg font-bold text-metal">
              {passMode ? "Unlock the Cultural Pass" : "Unlock this film"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close payment"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-black/50 text-silver transition-colors hover:border-ember hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        {/* Internal scroll area */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {/* Order summary */}
          <div className="flex items-center gap-3.5 rounded-xl border border-white/8 bg-white/[0.025] p-3">
            {item?.poster ? (
              <img
                src={item.poster}
                alt=""
                className="h-16 w-11 shrink-0 rounded-md object-cover"
              />
            ) : (
              <div className="grid h-16 w-11 shrink-0 place-items-center rounded-md bg-gradient-to-b from-ember/30 to-white/5">
                <span className="h-2.5 w-2.5 rounded-full bg-ember shadow-[0_0_12px_3px_rgba(255,69,0,0.5)]" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-silver-2">
                {passMode ? "Cultural Pass" : item?.title}
              </p>
              <p className="mt-0.5 text-[0.7rem] text-ash">
                {passMode
                  ? "30 days unlimited streaming — every film, every archive"
                  : `${item?.meta ? `${item.meta} · ` : ""}Full film, unlocked to watch`}
              </p>
            </div>
          </div>

          {/* Payment methods */}
          <p className="mt-5 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-steel">
            Choose payment method
          </p>

          <div className="mt-2.5 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Payment method">
            {METHODS.map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`${m.name}${m.available ? "" : " (coming soon)"}`}
                  onClick={() => !pending && setMethod(m.id)}
                  className={`group flex h-[84px] items-center gap-2.5 rounded-xl border px-3 text-left transition-[border-color,background-color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember ${
                    active
                      ? "border-ember/80 bg-ember/8"
                      : "border-white/12 bg-white/[0.02] hover:border-white/30"
                  } ${!m.available && !active ? "opacity-75" : ""}`}
                >
                  <span
                    className="grid h-[64px] min-w-0 flex-1 place-items-center overflow-hidden rounded-md"
                    style={{ backgroundColor: m.badgeBg }}
                  >
                    <img
                      src={m.logo}
                      alt=""
                      className="h-full w-full object-contain"
                      draggable={false}
                    />
                  </span>
                  <span
                    aria-hidden="true"
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[0.55rem] transition-colors duration-200 ${
                      active ? "border-ember bg-ember text-black" : "border-white/25 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detail reveal — only after selection, never both at once */}
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={method}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={detailTransition}
              className="overflow-hidden"
            >
              <div className="pt-4">
                {method === "mpesa" ? (
                  <>
                    <label
                      htmlFor="mp-phone"
                      className="block text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-steel"
                    >
                      M-Pesa number
                    </label>
                    <input
                      id="mp-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="5X XX XX XX"
                      disabled={pending}
                      aria-invalid={Boolean(error)}
                      className="mt-2 h-11 w-full rounded-full border border-white/15 bg-black/40 px-4 text-sm text-silver outline-none placeholder:text-ash focus:border-ember disabled:opacity-50"
                    />
                    <p className="mt-2 text-[0.72rem] leading-relaxed text-ash">
                      You&apos;ll get a prompt on this phone — approve it and enter your M-Pesa PIN to
                      complete the payment.
                    </p>
                  </>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-[0.72rem] leading-relaxed text-steel">
                      EcoCash payments aren&apos;t live yet — the provider integration is still being
                      onboarded. Your film selection is kept; you can switch to M-PESA to pay now.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Total */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
            <span className="text-xs text-steel">
              {passMode ? "Total — 30-day pass, cancel anytime" : "Total — fixed price, no conversion"}
            </span>
            <span className="text-sm font-bold text-metal">{priceLabel}</span>
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Status */}
          <AnimatePresence initial={false}>
            {(STATUS_COPY[status] || simulated) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={detailTransition}
                className="overflow-hidden"
              >
                <div
                  role="status"
                  className={`mt-4 rounded-xl border p-4 text-sm leading-relaxed ${
                    success
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : pending
                        ? "border-ember/40 bg-ember/5 text-silver-2"
                        : "border-red-500/40 bg-red-500/10 text-red-300"
                  }`}
                >
                  {status === "paid" && passMode
                    ? "Payment confirmed. The Cultural Pass is active — everything is unlocked."
                    : STATUS_COPY[status]}
                  {simulated && (
                    <span className="mt-1 block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-amber-400">
                      Test mode — simulated payment, no real money
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {orderId && (
            <p className="mt-3 break-all text-[0.65rem] text-ash">Order: {orderId}</p>
          )}
        </div>

        {/* Primary action */}
        <div className="border-t border-white/8 px-5 pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
          <button
            type="button"
            onClick={onPrimary}
            disabled={pending || method === "ecocash"}
            className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-55"
          >
            {primaryLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
