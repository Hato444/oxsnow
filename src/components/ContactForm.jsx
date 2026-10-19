"use client";

import { useState } from "react";

const interests = ["Production", "Broadcasting", "Schools", "Government", "Sponsorship", "Press"];

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-white/15 bg-ink px-4 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    organisation: "",
    message: "",
    website: "", // honeypot
  });
  const [selected, setSelected] = useState([]);

  const toggleInterest = (it) =>
    setSelected((prev) => (prev.includes(it) ? prev.filter((x) => x !== it) : [...prev, it]));

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, interests: selected }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setStatus("sent");
      setForm({ name: "", email: "", organisation: "", message: "", website: "" });
      setSelected([]);
    } catch (err) {
      setStatus("error");
      setError(err.message || "Something went wrong. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="card flex flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ember bg-ember/10">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 stroke-ember" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="text-xl font-black tracking-tight text-white">Message Sent</h3>
        <p className="max-w-sm text-sm leading-relaxed text-steel">
          Thanks for reaching out. We read every inquiry and reply within two business days.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 rounded-full border border-white/15 px-6 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-silver-2 transition-colors hover:border-ember hover:text-white"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-7 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow">Name</span>
          <input
            required
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="Your full name"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="eyebrow">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@example.com"
            className={inputClass}
          />
        </label>
      </div>

      <label className="block">
        <span className="eyebrow">Organisation</span>
        <input
          type="text"
          value={form.organisation}
          onChange={set("organisation")}
          placeholder="Company, school or broadcaster"
          className={inputClass}
        />
      </label>

      <div>
        <span className="eyebrow">Interested in</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {interests.map((it) => (
            <button
              key={it}
              type="button"
              onClick={() => toggleInterest(it)}
              className={`cursor-pointer rounded-full border px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors ${
                selected.includes(it)
                  ? "border-ember bg-ember/10 text-white"
                  : "border-white/12 text-steel hover:border-white/25"
              }`}
            >
              {it}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="eyebrow">Message</span>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={set("message")}
          placeholder="Tell us about your project or partnership."
          className="mt-2 w-full rounded-lg border border-white/15 bg-ink px-4 py-3 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember"
        />
      </label>

      {/* honeypot — hidden from humans, bots fill it in */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={set("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {status === "error" && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Inquiry"}
      </button>
      <p className="text-center text-[0.65rem] tracking-wide text-ash">
        We reply within two business days.
      </p>
    </form>
  );
}
