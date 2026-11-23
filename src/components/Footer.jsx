"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { nav, navExtra, site, socials } from "@/lib/site";
import { useLang } from "@/components/lang/LangProvider";
import { useWatch } from "@/components/watch/WatchProvider";

const tiktokPath = "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z";
const socialSvg = { viewBox: "0 0 24 24", "aria-hidden": true, className: "h-[18px] w-[18px]" };
const SOCIAL_ICONS = {
  TikTok: (
    <svg {...socialSvg} viewBox="-1 -1 26 26">
      <path d={tiktokPath} fill="#25F4EE" transform="translate(-0.8,-0.4)" />
      <path d={tiktokPath} fill="#FE2C55" transform="translate(0.8,0.4)" />
      <path d={tiktokPath} fill="#fff" />
    </svg>
  ),
  Instagram: (
    <svg {...socialSvg} fill="none">
      <defs><linearGradient id="footer-instagram-gradient" x1="2" y1="23" x2="21" y2="2" gradientUnits="userSpaceOnUse"><stop stopColor="#FEDA75" /><stop offset=".3" stopColor="#FA7E1E" /><stop offset=".6" stopColor="#D62976" /><stop offset="1" stopColor="#962FBF" /></linearGradient></defs>
      <rect x="3" y="3" width="18" height="18" rx="5.5" stroke="url(#footer-instagram-gradient)" strokeWidth="2.4" />
      <circle cx="12" cy="12" r="4.2" stroke="url(#footer-instagram-gradient)" strokeWidth="2.4" />
      <circle cx="17.4" cy="6.8" r="1.3" fill="#D62976" />
    </svg>
  ),
  Facebook: (
    <svg {...socialSvg} fill="#1877F2">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103.551.066.953.134 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  ),
  YouTube: (
    <svg {...socialSvg}>
      <rect x="1" y="4" width="22" height="16" rx="5" fill="#FF0033" />
      <path d="M10 8.5v7l6-3.5z" fill="#fff" />
    </svg>
  ),
};
const SOCIAL_GLOW = { TikTok: "#25F4EE", Instagram: "#D62976", Facebook: "#1877F2", YouTube: "#FF0033" };

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // "" | "busy" | "joined" | "error"
  const [message, setMessage] = useState("");
  const [year, setYear] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLang();
  const { item: watchItem } = useWatch();

  useEffect(() => {
    const t = setTimeout(() => setYear(new Date().getFullYear()), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 500);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
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
            {socials.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label} style={{ "--social-glow": SOCIAL_GLOW[s.label] }} className="footer-social grid h-9 w-9 place-items-center rounded-md border border-white/15">{SOCIAL_ICONS[s.label]}</a>)}
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
      <div className="border-t border-white/10"><div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-[0.7rem] tracking-wide text-ash sm:px-8"><span>{t("© {year} Oxsnow Studio. All rights reserved.").replace("{year}", year)}</span><span>Est. {site.founded} · Made in Lesotho</span></div></div>
      <button type="button" aria-label="Back to top" aria-hidden={!scrolled || !!watchItem} tabIndex={scrolled && !watchItem ? 0 : -1} onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })} className={`btn btn-primary floating-back-top ${scrolled && !watchItem ? "is-visible" : ""}`}>
        Back to top <span aria-hidden="true">↑</span>
      </button>
    </footer>
  );
}
