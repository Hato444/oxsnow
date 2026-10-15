import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { about, founders, values, vision } from "@/lib/site";

export const metadata = {
  title: "About",
  description:
    "Oxsnow Studio is an umbrella film studio in Lesotho — produced, broadcast, distributed and licensed from Maseru to the world.",
};

const facts = [
  { label: "Founded", value: "2023" },
  { label: "Founders", value: "3" },
  { label: "Registered", value: "Ministry of Trade" },
  { label: "Base", value: "Maseru, Lesotho" },
];

export default function AboutPage() {
  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-10 pt-36 sm:px-8">
        <Reveal>
          <p className="eyebrow flex items-center gap-3">
            <span className="rule-fire" />
            Who We Are
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-metal sm:text-6xl">
            The studio behind the fire
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-silver-2">
            Oxsnow Studio is an umbrella film company out of Maseru — producing,
            broadcasting, distributing and licensing Basotho stories for the
            world.
          </p>
        </Reveal>
      </section>

      {/* ============================ STORY ============================ */}
      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <div className="space-y-6">
            {about.story.map((para, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="text-base leading-relaxed text-steel first:text-lg first:text-silver-2">
                  {para}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="card relative overflow-hidden p-7">
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(120% 90% at 100% 0%, rgba(255,69,0,0.18), transparent 55%)",
                }}
              />
              <div className="relative">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-ember">
                  At a Glance
                </p>
                <dl className="mt-6 space-y-5">
                  {facts.map((f) => (
                    <div
                      key={f.label}
                      className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                    >
                      <dt className="text-[0.65rem] uppercase tracking-[0.24em] text-ash">
                        {f.label}
                      </dt>
                      <dd className="text-right text-sm font-semibold text-metal">
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ MISSION / VISION ============================ */}
      <section className="border-y border-white/10 bg-ink-2/40">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-20 sm:px-8 md:grid-cols-2">
          <Reveal>
            <div className="card h-full p-8">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-ember">
                Mission
              </span>
              <p className="mt-5 text-xl font-semibold leading-relaxed text-metal sm:text-2xl">
                {about.mission}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card h-full p-8">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-ember">
                Vision
              </span>
              <p className="mt-5 text-xl font-semibold leading-relaxed text-metal sm:text-2xl">
                {vision}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ FOUNDERS ============================ */}
      <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <p className="eyebrow flex items-center gap-3">
            <span className="rule-fire" />
            The Team
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-metal sm:text-4xl">
            Founders
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-steel">
            Three self-taught creatives building an industry from the ground up.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {founders.map((person, i) => (
            <Reveal key={person.name} delay={i * 0.08}>
              <article className="card group h-full overflow-hidden">
                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-ink-3 via-ink-2 to-black">
                  {person.photo ? (
                    <Image
                      src={person.photo}
                      alt={person.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <>
                      <div
                        className="absolute inset-0 opacity-70"
                        style={{
                          background:
                            "radial-gradient(120% 80% at 30% 0%, rgba(255,69,0,0.20), transparent 55%), radial-gradient(90% 80% at 100% 120%, rgba(192,192,192,0.10), transparent 60%)",
                        }}
                      />
                      {/* film-frame corner marks */}
                      <span className="absolute left-4 top-4 h-4 w-4 border-l border-t border-white/20" />
                      <span className="absolute right-4 top-4 h-4 w-4 border-r border-t border-white/20" />
                      <span className="absolute bottom-4 left-4 h-4 w-4 border-b border-l border-white/20" />
                      <span className="absolute bottom-4 right-4 h-4 w-4 border-b border-r border-white/20" />
                      <span className="absolute inset-0 grid place-items-center">
                        <span className="text-6xl font-black tracking-tight text-metal">
                          {person.initials}
                        </span>
                      </span>
                      <span className="absolute bottom-4 left-0 right-0 text-center text-[0.55rem] uppercase tracking-[0.3em] text-ash">
                        Photo coming soon
                      </span>
                    </>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white transition-colors group-hover:text-ember">
                    {person.name}
                  </h3>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-ember">
                    {person.role}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-steel">
                    {person.bio}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ PROBLEM / SOLUTIONS ============================ */}
      <section className="border-t border-white/10 bg-ink-2/30">
        <div className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="rule-fire" />
              Why We Exist
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-metal sm:text-4xl">
              The gap we&apos;re closing
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-white/10 bg-black/30 p-8">
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-ash">
                  The Problem
                </h3>
                <ul className="mt-6 space-y-4">
                  {about.problem.map((p) => (
                    <li key={p} className="flex gap-3 text-sm leading-relaxed text-steel">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ash" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="card relative h-full overflow-hidden p-8">
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background:
                      "radial-gradient(120% 90% at 100% 0%, rgba(255,69,0,0.20), transparent 55%)",
                  }}
                />
                <div className="relative">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">
                    Our Solutions
                  </h3>
                  <ul className="mt-6 space-y-4">
                    {about.solutions.map((s) => (
                      <li key={s} className="flex gap-3 text-sm leading-relaxed text-silver-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================ VALUES ============================ */}
      <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <p className="eyebrow">What We Stand For</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-metal sm:text-4xl">
            Values forged in fire &amp; steel
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
                <p className="mt-2 text-sm leading-relaxed text-steel">{v.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ CTA ============================ */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8">
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
              <p className="eyebrow">Let&apos;s Build It Together</p>
              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight text-metal sm:text-5xl">
                Own a piece of Basotho cinema.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-steel">
                Partner with the studio, license our catalogue, or join the slate
                as talent and crew.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="btn btn-primary">
                  Partner With Us
                </Link>
                <Link href="/films" className="btn btn-ghost">
                  Explore the Slate
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
