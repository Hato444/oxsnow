import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import WatchTrigger from "@/components/watch/WatchTrigger";
import HoverVideo from "@/components/HoverVideo";
import { vodRows } from "@/lib/site";

export const metadata = {
  title: "VOD Storefront",
  description:
    "Rent current releases (TVOD) or unlock the Cultural Pass (SVOD) — Basotho history, diaspora favorites and behind-the-camera access.",
};

const plans = [
  {
    name: "TVOD — Rent",
    price: "M25",
    unit: "/ title",
    highlight: false,
    perks: ["48-hour rental window", "New releases on day one", "HD streaming", "No subscription"],
    cta: "Browse Titles",
  },
  {
    name: "Cultural Pass",
    price: "M99",
    unit: "/ month",
    highlight: true,
    perks: [
      "Unlimited SVOD streaming",
      "Full Basotho history archive",
      "Diaspora favorites library",
      "Behind-the-Camera access",
    ],
    cta: "Unlock the Pass",
  },
];

export default function VodPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow flex items-center gap-3">
          <span className="rule-fire" />
          Oxsnow VOD
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-metal sm:text-6xl">
          The Storefront
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel">
          A clean, dark platform for Basotho cinema. Rent current releases
          à la carte, or open the whole archive with the Cultural Pass.
        </p>
      </Reveal>

      {/* Player preview */}
      <Reveal delay={0.1}>
        <div className="card relative mt-14 overflow-hidden">
          <div className="relative flex aspect-[16/8] items-center justify-center bg-gradient-to-br from-ink-3 via-black to-ink-2">
            <Image
              src="/posters/konono.jpg"
              alt="Konono"
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover object-top opacity-70"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.7) 100%), radial-gradient(70% 100% at 20% 0%, rgba(255,69,0,0.18), transparent 55%)",
              }}
            />
            <button
              type="button"
              aria-label="Play featured title"
              className="group relative z-10 grid h-20 w-20 place-items-center rounded-full border border-white/25 bg-black/40 backdrop-blur transition-all hover:border-ember hover:shadow-[0_0_40px_-5px_rgba(255,69,0,0.8)]"
            >
              <span className="ml-1 block h-0 w-0 border-y-[12px] border-l-[18px] border-y-transparent border-l-silver transition-colors group-hover:border-l-ember" />
            </button>
            <div className="absolute bottom-6 left-6 z-10 text-left">
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-ember">
                Featured Premiere
              </p>
              <p className="mt-1 text-xl font-bold text-white keep-light">
                Konono — now streaming
              </p>
            </div>
            <div className="absolute bottom-6 right-6 z-10 hidden sm:block">
              <span className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-silver keep-light backdrop-blur">
                Secure Player · HD
              </span>
            </div>
            {/* scanning light line */}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember/60 to-transparent animate-scan" />
          </div>
        </div>
      </Reveal>

      {/* Plans */}
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.1}>
            <div
              className={`card relative h-full overflow-hidden p-8 ${
                p.highlight ? "border-ember/50" : ""
              }`}
            >
              {p.highlight && (
                <span className="absolute right-0 top-0 rounded-bl-lg bg-gradient-to-r from-ember to-amber px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-ink">
                  Most Popular
                </span>
              )}
              <p className="text-xs uppercase tracking-[0.24em] text-steel">
                {p.name}
              </p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-black text-metal">{p.price}</span>
                <span className="mb-1 text-sm text-ash">{p.unit}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-3 text-sm text-silver-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link
                href="/vod"
                className={`btn mt-8 w-full ${
                  p.highlight ? "btn-primary" : "btn-ghost"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Featured rows */}
      <div className="mt-20 space-y-16">
        {vodRows.map((group) => (
          <div key={group.row}>
            <Reveal>
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-metal">
                  {group.row}
                </h2>
                <span className="select-none text-[0.65rem] uppercase tracking-[0.24em] text-ash">
                  See all
                </span>
              </div>
            </Reveal>
            <div className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
              {group.items.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.05} className="snap-start">
                  <WatchTrigger
                    item={{
                      title: item.title,
                      meta: item.meta,
                      poster: item.cover,
                      src: item.src,
                      teaser: item.teaser,
                    }}
                    className="card group w-[220px] shrink-0 overflow-hidden text-left"
                  >
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-ink-3 via-ink-2 to-black">
                      {item.preview || item.teaser ? (
                        <HoverVideo
                          src={item.preview || item.teaser}
                          poster={item.cover}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : item.cover ? (
                        <Image
                          src={item.cover}
                          alt={item.title}
                          fill
                          sizes="220px"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <>
                          <div
                            className="absolute inset-0 opacity-60"
                            style={{
                              background:
                                "radial-gradient(120% 90% at 25% 0%, rgba(255,69,0,0.18), transparent 55%)",
                            }}
                          />
                          <span className="absolute inset-0 grid place-items-center text-[0.6rem] uppercase tracking-[0.22em] text-ash">
                            Cover coming soon
                          </span>
                        </>
                      )}
                      <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/50 backdrop-blur">
                          <span className="ml-0.5 block h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-ember" />
                        </span>
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="truncate text-sm font-bold text-white group-hover:text-ember">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-ash">
                        {item.meta}
                      </p>
                    </div>
                  </WatchTrigger>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
