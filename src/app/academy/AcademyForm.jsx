"use client";

import { useState } from "react";

const TRACKS = [
  { id: "direction", label: "Directing & Story" },
  { id: "camera", label: "Camera & Lighting" },
  { id: "sound", label: "Sound & Post" },
  { id: "producing", label: "Producing & Production" },
];

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-white/15 bg-ink px-4 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember";

export default function AcademyForm() {
  const [status, setStatus] = useState("idle"); // idle | busy | sent | error
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    district: "",
    track: "",
    why: "",
    website: "", // honeypot
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "busy") return;
    setStatus("busy");
    setError("");
    try {
      const res = await fetch("/api/academy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Something went wrong — try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="card flex flex-col items-center gap-5 p-12 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-ember bg-ember/10 shadow-[0_0_35px_-8px_rgba(255,69,0,0.9)]">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 stroke-ember" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 13 4 4L19 7" />
          </svg>
        </span>
        <h3 className="text-2xl font-black tracking-tight text-white">
          Application received.
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-steel">
          Ngiyabonga — thank you. The Academy team reviews every application by
          hand and replies within two weeks. Keep your phone close.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-7 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow">Full name</span>
          <input required type="text" value={form.name} onChange={set("name")} placeholder="Your full name" className={inputClass} />
        </label>
        <label className="block">
          <span className="eyebrow">Email</span>
          <input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputClass} />
        </label>
        <label className="block">
          <span className="eyebrow">Phone</span>
          <input required type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} placeholder="+266 5XXX XXXX" className={inputClass} />
        </label>
        <label className="block">
          <span className="eyebrow">District</span>
          <input required type="text" value={form.district} onChange={set("district")} placeholder="Maseru, Leribe, Teyateyaneng…" className={inputClass} />
        </label>
      </div>

      <div>
        <span className="eyebrow">Preferred track</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {TRACKS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setForm((f) => ({ ...f, track: t.id }))}
              className={`cursor-pointer rounded-full border px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors ${
                form.track === t.id
                  ? "border-ember bg-ember/10 text-white"
                  : "border-white/12 text-steel hover:border-white/25"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="eyebrow">Why the Academy?</span>
        <textarea
          required
          rows={4}
          value={form.why}
          onChange={set("why")}
          placeholder="Tell us why you want in — no experience required, hunger is the entry fee."
          className="mt-2 w-full rounded-lg border border-white/15 bg-ink px-4 py-3 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember"
        />
      </label>

      {/* honeypot */}
      <input
        type="text"
        value={form.website}
        onChange={set("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "busy"}
        className="btn btn-primary w-full disabled:opacity-60"
      >
        {status === "busy" ? "Submitting…" : "Submit Application"}
      </button>
      <p className="text-center text-[0.65rem] tracking-wide text-ash">
        Intake I is free — sponsored places. We reply to every applicant.
      </p>
    </form>
  );
}
