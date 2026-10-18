import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import WatchTrigger from "@/components/watch/WatchTrigger";
import HoverVideo from "@/components/HoverVideo";
import { films, pillars, site, stats, values } from "@/lib/site";

export default function Home() {
  const featured = films.slice(0, 6);

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-16">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="rule-fire" />
              A Lesotho Film Studio · Est. {site.founded}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-metal">Oxsnow Studio</span>
              <span className="block text-fire animate-flicker">
                Industrializing Basotho Stories
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-silver-2">
              {site.mission} From feature films and archival documentaries to
              broadcasting, distribution and IP licensing.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/films" className="btn btn-primary">
                Explore Films
              </Link>
              <Link href="/vod" className="btn btn-ghost">
                Watch Now
              </Link>
              <Link href="/contact" className="btn btn-ghost">
                Join the Academy
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="mt-16 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.32em] text-ash">
              <span className="inline-block h-8 w-px bg-gradient-to-b from-ember to-transparent" />
              Scroll to enter the slate
            </div>
          </Reveal>
        </div>

        {/* Vertical film edge lines for cinematic framing */}
        <div className="pointer-events-none absolute inset-y-0 left-5 hidden w-px bg-white/5 lg:block" />
        <div className="pointer-events-none absolute inset-y-0 right-5 hidden w-px bg-white/5 lg:block" />
      </section>

      {/* ============================ MARQUEE ============================ */}
      <div className="relative z-10 overflow-hidden border-y border-white/10 bg-ink-2/50 py-4">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-10">
              {["Feature Films", "Archival Documentaries", "Broadcasting", "Distribution", "IP Licensing", "The Academy"].map(
                (t) => (
                  <span
                    key={t}
                    className="flex items-center gap-10 text-xs font-semibold uppercase tracking-[0.3em] text-steel"
                  >
                    {t}
                    <span className="h-1 w-1 rounded-full bg-ember" />
                  </span>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ============================ VISION + PILLARS ============================ */}
      <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <Reveal>
            <p className="eyebrow">The Vision</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-metal sm:text-4xl">
              Building an industry,
              <br />
              not just making movies.
            </h2>
            <div className="rule-fire mt-6" />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-steel">
              Founded in {site.founded} by {site.founders.join(", ")}, Oxsnow
              Studio exists to create jobs, preserve Basotho history, and build
              Lesotho&apos;s film economy from the ground up.
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <article className="card flex h-full flex-col p-6">
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-ember">
                    {p.tag}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-white">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-steel">
                    {p.copy}
                  </p>
                  <span className="mt-6 h-px w-10 bg-gradient-to-r from-ember to-transparent transition-all duration-300 group-hover:w-16" />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ STATS BAND ============================ */}
      <section className="border-y border-white/10 bg-ink-2/40">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-px px-5 sm:px-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.06}
              className="border-white/10 py-10 text-center [&:not(:last-child)]:border-r"
            >
              <div className="text-3xl font-black tracking-tight text-metal sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-2 text-[0.65rem] uppercase tracking-[0.28em] text-ash">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ FEATURED SLATE ============================ */}
      <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Reveal>
            <p className="eyebrow">Current Slate</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-metal sm:text-4xl">
              Featured Projects
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/films"
              className="text-xs font-semibold uppercase tracking-[0.24em] text-silver-2 transition-colors hover:text-ember"
            >
              View all films →
            </Link>
          </Reveal>
        </div>

        {/* Horizontal scroll rail */}
        <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]">
          {featured.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05} className="snap-start">
              <WatchTrigger
                item={{
                  title: f.title,
                  meta: `${f.type} - ${f.year}`,
                  poster: f.cover,
                  src: f.src,
                  teaser: f.teaser,
                  logline: f.logline,
                }}
                className="card group block h-full w-[280px] shrink-0 overflow-hidden text-left sm:w-[320px]"
              >
                <div className="relative flex h-48 items-end overflow-hidden bg-gradient-to-br from-ink-3 via-ink-2 to-black">
                  {f.preview || f.teaser ? (
                    <HoverVideo
                      src={f.preview || f.teaser}
                      poster={f.cover}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : f.cover ? (
                    <Image
                      src={f.cover}
                      alt={f.title}
                      fill
                      sizes="320px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 opacity-60"
                      style={{
                        background:
                          "radial-gradient(120% 90% at 15% 0%, rgba(255,69,0,0.22), transparent 55%), radial-gradient(90% 80% at 100% 120%, rgba(192,192,192,0.10), transparent 60%)",
                      }}
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 to-transparent" />
                  <span className="relative z-10 ml-4 mb-4 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-silver keep-light backdrop-blur">
                    {f.status}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-white transition-colors group-hover:text-ember">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-ember">
                    {f.type} - {f.year}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-steel">
                    {f.logline}
                  </p>
                </div>
              </WatchTrigger>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ VALUES ============================ */}
      <section className="border-t border-white/10 bg-ink-2/30">
        <div className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
          <Reveal>
            <p className="eyebrow">What We Stand For</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-metal sm:text-4xl">
              Values forged in fire & steel
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="h-full">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg border border-white/12 bg-gradient-to-b from-white/8 to-transparent">
                    <span className="h-2 w-2 rounded-full bg-ember shadow-[0_0_12px_3px_rgba(255,69,0,0.5)]" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel">
                    {v.copy}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <div className="card relative overflow-hidden px-8 py-16 text-center sm:px-16">
            <div
              className="absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(70% 120% at 50% 130%, rgba(255,69,0,0.28), transparent 60%)",
              }}
            />
            <div className="relative">
              <p className="eyebrow">The Cultural Pass</p>
              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight text-metal sm:text-5xl">
                Stream the stories that built a nation.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-steel">
                Rent new releases or unlock the full Basotho history archive on
                the Oxsnow VOD storefront.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <Link href="/vod" className="btn btn-primary">
                  Enter VOD
                </Link>
                <Link href="/contact" className="btn btn-ghost">
                  Partner With Us
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
