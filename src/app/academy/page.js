import Reveal from "@/components/Reveal";
import { academy } from "@/lib/site";
import AcademyForm from "./AcademyForm";

export const metadata = {
  title: "Academy",
  description:
    "The Oxsnow Academy — a 12-week hands-on film pipeline in Lesotho. Train on live productions, leave with a real screen credit.",
};

export default function AcademyPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow flex items-center gap-3">
          <span className="rule-fire" />
          {academy.eyebrow}
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-metal sm:text-6xl">
          {academy.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel">
          {academy.intro}
        </p>
      </Reveal>

      {/* ============================ FACTS BAND ============================ */}
      <Reveal delay={0.1}>
        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-3">
          {[
            { label: "Duration", value: academy.duration },
            { label: "Intake Size", value: academy.intake },
            { label: "Cost", value: academy.cost },
          ].map((f) => (
            <div key={f.label} className="bg-ink-2 px-6 py-8 text-center">
              <p className="text-[0.6rem] uppercase tracking-[0.28em] text-ash">
                {f.label}
              </p>
              <p className="mt-2 text-lg font-bold text-metal">{f.value}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ============================ TRACKS ============================ */}
      <div className="mt-24">
        <Reveal>
          <p className="eyebrow">Four Tracks · One Slate</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-metal sm:text-4xl">
            Train across the whole pipeline.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {academy.tracks.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08}>
              <div className="card h-full p-6">
                <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/12 bg-gradient-to-b from-white/8 to-transparent">
                  <span className="h-2 w-2 rounded-full bg-ember shadow-[0_0_12px_3px_rgba(255,69,0,0.5)]" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel">{t.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ============================ HOW IT WORKS ============================ */}
      <div className="mt-24 border-y border-white/10 bg-ink-2/40">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
          <Reveal>
            <p className="eyebrow">The Pipeline</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-metal sm:text-4xl">
              From application to credit.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {academy.steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.08}>
                <div className="relative">
                  <span className="text-5xl font-black text-white/8">{s.step}</span>
                  <h3 className="mt-2 text-xl font-bold text-white">{s.title}</h3>
                  <div className="rule-fire mt-4" />
                  <p className="mt-4 text-sm leading-relaxed text-steel">{s.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ============================ APPLY ============================ */}
      <div className="mt-24 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal>
          <p className="eyebrow">Intake I — Applications Open</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-metal sm:text-4xl">
            No degree. No gear.
            <br />
            No experience.
          </h2>
          <div className="rule-fire mt-6" />
          <p className="mt-6 max-w-md text-sm leading-relaxed text-steel">
            We take twenty-four people per intake and we read every application
            by hand. Tell us who you are and why you want this — the rest we&apos;ll
            teach you on set.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "12 weeks, hands-on on live Oxsnow productions",
              "Mentored by the crews making the slate",
              "Leave with a real screen credit",
              "Free for the first intake — sponsored places",
            ].map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-sm text-silver-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                {perk}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <AcademyForm />
        </Reveal>
      </div>
    </section>
  );
}
