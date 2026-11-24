import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import FeaturedRail from "@/components/FeaturedRail";
import SupportPanel from "@/components/SupportPanel";
import ValueIcon from "@/components/ValueIcon";
import CulturalPass from "@/components/CulturalPass";
import SonyShowcase from "@/components/hire/SonyShowcase";
import { films, pillars, site, stats, values } from "@/lib/site";

export default function Home() {
  const featured = films.slice(0, 6);

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section id="overview" className="relative flex min-h-[100svh] scroll-mt-24 items-center overflow-hidden pt-16">
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
            <p id="mission" className="mt-7 max-w-xl scroll-mt-24 text-lg leading-relaxed text-silver-2">
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
      <section id="vision" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8">
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

        {/* Cinematic rail */}
        <FeaturedRail films={featured} />
      </section>

      {/* ============================ COMMUNITY ============================ */}
      <section className="relative overflow-hidden border-y border-white/10 bg-ink-2/40">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-ink-3">
              <div className="relative aspect-[16/10]">
                <Image src="/gallery/IMG-20261014-WA0080.jpg" alt="Creatives together at The Craft" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-center" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10" />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 sm:inset-x-7 sm:bottom-7">
                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.26em] text-white">Oxsnow Studio <span className="text-ember">/</span> Community</span>
                  <span aria-hidden className="h-px w-16 bg-gradient-to-r from-ember to-transparent" />
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow flex items-center gap-3"><span className="rule-fire" /> The Oxsnow Community</p>
            <h2 className="mt-6 max-w-xl text-3xl font-black leading-tight tracking-tight text-metal sm:text-5xl">The story is better <span className="text-fire">together.</span></h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-steel">Go behind the scenes, catch the latest studio updates, and share your thoughts with the people who believe in Basotho stories.</p>
            <div className="mt-8 flex flex-wrap gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-silver-2">
              <span className="rounded-full border border-white/10 px-4 py-2">Studio updates</span><span className="rounded-full border border-white/10 px-4 py-2">Behind the scenes</span><span className="rounded-full border border-white/10 px-4 py-2">Conversations</span>
            </div>
            <Link href="/community" className="btn btn-primary mt-9">Explore the community <span aria-hidden>→</span></Link>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-white/10 bg-black">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24"><SonyShowcase compact /></div>
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
                <div className="group/value h-full">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg border border-white/12 bg-gradient-to-b from-white/8 to-transparent">
                    <ValueIcon value={v.title} />
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

      <section id="support" className="relative scroll-mt-16 overflow-hidden border-y border-white/10 bg-[#0c0908]">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_50%,rgba(255,69,0,0.16),transparent_49%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <Reveal>
            <div className="relative z-10">
              <p className="eyebrow flex items-center gap-3"><span className="rule-fire" /> Support Oxsnow</p>
              <h2 className="mt-7 max-w-2xl text-4xl font-black leading-[1.02] tracking-tight text-metal sm:text-6xl xl:text-7xl">Keep the stories <span className="text-fire">alive.</span></h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-silver-2">Every story begins with someone who believes in it. Stand with the filmmakers preserving our heritage and bringing Basotho stories to the world.</p>
              <div className="mt-9 flex flex-wrap items-center gap-5"><SupportPanel /><span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ash">Online giving coming soon</span></div>
              <div className="mt-12 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 sm:gap-6">
                {["Our culture", "Our filmmakers", "Our future"].map((label, i) => <div key={label}><span className="text-[0.6rem] font-semibold tracking-[0.22em] text-ember">0{i + 1}</span><p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-silver-2 sm:text-xs sm:tracking-[0.16em]">{label}</p></div>)}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="relative mx-auto flex min-h-[300px] max-w-[520px] items-center justify-center py-6 sm:min-h-[420px]" aria-label="Films from the Oxsnow slate">
              <div aria-hidden className="absolute inset-0 rounded-full bg-ember/10 blur-[80px]" />
              <div className="relative z-0 -mr-7 w-[38%] -rotate-[9deg] overflow-hidden rounded-md border border-white/15 shadow-2xl sm:-mr-10"><Image src="/posters/ho-lekane.jpg" alt="Ho Lekane film poster" width={784} height={1184} sizes="(max-width: 640px) 32vw, 190px" className="h-auto w-full" /></div>
              <div className="relative z-10 w-[43%] -translate-y-3 overflow-hidden rounded-md border border-white/25 shadow-[0_25px_80px_rgba(0,0,0,0.8)]"><Image src="/posters/molamu.jpg" alt="Molamu film poster" width={848} height={1216} sizes="(max-width: 640px) 37vw, 220px" className="h-auto w-full" /></div>
              <div className="relative z-0 -ml-7 w-[38%] rotate-[9deg] overflow-hidden rounded-md border border-white/15 shadow-2xl sm:-ml-10"><Image src="/posters/phirimana.jpg" alt="Phirimana film poster" width={904} height={1280} sizes="(max-width: 640px) 32vw, 190px" className="h-auto w-full" /></div>
              <div aria-hidden className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0c0908] to-transparent" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <CulturalPass films={films.filter((film) => film.status === "Available" && film.cover).slice(0, 5)} />
        </Reveal>
      </section>
    </>
  );
}
