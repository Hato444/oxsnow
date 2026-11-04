"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  dateLabel,
  money,
  PAYMENT_STYLES,
  STATUS_STYLES,
  statusLabel,
  timeLabel,
} from "@/lib/hire/ui";

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-white/15 bg-ink px-4 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember";

export default function HireBookingDetail({ reference }) {
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(isNew ? "Request submitted — pending studio review." : "");
  const [busy, setBusy] = useState(false);
  const [pay, setPay] = useState({
    kind: "rental",
    method: "bank_transfer",
    reference: "",
    amount: "",
    note: "",
  });

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/hire/bookings/${encodeURIComponent(reference)}`);
      const data = await r.json();
      if (r.status === 401) {
        setAuthed(false);
      } else if (!r.ok || !data.ok) {
        setError(data.error || "Could not load booking.");
      } else {
        setBooking(data.booking);
      }
    } catch {
      setError("Could not load booking.");
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function cancel() {
    if (!confirm("Cancel this booking request?")) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/hire/bookings/${encodeURIComponent(reference)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Could not cancel booking.");
      setNotice("Booking cancelled.");
      await load();
    } catch (err) {
      setError(err.message || "Could not cancel booking.");
    } finally {
      setBusy(false);
    }
  }

  async function reportPayment(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const amountMinor = Math.round(Number(pay.amount) * 100);
      const r = await fetch(`/api/hire/bookings/${encodeURIComponent(reference)}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: pay.kind,
          method: pay.method,
          reference: pay.reference,
          amountMinor,
          note: pay.note,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Could not report payment.");
      setNotice("Payment reported — studio staff will verify it.");
      setPay({ kind: "rental", method: "bank_transfer", reference: "", amount: "", note: "" });
      await load();
    } catch (err) {
      setError(err.message || "Could not report payment.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-12 grid place-items-center py-16">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-ember" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="card mt-10 p-10 text-center">
        <h2 className="text-2xl font-black text-metal">Sign in to view this booking.</h2>
        <Link href="/account" className="btn btn-primary mt-6">
          Sign in
        </Link>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="card mt-10 p-10 text-center">
        <h2 className="text-2xl font-black text-metal">Booking not found.</h2>
        <p className="mt-3 text-sm text-steel">{error}</p>
        <Link href="/hire/bookings" className="btn btn-ghost mt-6">
          All bookings
        </Link>
      </div>
    );
  }

  const canCancel = ["pending", "approved"].includes(booking.status);
  const canPay = !["cancelled", "rejected"].includes(booking.status);
  const paidRental = booking.payments
    .filter((p) => p.status === "verified" && p.kind === "rental")
    .reduce((s, p) => s + p.amountMinor, 0);
  const paidDeposit = booking.payments
    .filter((p) => p.status === "verified" && p.kind === "deposit")
    .reduce((s, p) => s + p.amountMinor, 0);

  return (
    <div className="mt-10 space-y-6">
      {notice && (
        <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ash">
              {booking.reference}
            </p>
            <h2 className="mt-2 text-2xl font-black text-metal">
              {dateLabel(booking.startsOn)} → {dateLabel(booking.endsOn)}
            </h2>
            <p className="mt-1 text-sm text-steel">
              {booking.rentalDays} rental day{booking.rentalDays === 1 ? "" : "s"} · submitted{" "}
              {timeLabel(booking.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] ${STATUS_STYLES[booking.status] || ""}`}
            >
              {statusLabel(booking.status)}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] ${PAYMENT_STYLES[booking.paymentStatus] || ""}`}
            >
              {statusLabel(booking.paymentStatus)}
            </span>
          </div>
        </div>

        {booking.staffInstructions && (
          <div className="mt-5 rounded-lg border border-ember/25 bg-ember/5 px-4 py-3 text-sm text-silver-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ember">
              Studio instructions
            </p>
            <p className="mt-2 whitespace-pre-wrap">{booking.staffInstructions}</p>
          </div>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[0.6rem] uppercase tracking-[0.2em] text-ash">
                <th className="py-3">Item</th>
                <th className="py-3">Qty</th>
                <th className="py-3">Rate</th>
                <th className="py-3 text-right">Line</th>
              </tr>
            </thead>
            <tbody>
              {booking.items.map((i) => (
                <tr key={i.id} className="border-b border-white/6 last:border-0">
                  <td className="py-3 text-silver-2">{i.name}</td>
                  <td className="py-3 text-steel">{i.quantity}</td>
                  <td className="py-3 text-steel">{money(i.dailyRateMinor)}/day</td>
                  <td className="py-3 text-right text-metal">{money(i.lineRentalMinor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-6 grid gap-3 border-t border-white/10 pt-5 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-steel">Rental subtotal</dt>
            <dd className="text-silver-2">{money(booking.rentalSubtotalMinor)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-steel">Refundable deposit</dt>
            <dd className="text-silver-2">{money(booking.depositTotalMinor)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-steel">Verified paid (rental)</dt>
            <dd className="text-silver-2">{money(paidRental)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-steel">Verified paid (deposit)</dt>
            <dd className="text-silver-2">{money(paidDeposit)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-white/10 pt-3 sm:col-span-2">
            <dt className="font-semibold text-metal">Total</dt>
            <dd className="text-xl font-black text-fire">{money(booking.totalMinor)}</dd>
          </div>
        </dl>

        {canCancel && (
          <button
            type="button"
            onClick={cancel}
            disabled={busy}
            className="mt-5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ash hover:text-red-300 disabled:opacity-50"
          >
            Cancel request
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-metal">Payments</h3>
          <p className="mt-1 text-[0.7rem] text-ash">
            Report a payment after studio staff confirm your booking. Only staff verification marks
            it paid.
          </p>
          {booking.payments.length === 0 ? (
            <p className="mt-4 text-sm text-steel">No payments recorded yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {booking.payments.map((p) => (
                <li key={p.id} className="border-b border-white/8 pb-3 text-sm last:border-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold capitalize text-silver-2">
                      {p.kind} · {p.method.replaceAll("_", " ")}
                    </span>
                    <span className="font-bold text-metal">{money(p.amountMinor)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[0.7rem] text-ash">
                    <span>
                      {p.status === "verified" ? "Verified" : "Reported"} · {timeLabel(p.createdAt)}
                      {p.reference ? ` · ${p.reference}` : ""}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.12em] ${PAYMENT_STYLES[p.status] || ""}`}
                    >
                      {p.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {canPay && (
          <form onSubmit={reportPayment} className="card space-y-4 p-6">
            <h3 className="text-lg font-bold text-metal">Report a payment</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Type</span>
                <select
                  value={pay.kind}
                  onChange={(e) => setPay((p) => ({ ...p, kind: e.target.value }))}
                  className={inputClass}
                >
                  <option value="rental">Rental</option>
                  <option value="deposit">Refundable deposit</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Method</span>
                <select
                  value={pay.method}
                  onChange={(e) => setPay((p) => ({ ...p, method: e.target.value }))}
                  className={inputClass}
                >
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="ecocash">EcoCash</option>
                  <option value="other">Other / arranged</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Amount (M)</span>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={pay.amount}
                  onChange={(e) => setPay((p) => ({ ...p, amount: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Reference</span>
                <input
                  value={pay.reference}
                  onChange={(e) => setPay((p) => ({ ...p, reference: e.target.value }))}
                  className={inputClass}
                  placeholder="Transaction reference"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Note</span>
              <input
                value={pay.note}
                onChange={(e) => setPay((p) => ({ ...p, note: e.target.value }))}
                className={inputClass}
              />
            </label>
            <button type="submit" disabled={busy} className="btn btn-ghost w-full disabled:opacity-50">
              {busy ? "Sending…" : "Report payment"}
            </button>
            <p className="text-[0.7rem] leading-relaxed text-ash">
              Do not send payment until studio staff confirm your booking and payment details. See{" "}
              <Link href="/hire/terms" className="underline hover:text-ember">
                hire terms
              </Link>
              .
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
