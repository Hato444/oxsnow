"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CART_EVENT,
  clearCart,
  money,
  readCart,
  removeFromCart,
  updateCartItem,
} from "@/lib/hire/cart";

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-white/15 bg-ink px-4 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember";
const areaClass =
  "mt-2 w-full rounded-lg border border-white/15 bg-ink px-4 py-3 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember";

function daysBetween(start, end) {
  if (!start || !end || end < start) return 0;
  const [ay, am, ad] = start.split("-").map(Number);
  const [by, bm, bd] = end.split("-").map(Number);
  const diff = Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad);
  return Math.round(diff / 86400000) + 1;
}

export default function CartCheckout({ today }) {
  const router = useRouter();
  const [cart, setCart] = useState({ items: [], start: "", end: "" });
  const [authed, setAuthed] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    intendedUse: "",
    productionLocation: "",
    notes: "",
  });
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState("");
  const [check, setCheck] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const next = readCart();
    setCart(next);
    setStart(next.start || today);
    setEnd(next.end || "");
    try {
      const r = await fetch("/api/account");
      const data = await r.json();
      if (data.ok && data.authed) {
        setAuthed(true);
        setCustomer(data.customer);
        setForm((f) => ({
          ...f,
          name: f.name || data.customer?.name || "",
          email: f.email || data.customer?.email || "",
        }));
      } else {
        setAuthed(false);
      }
    } catch {
      setAuthed(false);
    }
  }, [today]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    const sync = () => setCart(readCart());
    window.addEventListener(CART_EVENT, sync);
    return () => {
      clearTimeout(t);
      window.removeEventListener(CART_EVENT, sync);
    };
  }, [load]);

  const days = daysBetween(start, end);
  const rental = cart.items.reduce(
    (sum, i) => sum + (Number(i.dailyRateMinor) || 0) * days * (Number(i.quantity) || 0),
    0
  );
  const deposit = cart.items.reduce(
    (sum, i) => sum + (Number(i.depositMinor) || 0) * (Number(i.quantity) || 0),
    0
  );
  const total = rental + deposit;

  function setField(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function checkAvailability() {
    setBusy(true);
    setError("");
    setCheck(null);
    try {
      const r = await fetch("/api/hire/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start,
          end,
          items: cart.items.map((i) => ({ equipmentId: i.equipmentId, quantity: i.quantity })),
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Could not check availability.");
      setCheck(data);
      const short = data.items.filter((i) => !i.exists || i.available < i.quantity);
      if (short.length > 0) {
        setError(
          short
            .map((i) => `${i.name}: ${i.exists ? `${i.available} available` : "unavailable"}`)
            .join(" · ")
        );
      }
    } catch (err) {
      setError(err.message || "Could not check availability.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (!authed) {
      setError("Sign in to submit your booking request.");
      return;
    }
    if (cart.items.length === 0) {
      setError("Your booking list is empty.");
      return;
    }
    if (!check) {
      setError("Check availability for your dates before submitting.");
      return;
    }
    const short = check.items.filter((i) => !i.exists || i.available < i.quantity);
    if (short.length > 0) {
      setError("Some items are unavailable for those dates. Adjust your list or dates.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/hire/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start,
          end,
          items: cart.items.map((i) => ({ equipmentId: i.equipmentId, quantity: i.quantity })),
          contact: form,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Could not submit booking.");
      clearCart();
      router.push(`/hire/bookings/${encodeURIComponent(data.booking.reference)}?new=1`);
    } catch (err) {
      setError(err.message || "Could not submit booking.");
      setBusy(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="card mt-10 p-10 text-center">
        <h2 className="text-2xl font-black text-metal">Your booking list is empty.</h2>
        <p className="mt-3 text-sm text-steel">
          Browse the demo catalogue and add equipment to build a request.
        </p>
        <Link href="/hire" className="btn btn-primary mt-6">
          Browse equipment
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-metal">Your equipment</h2>
          <ul className="mt-5 space-y-4">
            {cart.items.map((item) => (
              <li key={item.equipmentId} className="flex gap-4 border-b border-white/8 pb-4 last:border-0">
                <img
                  src={item.image || "/equipment/demo-card.svg"}
                  alt=""
                  className="h-20 w-24 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/hire/${item.slug}`}
                    className="font-semibold text-silver-2 hover:text-ember"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-[0.7rem] text-ash">
                    {money(item.dailyRateMinor)}/day · deposit {money(item.depositMinor)}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="text-[0.65rem] uppercase tracking-[0.16em] text-ash">
                      Qty
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={item.quantity}
                        onChange={(e) => {
                          const next = updateCartItem(item.equipmentId, Number(e.target.value));
                          setCart(next);
                          setCheck(null);
                        }}
                        className="ml-2 h-8 w-16 rounded border border-white/15 bg-ink px-2 text-sm text-silver"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCart(removeFromCart(item.equipmentId));
                        setCheck(null);
                      }}
                      className="text-[0.65rem] uppercase tracking-[0.16em] text-ash hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right text-sm font-semibold text-metal">
                  {days > 0 ? money((item.dailyRateMinor * days + item.depositMinor) * item.quantity) : "—"}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-metal">Hire dates</h2>
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
                  if (end && end < e.target.value) setEnd(e.target.value);
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
          </div>
          <p className="mt-3 text-[0.7rem] text-ash">
            {days > 0
              ? `${days} rental day${days === 1 ? "" : "s"} — collection and return days both count.`
              : "Choose a return date on or after collection."}
          </p>
          <button
            type="button"
            onClick={checkAvailability}
            disabled={busy || !end}
            className="btn btn-ghost mt-5 w-full disabled:opacity-40"
          >
            {busy ? "Checking…" : "Check availability for these dates"}
          </button>
        </div>

        <form onSubmit={submit} className="card space-y-5 p-6">
          <h2 className="text-lg font-bold text-metal">Your details</h2>
          {authed === false && (
            <div className="rounded-lg border border-ember/30 bg-ember/5 px-4 py-3 text-sm text-silver-2">
              <Link href="/account" className="font-semibold text-ember underline">
                Sign in or create an account
              </Link>{" "}
              to submit a booking request. Your list is saved on this device.
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Full name *</span>
              <input required value={form.name} onChange={setField("name")} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Email *</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={setField("email")}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Phone *</span>
              <input
                required
                value={form.phone}
                onChange={setField("phone")}
                placeholder="+266 …"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Company</span>
              <input value={form.company} onChange={setField("company")} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Production</span>
              <input
                value={form.intendedUse}
                onChange={setField("intendedUse")}
                placeholder="Music video, documentary…"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Location</span>
              <input
                value={form.productionLocation}
                onChange={setField("productionLocation")}
                placeholder="Maseru…"
                className={inputClass}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Notes</span>
            <textarea
              rows={4}
              value={form.notes}
              onChange={setField("notes")}
              className={areaClass}
              placeholder="Crew size, accessories, delivery needs…"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || authed === false}
            className="btn btn-primary w-full disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit booking request"}
          </button>
          <p className="text-[0.7rem] leading-relaxed text-ash">
            Submitting a request does not reserve equipment or take payment. Oxsnow staff will
            confirm availability and send verified payment details. Do not send money before that
            confirmation.
          </p>
        </form>
      </div>

      <aside className="h-fit space-y-5 lg:sticky lg:top-28">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-metal">Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-steel">Rental ({days || 0} day{days === 1 ? "" : "s"})</dt>
              <dd className="text-silver-2">{money(rental)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-steel">Refundable deposit</dt>
              <dd className="text-silver-2">{money(deposit)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-white/10 pt-3">
              <dt className="font-semibold text-metal">Total due</dt>
              <dd className="font-black text-fire">{money(total)}</dd>
            </div>
          </dl>
          {check && (
            <p className="mt-4 text-[0.7rem] text-emerald-300">
              Availability confirmed for {check.days} day{check.days === 1 ? "" : "s"}.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-ember/25 bg-ember/5 p-5 text-[0.75rem] leading-relaxed text-silver-2">
          <p className="font-bold uppercase tracking-[0.18em] text-ember">Demo inventory</p>
          <p className="mt-2">
            Items, prices and availability shown here are illustrative demo data, not real Oxsnow
            stock. No online payment is taken. See{" "}
            <Link href="/hire/terms" className="underline hover:text-ember">
              hire terms
            </Link>
            .
          </p>
        </div>
      </aside>
    </div>
  );
}
