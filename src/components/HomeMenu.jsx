"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/lang/LangProvider";

const links = [
  ["About", "/about"],
  ["Support Oxsnow", "/#support"],
];

export default function HomeMenu({ mobile = false, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const pathname = usePathname();
  const { t } = useLang();
  useEffect(() => {
    if (!open) return;
    const pointer = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); };
    const key = (event) => { if (event.key === "Escape") { setOpen(false); ref.current?.querySelector("button")?.focus(); } };
    document.addEventListener("pointerdown", pointer);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", pointer); document.removeEventListener("keydown", key); };
  }, [open]);
  return (
    <div ref={ref} className="relative" onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <div className={mobile ? "flex items-center justify-between border-b border-white/5" : "relative flex items-center"}>
        <Link href="/" onClick={() => { setOpen(false); onNavigate?.(); }} className={mobile ? `flex-1 py-3 text-sm font-semibold uppercase tracking-[0.2em] ${pathname === "/" ? "text-ember" : "text-silver-2"}` : `py-2 pl-3 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${pathname === "/" ? "text-white" : "text-silver-2 hover:text-white"}`}>
          {t("Home")}
        </Link>
        <button type="button" aria-label={open ? "Close Home menu" : "Open Home menu"} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)} className={mobile ? "grid h-11 w-11 place-items-center text-silver-2 hover:text-ember focus-visible:outline-2 focus-visible:outline-ember" : "grid h-10 w-8 place-items-center text-silver-2 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-ember"}>
          <svg viewBox="0 0 24 24" aria-hidden className={`${mobile ? "h-4 w-4" : "h-3 w-3"} transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {!mobile && <span className={`pointer-events-none absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-ember to-transparent transition-opacity ${open || pathname === "/" || pathname === "/about" ? "opacity-100" : "opacity-0"}`} />}
      </div>
      {open && <div role="menu" className={mobile ? "" : "absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 pt-2"}>
        <div className={mobile ? "" : "menu-panel rounded-xl border border-white/10 bg-[#0c0c0c] p-1.5 shadow-[0_28px_70px_-18px_rgba(0,0,0,0.95)] backdrop-blur-xl"}>
          {!mobile && <p className="px-3.5 pb-1.5 pt-2 text-[0.55rem] font-bold uppercase tracking-[0.3em] text-ember">Home</p>}
          {links.map(([label, href]) => {
            const active = href === "/about" && pathname === "/about";
            return <Link key={href} href={href} role="menuitem" onClick={() => { setOpen(false); onNavigate?.(); }} className={mobile ? `flex items-center gap-2 border-b border-white/5 py-2.5 pl-4 text-[0.8rem] font-semibold uppercase tracking-[0.18em] ${active ? "text-ember" : "text-silver-2"}` : `group flex items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${active ? "bg-ember/12 text-ember shadow-[inset_0_0_0_1px_rgba(255,69,0,0.3)]" : "text-silver-2 hover:bg-white/6 hover:text-ember"}`}>
              {mobile && <span aria-hidden className="text-ember/70">—</span>}{t(label)}{!mobile && <span aria-hidden className={`text-ember transition-all duration-200 ${active ? "opacity-100" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`}>→</span>}
            </Link>;
          })}
        </div>
      </div>}
    </div>
  );
}
