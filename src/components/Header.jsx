"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

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
      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-end gap-3 px-5 sm:px-8">
        <Link
          href="/"
          aria-label={`${site.name} — home`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Image
            src={site.logo}
            alt={site.name}
            width={1744}
            height={592}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-2.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  active ? "text-white" : "text-silver-2 hover:text-white"
                }`}
              >
                {item.label}
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
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle light or dark theme"
            title="Toggle theme"
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
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-silver hover:border-ember hover:text-white md:hidden"
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
        className={`overflow-hidden border-t border-white/10 bg-ink/95 backdrop-blur-xl transition-[max-height] duration-500 md:hidden ${
          open ? "max-h-96" : "max-h-0"
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
              {item.label}
            </Link>
          ))}
          <Link href="/vod" className="btn btn-primary mt-4 w-full">
            Watch Now
          </Link>
          <span className="mt-4 text-[0.65rem] tracking-[0.3em] text-ash">
            {site.location.toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
