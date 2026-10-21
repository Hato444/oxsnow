import Link from "next/link";
import Reveal from "@/components/Reveal";
import { services } from "@/lib/site";

export const metadata = {
  title: "Services",
  description:
    "Commercial production, broadcasting licensing, educational packages and studio services from Lesotho's film studio — Oxsnow Studio, Maseru.",
};

const SERVICE_ICONS = {
  commercial: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="2" y="6" width="13" height="12" rx="2" />
      <path d="m15 10 6-3v10l-6-3" strokeLinejoin="round" />
    </svg>
  ),
  broadcast: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="2" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" strokeLinecap="round" />
    </svg>
  ),
  education: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="m12 4 10 5-10 5L2 9l10-5z" strokeLinejoin="round" />
      <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" strokeLinecap="round" />
    </svg>
  ),
  studio: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 7h16v10H4z" strokeLinejoin="round" />
      <path d="M8 7V4h8v3M9 12h6" strokeLinecap="round" />
    </svg>
  ),
};

export default function ServicesPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow flex items-center gap-3">
          <span className="rule-fire" />
          Production Services · B2B
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-metal sm:text-6xl">
          The machinery of Basotho cinema — hired, licensed, taught.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel">
          Oxsnow runs as an umbrella studio: we make our own slate, and we put
          the same crews, library and facilities to work for broadcasters,
          brands, schools and government.
        </p>
      </Reveal>

      {/* ============================ PACKAGES ============================ */}
      <div className="mt-20 grid gap-6 lg:grid-cols-2">
        {services.map((svc, i) => (
          <Reveal key={svc.id} delay={i * 0.08}>
            <article className="card group flex h-full flex-col p-7 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-lg border border-white/12 bg-gradient-to-b from-white/8 to-transparent text-ember">
                  {SERVICE_ICONS[svc.id]}
                </span>
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-ash">
                  {svc.tag}
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-ember">
                {svc.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-steel">{svc.copy}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {svc.includes.map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm text-silver-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                    {line}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-6">
                <Link href="/contact" className="btn btn-primary !py-2.5 !text-[0.7rem]">
                  Request Quote
                </Link>
                <span className="text-[0.6rem] uppercase tracking-[0.2em] text-ash">
                  Reply within 2 days
                </span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* ============================ PROCESS ============================ */}
      <div className="mt-24 border-y border-white/10 bg-ink-2/40">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
          <Reveal>
            <p className="eyebrow">How We Work</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-metal sm:text-4xl">
              Brief to master, one pipeline.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Brief", copy: "Tell us the goal, the audience and the deadline. We scope honestly." },
              { step: "02", title: "Plan", copy: "Script, budget, schedule and crew locked before a single frame rolls." },
              { step: "03", title: "Produce", copy: "Shoot across Lesotho with local crews who know the terrain and the culture." },
              { step: "04", title: "Deliver", copy: "Edit, colour, sound and masters — delivered in every format you need." },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 0.07}>
                <div className="relative">
                  <span className="text-4xl font-black text-white/8">{s.step}</span>
                  <h3 className="mt-2 text-lg font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel">{s.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ============================ PARTNERS CTA ============================ */}
      <Reveal delay={0.1}>
        <div className="card relative mt-20 overflow-hidden px-8 py-14 text-center sm:px-16">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(70% 120% at 50% 130%, rgba(255,69,0,0.25), transparent 60%)",
            }}
          />
          <div className="relative">
            <p className="eyebrow">Broadcasters · Schools · Government · Sponsors</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight text-metal sm:text-4xl">
              Let&apos;s put Basotho stories on your screens.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-steel">
              Partnership inquiries get a named producer and a written quote —
              not a brochure.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn btn-primary">
                Request a Quote
              </Link>
              <Link href="/films" className="btn btn-ghost">
                See the Slate
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
