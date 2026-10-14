"use client";

import { useState } from "react";

const interests = ["Production", "Broadcasting", "Schools", "Government", "Sponsorship", "Press"];

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="card space-y-5 p-7 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow">Name</span>
          <input
            required
            type="text"
            placeholder="Your full name"
            className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-ink px-4 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember"
          />
        </label>
        <label className="block">
          <span className="eyebrow">Email</span>
          <input
            required
            type="email"
            placeholder="you@example.com"
            className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-ink px-4 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember"
          />
        </label>
      </div>

      <label className="block">
        <span className="eyebrow">Organisation</span>
        <input
          type="text"
          placeholder="Company, school or broadcaster"
          className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-ink px-4 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember"
        />
      </label>

      <div>
        <span className="eyebrow">Interested in</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {interests.map((it) => (
            <label
              key={it}
              className="cursor-pointer rounded-full border border-white/12 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-steel transition-colors has-[:checked]:border-ember has-[:checked]:bg-ember/10 has-[:checked]:text-white"
            >
              <input type="checkbox" name="interest" value={it} className="sr-only" />
              {it}
            </label>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="eyebrow">Message</span>
        <textarea
          required
          rows={5}
          placeholder="Tell us about your project or partnership."
          className="mt-2 w-full rounded-lg border border-white/15 bg-ink px-4 py-3 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember"
        />
      </label>

      <button type="submit" className="btn btn-primary w-full">
        {sent ? "Message Sent — Thank You" : "Send Inquiry"}
      </button>
      <p className="text-center text-[0.65rem] tracking-wide text-ash">
        We reply within two business days.
      </p>
    </form>
  );
}
