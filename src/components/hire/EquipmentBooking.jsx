"use client";

import { useState } from "react";
import Link from "next/link";
import { addToCart, money } from "@/lib/hire/cart";

function addDays(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-white/15 bg-ink px-4 text-sm text-silver outline-none transition-colors focus:border-ember";

export default function EquipmentBooking({ equipment, today }) {
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(addDays(today, 1));
  const [quantity, setQuantity] = useState(1);
  const [check, setCheck] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);

  async function checkAvailability() {
    setBusy(true);
    setMessage("");
    setCheck(null);
    setAdded(false);
    try {
      const r = await fetch("/api/hire/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start,
          end,
          items: [{ equipmentId: equipment.id, quantity }],
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Could not check availability.");
      setCheck(data);
      const line = data.items?.[0];
      if (!line?.exists) setMessage("This item is no longer available.");
      else if (line.available < quantity) {
        setMessage(`Only ${line.available} available for those dates.`);
      } else {
        setMessage(`Available — ${line.available} unit${line.available === 1 ? "" : "s"} free.`);
      }
    } catch (err) {
      setMessage(err.message || "Could not check availability.");
    } finally {
      setBusy(false);
    }
  }

  function add() {
    addToCart({
      equipmentId: equipment.id,
      quantity,
      name: equipment.name,
      slug: equipment.slug,
      image: equipment.images?.[0] || "/equipment/demo-card.svg",
      dailyRateMinor: equipment.dailyRateMinor,
      depositMinor: equipment.depositMinor,
      start,
      end,
    });
    setAdded(true);
    setMessage("Added to your booking list.");
  }

  const line = check?.items?.[0];
  const canAdd = Boolean(check?.ok && line?.exists && line.available >= quantity);

  return (
    <div className="card p-6">
      <p className="eyebrow">Check dates & build your booking</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Collection</span>
          <input
            type="date"
            min={today}
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              setCheck(null);
              if (end < e.target.value) setEnd(e.target.value);
            }}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Return</span>
          <input
            type="date"
            min={start || today}
            value={end}
            onChange={(e) => {
              setEnd(e.target.value);
              setCheck(null);
            }}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Quantity</span>
          <input
            type="number"
            min={1}
            max={Math.max(1, equipment.quantityTotal)}
            value={quantity}
            onChange={(e) => {
              setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)));
              setCheck(null);
            }}
            className={inputClass}
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={checkAvailability}
            disabled={busy}
            className="btn btn-ghost h-11 w-full disabled:opacity-60"
          >
            {busy ? "Checking…" : "Check availability"}
          </button>
        </div>
      </div>

      <p className="mt-3 text-[0.7rem] leading-relaxed text-ash">
        Rental days are inclusive — collection and return days both count. Same-day collection and
        return is 1 day.
      </p>

      {check && (
        <div className="mt-5 rounded-lg border border-white/10 bg-ink px-4 py-4 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-steel">
              {check.days} rental day{check.days === 1 ? "" : "s"}
            </span>
            <span className="font-semibold text-metal">
              Rental {money(check.rentalSubtotalMinor)} + deposit {money(check.depositTotalMinor)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-2 border-t border-white/8 pt-2">
            <span className="text-ash">Estimated total</span>
            <span className="font-black text-fire">{money(check.totalMinor)}</span>
          </div>
        </div>
      )}

      {message && (
        <p
          role="status"
          className={`mt-4 text-sm ${added ? "text-emerald-300" : "text-silver-2"}`}
        >
          {message}
          {added && (
            <Link href="/hire/checkout" className="ml-2 font-semibold text-ember underline">
              Go to booking list
            </Link>
          )}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={add}
          disabled={!canAdd}
          className="btn btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add to booking list
        </button>
        <Link href="/hire/quote" className="btn btn-ghost">
          Request a quote
        </Link>
      </div>
      <p className="mt-4 text-[0.7rem] leading-relaxed text-ash">
        Adding to your list does not reserve equipment. Stock is held only when studio staff approve
        your request. Demo catalogue — prices and availability are illustrative.
      </p>
    </div>
  );
}
