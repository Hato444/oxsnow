"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const interests = ["Production", "Broadcasting", "Schools", "Government", "Sponsorship", "Press"];

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-white/15 bg-ink px-4 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | handoff
  const [mailto, setMailto] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    organisation: "",
    message: "",
  });
  const [selected, setSelected] = useState([]);

  const toggleInterest = (it) =>
    setSelected((prev) => (prev.includes(it) ? prev.filter((x) => x !== it) : [...prev, it]));

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();

    const interestLabel = selected.length ? selected.join(", ") : "General";
    const subject = `[Website] ${interestLabel} inquiry — ${form.name}`;

    const body = [
      "New enquiry from the Oxsnow Studio website",
      "------------------------------------------",
      "",
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Organisation: ${form.organisation || "—"}`,
      `Interested in: ${interestLabel}`,
      "",
      "Message:",
      form.message,
      "",
      "—",
      "Oxsnow Studio · Maseru, Lesotho · +266 6279 7598",
    ].join("\n");

    const href = `mailto:oxsnowstudio@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    setMailto(href);
    setStatus("handoff");
    window.location.href = href;
  }

  function reset() {
    setStatus("idle");
    setMailto("");
    setForm({ name: "", email: "", organisation: "", message: "" });
    setSelected([]);
  }

  if (status === "handoff") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="card relative flex flex-col items-center justify-center gap-5 overflow-hidden p-12 text-center"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember to-transparent"
        />

        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ember bg-ember/10 shadow-[0_0_35px_-8px_rgba(255,69,0,0.9)]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-7 w-7 stroke-ember"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 6h16v12H4z" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </motion.div>

        <p className="eyebrow !text-ember">Concierge handoff</p>
        <h3 className="text-2xl font-black tracking-tight text-white">
          Your message is already written.
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-steel">
          Your mail app is opening with the enquiry pre-addressed to Oxsnow and
          ready to go. One tap on <span className="font-semibold text-silver">Send</span> and it&apos;s ours.
        </p>

        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-ash">
          Pre-addressed · Pre-written · Zero friction
        </p>

        <div className="mt-1 flex flex-wrap justify-center gap-3">
          <a href={mailto} className="btn btn-primary">
            Open Mail App Again
          </a>
          <button type="button" onClick={reset} className="btn btn-ghost">
            Edit Message
          </button>
        </div>

        <p className="text-[0.65rem] text-ash">
          Nothing opened? Use the button above — or write to{" "}
          <span className="text-silver-2">oxsnowstudio@gmail.com</span>.
        </p>
      </motion.div>
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

      <button type="submit" className="btn btn-primary w-full">
        Send Inquiry
      </button>
      <p className="text-center text-[0.65rem] tracking-wide text-ash">
        We reply within two business days.
      </p>
    </form>
  );
}
