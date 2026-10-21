"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navContact, navPrimary, navSecondary, site } from "@/lib/site";
import { useWatchlist } from "@/components/watch/WatchlistProvider";
import { LANGS } from "@/lib/i18n";
import { useLang } from "@/components/lang/LangProvider";

// 16px inline icons for the utility menu — drawn to sit on the text baseline
const svgBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};
const MENU_ICONS = {
  community: (
    <svg {...svgBase} className="h-4 w-4 shrink-0">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19.5c0-3.2 2.7-5 6-5s6 1.8 6 5" />
      <path d="M16.2 5.6a3 3 0 0 1 0 5.4" />
      <path d="M17.6 14.9c1.9.8 3.4 2.4 3.4 4.6" />
    </svg>
  ),
  gallery: (
    <svg {...svgBase} className="h-4 w-4 shrink-0">
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="M4.5 17.5l4.5-4.5 3.5 3.5 2.5-2.5 4.5 4.5" />
    </svg>
  ),
  watchlist: (
    <svg {...svgBase} className="h-4 w-4 shrink-0">
      <path d="M2.5 12S6 6.2 12 6.2 21.5 12 21.5 12 18 17.8 12 17.8 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  ),
  account: (
    <svg {...svgBase} className="h-4 w-4 shrink-0">
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.8 20c0-3.9 3.3-6.1 7.2-6.1s7.2 2.2 7.2 6.1" />
    </svg>
  ),
  moon: (
    <svg {...svgBase} className="h-3.5 w-3.5 shrink-0">
      <path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5a7 7 0 0 0 10 10z" />
    </svg>
  ),
  sun: (
    <svg {...svgBase} className="h-3.5 w-3.5 shrink-0">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1 1M17.4 17.4l1 1M5.6 18.4l1-1M17.4 6.6l1-1" />
    </svg>
  ),
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [utilOpen, setUtilOpen] = useState(false);
  const [mobileStudio, setMobileStudio] = useState(false);
  const [light, setLight] = useState(false);
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

  // sync the theme toggle with the DOM after mount (deferred — no setState in effect body)
  useEffect(() => {
    const timer = setTimeout(
      () => setLight(document.documentElement.classList.contains("light")),
      0
    );
    return () => clearTimeout(timer);
  }, []);

  // close every menu on navigation (deferred — no setState in the effect body)
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
      setStudioOpen(false);
      setUtilOpen(false);
      setMobileStudio(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // tap outside closes the utility menu (hover alone never fires on phones)
  useEffect(() => {
    if (!utilOpen) return;
    const onPointer = (e) => {
      if (utilRef.current && !utilRef.current.contains(e.target)) setUtilOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [utilOpen]);

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

  const applyTheme = (nextLight) => {
    document.documentElement.classList.toggle("light", nextLight);
    try {
      localStorage.setItem("theme", nextLight ? "light" : "dark");
    } catch {}
    setLight(nextLight);
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
                <div className="menu-panel rounded-xl border border-white/10 bg-[#0c0c0c] p-1.5 shadow-[0_28px_70px_-18px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <p className="px-3.5 pb-1.5 pt-2 text-[0.55rem] font-bold uppercase tracking-[0.3em] text-ember">
                    Studio
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
                            ? "bg-ember/12 text-ember shadow-[inset_0_0_0_1px_rgba(255,69,0,0.3)] hover:bg-ember/18"
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

          {/* Contact — 6th item, closing the row next to Studio */}
          <Link
            href={navContact.href}
            className={`relative ml-0.5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
              pathname === navContact.href
                ? "text-white"
                : "text-silver-2 hover:text-white"
            }`}
          >
            {t(navContact.label)}
            <span
              className={`absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-ember to-transparent transition-opacity ${
                pathname === navContact.href ? "opacity-100" : "opacity-0"
              }`}
            />
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* Community + Watchlist as bare icon shortcuts (same icons as the menu rows) — hover tells you which is which */}
          <Link
            href="/community"
            title={t("Community")}
            className={`group relative hidden h-10 w-10 place-items-center rounded-md border transition-colors sm:grid ${
              pathname === "/community"
                ? "border-ember text-ember"
                : "border-white/15 text-silver hover:border-ember hover:text-ember"
            }`}
          >
            {MENU_ICONS.community}
            <span
              aria-hidden
              className="menu-panel pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded border border-white/10 bg-[#0c0c0c] px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-silver-2 opacity-0 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.9)] transition-opacity duration-200 group-hover:opacity-100"
            >
              {t("Community")}
            </span>
          </Link>
          <Link
            href="/watchlist"
            title={t("Watchlist")}
            className={`group relative hidden h-10 w-10 place-items-center rounded-md border transition-colors sm:grid ${
              pathname === "/watchlist"
                ? "border-ember text-ember"
                : "border-white/15 text-silver hover:border-ember hover:text-ember"
            }`}
          >
            {MENU_ICONS.watchlist}
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-ember px-1 text-[0.6rem] font-black leading-[18px] text-ink shadow-[0_0_12px_-2px_rgba(255,69,0,0.9)]">
                {count > 9 ? "9+" : count}
              </span>
            )}
            <span
              aria-hidden
              className="menu-panel pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded border border-white/10 bg-[#0c0c0c] px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-silver-2 opacity-0 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.9)] transition-opacity duration-200 group-hover:opacity-100"
            >
              {t("Watchlist")}
            </span>
          </Link>
          <Link href="/vod" className="btn btn-primary hidden !py-2.5 !text-[0.7rem] xl:inline-flex">
            {t("Watch Now")}
          </Link>

          {/* Utility menu — community/gallery/watchlist/account/theme, on phone too */}
          <div
            ref={utilRef}
            className="relative"
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
                ["/community", "/watchlist", "/account"].includes(pathname)
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
                <div className="menu-panel rounded-xl border border-white/10 bg-[#0c0c0c] p-1.5 shadow-[0_28px_70px_-18px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <p className="px-3.5 pb-1.5 pt-2 text-[0.55rem] font-bold uppercase tracking-[0.3em] text-ember">
                    Browse
                  </p>
                  {[
                    { label: t("Community"), href: "/community", icon: MENU_ICONS.community, phoneOnly: true },
                    { label: t("Watchlist"), href: "/watchlist", icon: MENU_ICONS.watchlist, badge: count, phoneOnly: true },
                    { label: t("My Account"), href: "/account", icon: MENU_ICONS.account },
                  ].map((entry) => (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      role="menuitem"
                      onClick={() => setUtilOpen(false)}
                      className={`group ${entry.phoneOnly ? "flex sm:hidden" : "flex"} items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                        pathname === entry.href
                          ? "bg-ember/12 text-ember shadow-[inset_0_0_0_1px_rgba(255,69,0,0.3)] hover:bg-ember/18"
                          : "text-silver-2 hover:bg-white/6 hover:text-ember"
                      }`}
                    >
                      {entry.icon}
                      {entry.label}
                      <span className="ml-auto flex items-center gap-2">
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
                  <div className="flex items-center justify-between px-3.5 py-2.5">
                    <span className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-silver-2">
                      {t("Language")}
                    </span>
                    <div
                      role="group"
                      aria-label="Language / Mokhoa oa polelo"
                      className="flex items-center rounded-full border border-white/15 p-0.5"
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
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5">
                    <span className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-silver-2">
                      {light ? MENU_ICONS.sun : MENU_ICONS.moon}
                      {t("Theme")}
                    </span>
                    <div
                      role="group"
                      aria-label={t("Theme")}
                      className="flex items-center rounded-full border border-white/15 p-0.5"
                    >
                      <button
                        type="button"
                        aria-label="Dark"
                        aria-pressed={!light}
                        onClick={() => applyTheme(!light)}
                        className={`grid h-6 w-6 place-items-center rounded-full transition-colors ${
                          !light ? "bg-ember text-ink" : "text-ash hover:text-silver"
                        }`}
                      >
                        {MENU_ICONS.moon}
                      </button>
                      <button
                        type="button"
                        aria-label="Light"
                        aria-pressed={light}
                        onClick={() => applyTheme(!light)}
                        className={`grid h-6 w-6 place-items-center rounded-full transition-colors ${
                          light ? "bg-ember text-ink" : "text-ash hover:text-silver"
                        }`}
                      >
                        {MENU_ICONS.sun}
                      </button>
                    </div>
                  </div>
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
          {[...navPrimary, navContact].map((item) => (
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

          {/* Studio — nested so the phone list stays short */}
          <button
            type="button"
            aria-expanded={mobileStudio}
            onClick={() => setMobileStudio((v) => !v)}
            className={`flex items-center justify-between border-b border-white/5 py-3 text-sm font-semibold uppercase tracking-[0.2em] ${
              navSecondary.some((i) => pathname === i.href) || mobileStudio
                ? "text-ember"
                : "text-silver-2"
            }`}
          >
            {t("Studio")}
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className={`h-4 w-4 transition-transform duration-300 ${
                mobileStudio ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {mobileStudio &&
            navSecondary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 border-b border-white/5 py-2.5 pl-4 text-[0.8rem] font-semibold uppercase tracking-[0.18em] ${
                  pathname === item.href ? "text-ember" : "text-silver-2"
                }`}
              >
                <span aria-hidden className="text-ember/70">
                  —
                </span>
                {t(item.label)}
              </Link>
            ))}
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
