"use client";

import Link from "next/link";
import Image from "next/image";
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
  const [message, setMessage] = useState("");
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
      setMessage(data.alreadySubscribed ? "This email is already subscribed." : "You're on the list. Thank you for joining.");
      setStatus("joined");
      setEmail("");
    } catch (err) {
      setMessage(err.message === "Failed to fetch" ? "Could not connect. Please try again." : err.message);
      setStatus("error");
    }
  }

  return (
    <footer className="relative z-10 mt-24 border-t border-white/10 bg-ink-2/60">
      <div className="mx-auto w-full max-w-7xl px-5 pt-12 sm:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-ink-3 p-6 sm:p-9 lg:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(255,69,0,0.14),transparent_55%)]" />
          <div className="relative grid gap-7 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow">The Oxsnow Dispatch</p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-metal sm:text-3xl">The next story starts here.</h3>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-silver-2">Film premieres, behind-the-scenes stories and studio updates. Straight to your inbox.</p>
            </div>
            <form onSubmit={subscribe} className="w-full">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input id="footer-email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus(""); }} placeholder="you@example.com" disabled={status === "joined"} className="h-12 min-w-0 w-full rounded-full border border-white/15 bg-ink px-5 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember" />
                <button type="submit" disabled={status === "busy" || status === "joined"} className="btn btn-primary h-12 shrink-0 disabled:opacity-60">{status === "busy" ? t("Joining…") : status === "joined" ? t("Joined ✓") : status === "error" ? "Retry" : t("Join")}</button>
              </div>
              <p role="status" aria-live="polite" className={`mt-3 text-xs ${status === "error" ? "text-red-300" : "text-silver-2"}`}>{message}</p>
              <p className="mt-2 text-xs leading-relaxed text-ash">To unsubscribe, <a className="underline hover:text-ember" href={`mailto:${site.email}?subject=Unsubscribe%20from%20Oxsnow%20Dispatch`}>email the studio</a>.</p>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div>
          <Link href="/" aria-label="Oxsnow Studio home"><Image src={site.logo} alt="Oxsnow Studio" width={1855} height={496} className="h-auto w-44" /></Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-steel">{site.mission} A Lesotho-based umbrella studio founded in {site.founded} — industrializing authentic Basotho culture and heritage.</p>
          <div className="mt-6 flex items-center gap-2.5">
            {socials.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label} className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-silver transition-colors duration-200 hover:border-ember hover:text-ember motion-reduce:transition-none">{SOCIAL_ICONS[s.label]}</a>)}
          </div>
        </div>
        {[
          { label: "Explore", paths: ["/", "/films", "/vod", "/events", "/community"] },
          { label: "Studio", paths: ["/about", "/services", "/hire", "/academy", "/gallery"] },
          { label: "Connect", paths: ["/contact", "/watchlist", "/account"] },
        ].map((group) => (
          <div key={group.label}>
            <p className="eyebrow">{t(group.label)}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {[...nav, ...navExtra].filter((item) => group.paths.includes(item.href)).sort((a, b) => group.paths.indexOf(a.href) - group.paths.indexOf(b.href)).map((item) => <li key={item.href}><Link href={item.href} className="text-silver-2 transition-colors hover:text-ember">{t(item.label)}</Link></li>)}
            </ul>
            {group.label === "Connect" && <address className="mt-6 space-y-2 text-sm not-italic text-steel"><p>{site.location}</p><p><a href={`mailto:${site.email}`} className="break-all hover:text-ember">{site.email}</a></p><p><a href={`tel:${site.phone.replace(/\s+/g, "")}`} className="hover:text-ember">{site.phone}</a></p></address>}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10"><div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-[0.7rem] tracking-wide text-ash sm:px-8"><span>{t("© {year} Oxsnow Studio. All rights reserved.").replace("{year}", year)}</span><span>Est. {site.founded} · Made in Lesotho</span><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })} className="text-silver-2 transition-colors hover:text-ember">Back to top ↑</button></div></div>
    </footer>
  );
}
