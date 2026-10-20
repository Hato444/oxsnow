"use client";

import Link from "next/link";
import { useState } from "react";
import { nav, site } from "@/lib/site";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // "" | "busy" | "joined" | "error"
  const year = new Date().getFullYear();

  async function subscribe(e) {
    e.preventDefault();
    if (status === "busy") return;
    setStatus("busy");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setStatus("joined");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="relative z-10 mt-24 border-t border-white/10 bg-ink-2/60">
      {/* Newsletter — fire-accent CTA */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-5 py-12 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Newsletter</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-metal sm:text-3xl">
              Stay connected to Basotho stories
            </h3>
          </div>
          <form
            onSubmit={subscribe}
            className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={status === "joined"}
              className="h-12 w-full rounded-full border border-white/15 bg-ink px-5 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember"
            />
            <button type="submit" disabled={status === "busy" || status === "joined"} className="btn btn-primary h-12 shrink-0 disabled:opacity-60">
              {status === "busy" ? "Joining…" : status === "joined" ? "Joined ✓" : status === "error" ? "Retry" : "Join"}
            </button>
            {status === "error" && (
              <span className="text-xs font-semibold text-red-300 sm:sr-only">Failed — try again</span>
            )}
          </form>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <span className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md border border-white/15">
              <span className="h-2.5 w-2.5 rounded-full bg-ember shadow-[0_0_14px_4px_rgba(255,69,0,0.55)]" />
            </span>
            <span className="text-sm font-bold tracking-[0.28em] text-metal">
              OXSNOW STUDIO
            </span>
          </span>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-steel">
            {site.mission} A Lesotho-based umbrella studio founded in {site.founded}
            &nbsp;— industrializing authentic Basotho culture and heritage.
          </p>
        </div>

        <div>
          <p className="eyebrow">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-silver-2 transition-colors hover:text-ember"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Studio</p>
          <ul className="mt-4 space-y-2 text-sm text-steel">
            <li>{site.location}</li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="transition-colors hover:text-ember"
              >
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${site.phone.replace(/\s+/g, "")}`}
                className="transition-colors hover:text-ember"
              >
                {site.phone}
              </a>
            </li>
            <li>Est. {site.founded}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-[0.7rem] tracking-wide text-ash sm:flex-row sm:px-8">
          <span>© {year} Oxsnow Studio. All rights reserved.</span>
          <span>Proudly Basotho. Built for the world.</span>
        </div>
      </div>
    </footer>
  );
}
