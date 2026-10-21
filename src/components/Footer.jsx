"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav, navExtra, site, socials } from "@/lib/site";
import { useLang } from "@/components/lang/LangProvider";

const socialSvg = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};
const SOCIAL_ICONS = {
  TikTok: (
    <svg {...socialSvg} className="h-[18px] w-[18px]">
      <path d="M13.5 3.5v10.8a3.7 3.7 0 1 1-3.2-3.7" />
      <path d="M13.5 3.5c.5 2.6 2.3 4.2 5 4.5" />
    </svg>
  ),
  Instagram: (
    <svg {...socialSvg} className="h-[18px] w-[18px]">
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  Facebook: (
    <svg {...socialSvg} className="h-[18px] w-[18px]">
      <path d="M13.8 21v-8h2.7l.5-3.2h-3.2V7.7c0-.9.3-1.6 1.7-1.6h1.6V3.3c-.6-.1-1.6-.2-2.7-.2-2.7 0-4.5 1.6-4.5 4.5v2.2H7.5V13h2.4v8z" />
    </svg>
  ),
  YouTube: (
    <svg {...socialSvg} className="h-[18px] w-[18px]">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.4 9.4l4.8 2.6-4.8 2.6z" />
    </svg>
  ),
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // "" | "busy" | "joined" | "error"
  const [year, setYear] = useState("");
  const { t } = useLang();

  useEffect(() => {
    const t = setTimeout(() => setYear(new Date().getFullYear()), 0);
    return () => clearTimeout(t);
  }, []);

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
            <p className="eyebrow">{t("Newsletter")}</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-metal sm:text-3xl">
              {t("Stay connected to Basotho stories")}
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
              {status === "busy"
                ? t("Joining…")
                : status === "joined"
                  ? t("Joined ✓")
                  : status === "error"
                    ? "Retry"
                    : t("Join")}
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
          <div className="mt-6 flex items-center gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-silver transition-colors hover:border-ember hover:text-ember"
              >
                {SOCIAL_ICONS[s.label]}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow">{t("Explore")}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-silver-2 transition-colors hover:text-ember"
                >
                  {t(item.label)}
                </Link>
              </li>
            ))}
            {navExtra.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-silver-2 transition-colors hover:text-ember"
                >
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">{t("Studio")}</p>
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
          <span>
            {t("© {year} Oxsnow Studio. All rights reserved.").replace(
              "{year}",
              year
            )}
          </span>
          <span>{t("Proudly Basotho. Built for the world.")}</span>
        </div>
      </div>
    </footer>
  );
}
