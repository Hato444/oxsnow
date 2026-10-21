"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, navPrimary, navSecondary, site } from "@/lib/site";
import { useWatchlist } from "@/components/watch/WatchlistProvider";
import { LANGS } from "@/lib/i18n";
import { useLang } from "@/components/lang/LangProvider";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [utilOpen, setUtilOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useWatchlist();
  const { lang, setLang, t } = useLang();
  const studioRef = useRef(null);
  const utilRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close every menu on navigation (deferred — no setState in the effect body)
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
      setStudioOpen(false);
      setUtilOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Escape closes any open dropdown from anywhere
  useEffect(() => {
    if (!studioOpen && !utilOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setStudioOpen(false);
        setUtilOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studioOpen, utilOpen]);

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

        <nav
          aria-label="Primary"
          className="ml-3 hidden items-center gap-1 lg:flex xl:ml-9"
        >
          {navPrimary.map((item) => {
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

          {/* Studio — overflow group so the bar never crowds at lg widths */}
          <div
            ref={studioRef}
            className="relative"
            onMouseEnter={() => setStudioOpen(true)}
            onMouseLeave={() => setStudioOpen(false)}
            onFocusCapture={() => setStudioOpen(true)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setStudioOpen(false);
            }}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={studioOpen}
              onClick={() => setStudioOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setStudioOpen(false);
              }}
              className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                studioOpen || navSecondary.some((i) => pathname === i.href)
                  ? "text-white"
                  : "text-silver-2 hover:text-white"
              }`}
            >
              {t("Studio")}
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className={`h-3 w-3 transition-transform duration-300 ${
                  studioOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
              <span
                className={`absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-ember to-transparent transition-opacity ${
                  navSecondary.some((i) => pathname === i.href) || studioOpen
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              />
            </button>

            {studioOpen && (
              <div
                role="menu"
                className="absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 pt-2"
              >
                <div className="rounded-xl border border-white/10 bg-[#0c0c0c] p-1.5 shadow-[0_28px_70px_-18px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <p className="px-3.5 pb-1.5 pt-2 text-[0.55rem] font-bold uppercase tracking-[0.3em] text-ember">
                    {t("Studio")}
                  </p>
                  {navSecondary.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setStudioOpen(false)}
                        className={`group flex items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                          active
                            ? "bg-white/6 text-white"
                            : "text-silver-2 hover:bg-white/6 hover:text-ember"
                        }`}
                      >
                        {t(item.label)}
                        <span
                          aria-hidden
                          className={`text-ember transition-all duration-200 ${
                            active
                              ? "translate-x-0 opacity-100"
                              : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                          }`}
                        >
                          →
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-3">
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

          {/* Utility menu — one control for community/gallery/watchlist/account/theme */}
          <div
            ref={utilRef}
            className="relative hidden sm:block"
            onMouseEnter={() => setUtilOpen(true)}
            onMouseLeave={() => setUtilOpen(false)}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={utilOpen}
              aria-label="Menu"
              onClick={() => setUtilOpen((v) => !v)}
              className={`relative grid h-10 w-10 place-items-center rounded-md border transition-colors ${
                utilOpen ||
                ["/community", "/gallery", "/watchlist", "/account"].includes(pathname)
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
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-ember px-1 text-[0.6rem] font-black leading-[18px] text-ink shadow-[0_0_12px_-2px_rgba(255,69,0,0.9)]">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            {utilOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 w-56 pt-2"
              >
                <div className="rounded-xl border border-white/10 bg-[#0c0c0c] p-1.5 shadow-[0_28px_70px_-18px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <p className="px-3.5 pb-1.5 pt-2 text-[0.55rem] font-bold uppercase tracking-[0.3em] text-ember">
                    Browse
                  </p>
                  {[
                    { label: t("Community"), href: "/community" },
                    { label: t("Gallery"), href: "/gallery" },
                    { label: t("Watchlist"), href: "/watchlist", badge: count },
                    { label: t("My Account"), href: "/account" },
                  ].map((entry) => (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      role="menuitem"
                      onClick={() => setUtilOpen(false)}
                      className={`group flex items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                        pathname === entry.href
                          ? "bg-white/6 text-white"
                          : "text-silver-2 hover:bg-white/6 hover:text-ember"
                      }`}
                    >
                      {entry.label}
                      <span className="flex items-center gap-2">
                        {entry.badge > 0 && (
                          <span className="grid min-w-[20px] place-items-center rounded-full bg-ember px-1.5 text-[0.6rem] font-black leading-[20px] text-ink">
                            {entry.badge > 9 ? "9+" : entry.badge}
                          </span>
                        )}
                        <span
                          aria-hidden
                          className="text-ember opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        >
                          →
                        </span>
                      </span>
                    </Link>
                  ))}
                  <div className="mx-3.5 my-1.5 h-px bg-white/8" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={toggleTheme}
                    className="group flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-silver-2 transition-colors hover:bg-white/6 hover:text-ember"
                  >
                    {t("Theme")}
                    <span aria-hidden className="text-ember opacity-0 transition-all duration-200 group-hover:opacity-100">
                      →
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
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
          open ? "max-h-[42rem]" : "max-h-0"
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
            href="/community"
            className={`border-b border-white/5 py-3 text-sm font-semibold uppercase tracking-[0.2em] ${
              pathname === "/community" ? "text-ember" : "text-silver-2"
            }`}
          >
            {t("Community")}
          </Link>
          <Link
            href="/gallery"
            className={`border-b border-white/5 py-3 text-sm font-semibold uppercase tracking-[0.2em] ${
              pathname === "/gallery" ? "text-ember" : "text-silver-2"
            }`}
          >
            {t("Gallery")}
          </Link>
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
