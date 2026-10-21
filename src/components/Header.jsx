"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { useWatchlist } from "@/components/watch/WatchlistProvider";
import { LANGS } from "@/lib/i18n";
import { useLang } from "@/components/lang/LangProvider";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useWatchlist();
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  const toggleTheme = () => {
    const el = document.documentElement;
    const next = !el.classList.contains("light");
    el.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {}
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/10 bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          aria-label={`${site.name} — home`}
          className="flex shrink-0 items-center"
        >
          <Image
            src={site.logo}
            alt={site.name}
            width={1855}
            height={496}
            priority
            className="h-auto w-[160px] object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)] sm:w-[190px] lg:w-[212px]"
          />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  active ? "text-white" : "text-silver-2 hover:text-white"
                }`}
              >
                {t(item.label)}
                <span
                  className={`absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-ember to-transparent transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div
            role="group"
            aria-label="Language / Mokhoa oa polelo"
            className="hidden items-center rounded-full border border-white/15 p-0.5 sm:flex"
          >
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                lang={l.id === "st" ? "st" : "en"}
                aria-pressed={lang === l.id}
                onClick={() => setLang(l.id)}
                title={l.name}
                className={`cursor-pointer rounded-full px-2.5 py-1 text-[0.6rem] font-black tracking-[0.14em] transition-colors ${
                  lang === l.id
                    ? "bg-ember text-ink shadow-[0_0_12px_-3px_rgba(255,69,0,0.9)]"
                    : "text-ash hover:text-silver"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Link href="/vod" className="btn btn-primary hidden !py-2.5 !text-[0.7rem] xl:inline-flex">
            {t("Watch Now")}
          </Link>
          <Link
            href="/community"
            aria-label={t("Community")}
            title={t("Community")}
            className={`grid h-10 w-10 place-items-center rounded-md border transition-colors ${
              pathname === "/community"
                ? "border-ember text-ember"
                : "border-white/15 text-silver hover:border-ember hover:text-ember"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />
            </svg>
          </Link>
          <Link
            href="/watchlist"
            aria-label={`${t("My watchlist")} (${count} saved)`}
            title={t("My watchlist")}
            className={`relative grid h-10 w-10 place-items-center rounded-md border transition-colors ${
              pathname === "/watchlist"
                ? "border-ember text-ember"
                : "border-white/15 text-silver hover:border-ember hover:text-ember"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill={count > 0 ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-ember px-1 text-[0.6rem] font-black leading-[18px] text-ink shadow-[0_0_12px_-2px_rgba(255,69,0,0.9)]">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            aria-label={t("My Account")}
            title={t("My Account")}
            className={`grid h-10 w-10 place-items-center rounded-md border transition-colors ${
              pathname === "/account"
                ? "border-ember text-ember"
                : "border-white/15 text-silver hover:border-ember hover:text-ember"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
            </svg>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t("Toggle light or dark theme")}
            title={t("Toggle light or dark theme")}
            className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-silver transition-colors hover:border-ember hover:text-ember"
          >
            <svg viewBox="0 0 24 24" className="theme-icon-sun h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
            </svg>
            <svg viewBox="0 0 24 24" className="theme-icon-moon h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={t("Toggle menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-silver hover:border-ember hover:text-white lg:hidden"
          >
            <span className="flex flex-col gap-1.5">
              <span
                className={`h-px w-5 bg-current transition-transform ${
                  open ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-px w-5 bg-current transition-opacity ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-px w-5 bg-current transition-transform ${
                  open ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drop panel */}
      <div
        className={`overflow-hidden border-t border-white/10 bg-ink/95 backdrop-blur-xl transition-[max-height] duration-500 lg:hidden ${
          open ? "max-h-[36rem]" : "max-h-0"
        }`}
      >
        <div className="flex flex-col px-5 py-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b border-white/5 py-3 text-sm font-semibold uppercase tracking-[0.2em] ${
                pathname === item.href ? "text-ember" : "text-silver-2"
              }`}
            >
              {t(item.label)}
            </Link>
          ))}
          <Link
            href="/watchlist"
            className={`flex items-center justify-between border-b border-white/5 py-3 text-sm font-semibold uppercase tracking-[0.2em] ${
              pathname === "/watchlist" ? "text-ember" : "text-silver-2"
            }`}
          >
            {t("Watchlist")}
            {count > 0 && (
              <span className="grid min-w-[22px] place-items-center rounded-full bg-ember px-1.5 text-[0.65rem] font-black leading-[22px] text-ink">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            className={`border-b border-white/5 py-3 text-sm font-semibold uppercase tracking-[0.2em] ${
              pathname === "/account" ? "text-ember" : "text-silver-2"
            }`}
          >
            {t("My Account")}
          </Link>
          <div
            role="group"
            aria-label="Language / Mokhoa oa polelo"
            className="mt-4 flex gap-2"
          >
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                lang={l.id === "st" ? "st" : "en"}
                aria-pressed={lang === l.id}
                onClick={() => setLang(l.id)}
                title={l.name}
                className={`flex-1 cursor-pointer rounded-full border px-4 py-2 text-[0.65rem] font-black tracking-[0.16em] transition-colors ${
                  lang === l.id
                    ? "border-ember bg-ember/15 text-ember"
                    : "border-white/15 text-ash"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Link href="/vod" className="btn btn-primary mt-4 w-full">
            {t("Watch Now")}
          </Link>
          <span className="mt-4 text-[0.65rem] tracking-[0.3em] text-ash">
            {site.location.toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
