"use client";

import { useState } from "react";
import Link from "next/link";

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-white/15 bg-ink px-4 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember";
const areaClass =
  "mt-2 w-full rounded-lg border border-white/15 bg-ink px-4 py-3 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember";

export default function QuoteForm({ today }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    productionType: "",
    startsOn: "",
    endsOn: "",
    requestedEquipment: "",
    budget: "",
    notes: "",
    website: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/hire/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Could not send quote request.");
      setDone(data.reference);
    } catch (err) {
      setError(err.message || "Could not send quote request.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card mt-10 p-10 text-center">
        <p className="eyebrow">Quote request received</p>
        <h2 className="mt-4 text-3xl font-black text-metal">Reference {done}</h2>
        <p className="mt-3 text-sm text-steel">
          Oxsnow staff will review your request and come back with availability and a quote. This is
          a request only — no equipment is held and no payment is due.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/hire" className="btn btn-ghost">
            Back to equipment
          </Link>
          <Link href="/contact" className="btn btn-primary">
            Contact the studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card mt-10 space-y-5 p-6 sm:p-8">
      <input
        type="text"
        value={form.website}
        onChange={set("website")}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Full name *</span>
          <input required value={form.name} onChange={set("name")} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Email *</span>
          <input required type="email" value={form.email} onChange={set("email")} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Phone *</span>
          <input required value={form.phone} onChange={set("phone")} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Company</span>
          <input value={form.company} onChange={set("company")} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Production type</span>
          <input
            value={form.productionType}
            onChange={set("productionType")}
            placeholder="Music video, documentary…"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Budget</span>
          <input value={form.budget} onChange={set("budget")} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Collection</span>
          <input
            type="date"
            min={today}
            value={form.startsOn}
            onChange={set("startsOn")}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Return</span>
          <input
            type="date"
            min={form.startsOn || today}
            value={form.endsOn}
            onChange={set("endsOn")}
            className={inputClass}
          />
        </label>
      </div>
      <label className="block">
        <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">
          Equipment you need *
        </span>
        <textarea
          required
          rows={4}
          value={form.requestedEquipment}
          onChange={set("requestedEquipment")}
          className={areaClass}
          placeholder="Cameras, lenses, lighting, sound, support, drones…"
        />
      </label>
      <label className="block">
        <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ash">Notes</span>
        <textarea rows={4} value={form.notes} onChange={set("notes")} className={areaClass} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
        {busy ? "Sending…" : "Request a quote"}
      </button>
      <p className="text-[0.7rem] leading-relaxed text-ash">
        Demo catalogue — this form sends a request to studio staff. It does not reserve equipment.
      </p>
    </form>
  );
}
