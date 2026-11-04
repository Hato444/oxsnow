"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { money, statusLabel, STATUS_STYLES, PAYMENT_STYLES, dateLabel } from "@/lib/hire/ui";

export default function HireBookings() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch("/api/hire/bookings");
        const data = await r.json();
        if (!active) return;
        if (r.status === 401) {
          setAuthed(false);
        } else if (!r.ok || !data.ok) {
          setError(data.error || "Could not load bookings.");
        } else {
          setBookings(data.bookings || []);
        }
      } catch {
        if (active) setError("Could not load bookings.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
        <h2 className="text-2xl font-black text-metal">Sign in to view your bookings.</h2>
        <p className="mt-3 text-sm text-steel">
          Your hire requests and payment reports live in your Oxsnow account.
        </p>
        <Link href="/account" className="btn btn-primary mt-6">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-5">
      {error && (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}
      {bookings.length === 0 && (
        <div className="card p-10 text-center">
          <h2 className="text-2xl font-black text-metal">No hire requests yet.</h2>
          <p className="mt-3 text-sm text-steel">Browse the demo catalogue to start one.</p>
          <Link href="/hire" className="btn btn-primary mt-6">
            Browse equipment
          </Link>
        </div>
      )}
      {bookings.map((b) => (
        <article key={b.id} className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ash">
                {b.reference}
              </p>
              <h2 className="mt-2 text-xl font-black text-metal">
                {dateLabel(b.startsOn)} → {dateLabel(b.endsOn)}
              </h2>
              <p className="mt-1 text-[0.75rem] text-steel">
                {b.rentalDays} rental day{b.rentalDays === 1 ? "" : "s"} ·{" "}
                {b.items.reduce((s, i) => s + i.quantity, 0)} item
                {b.items.reduce((s, i) => s + i.quantity, 0) === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] ${STATUS_STYLES[b.status] || ""}`}
              >
                {statusLabel(b.status)}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] ${PAYMENT_STYLES[b.paymentStatus] || ""}`}
              >
                {statusLabel(b.paymentStatus)}
              </span>
            </div>
          </div>

          <ul className="mt-5 grid gap-2 text-sm text-steel sm:grid-cols-2">
            {b.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 border-b border-white/6 pb-2">
                <span className="truncate">{i.name}</span>
                <span className="shrink-0 text-silver-2">× {i.quantity}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-steel">
              Total <span className="ml-2 font-black text-fire">{money(b.totalMinor)}</span>
              <span className="ml-2 text-[0.7rem] text-ash">
                incl. {money(b.depositTotalMinor)} refundable deposit
              </span>
            </p>
            <Link href={`/hire/bookings/${encodeURIComponent(b.reference)}`} className="btn btn-ghost">
              View booking
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
