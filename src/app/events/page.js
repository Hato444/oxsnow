import Link from "next/link";
import Reveal from "@/components/Reveal";
import { events, pastEvents } from "@/lib/site";

export const metadata = {
  title: "Events",
  description:
    "Premieres, community screenings, workshops and Academy sessions from Oxsnow Studio — Maseru and across Lesotho.",
};

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function dateParts(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: MONTHS[d.getMonth()],
    year: d.getFullYear(),
    full: d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

const TYPE_ACCENT = {
  Premiere: "text-ember",
  Screening: "text-silver-2",
  Academy: "text-amber",
  Workshop: "text-steel",
};

export default function EventsPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow flex items-center gap-3">
          <span className="rule-fire" />
          Events &amp; Marketing
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-metal sm:text-6xl">
          Where the stories meet the crowd.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel">
          Premieres, open-air community screenings, workshops and Academy
          intakes. Find the next Oxsnow room — then walk into it.
        </p>
      </Reveal>

      {/* ============================ UPCOMING ============================ */}
      <div className="mt-20">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-metal sm:text-3xl">
              Upcoming
            </h2>
            <span className="text-[0.65rem] uppercase tracking-[0.24em] text-ash">
              {events.length} on the calendar
            </span>
          </div>
        </Reveal>

        <div className="mt-8 space-y-6">
          {events.map((event, i) => {
            const d = dateParts(event.date);
            return (
              <Reveal key={event.id} delay={i * 0.07}>
                <article className="card group relative overflow-hidden">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-ember/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[110px_1fr_auto] md:items-center">
                    {/* Date plate */}
                    <div className="flex items-center gap-4 md:block">
                      <div className="grid h-[92px] w-[92px] shrink-0 place-items-center rounded-xl border border-white/12 bg-gradient-to-b from-white/6 to-transparent">
                        <span className="text-3xl font-black leading-none text-metal">
                          {d.day}
                        </span>
                        <span className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-ember">
                          {d.month} {d.year}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span
                          className={`text-[0.6rem] font-bold uppercase tracking-[0.28em] ${
                            TYPE_ACCENT[event.type] || "text-steel"
                          }`}
                        >
                          {event.type}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-ash" />
                        <span className="text-[0.65rem] uppercase tracking-[0.18em] text-ash">
                          {event.online ? "Online" : event.city}
                        </span>
                      </div>
                      <h3 className="mt-2 text-xl font-bold text-white transition-colors group-hover:text-ember">
                        {event.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel">
                        {event.copy}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.7rem] text-ash">
                        <span>{d.full}</span>
                        {!event.online && <span>· {event.venue}</span>}
                        <span>· {event.time}</span>
                      </div>
                    </div>

                    {/* CTA rail */}
                    <div className="flex flex-row items-center gap-4 md:flex-col md:items-end md:justify-center md:gap-2">
                      <span className="whitespace-nowrap rounded-full border border-white/12 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-silver-2">
                        {event.price}
                      </span>
                      <span className="hidden text-[0.6rem] uppercase tracking-[0.18em] text-ash md:block">
                        {event.seats}
                      </span>
                      <Link
                        href="/contact"
                        className="btn btn-ghost !py-2.5 !text-[0.7rem]"
                      >
                        {event.cta}
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* ============================ PAST ARCHIVE ============================ */}
      <div className="mt-24">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-metal sm:text-3xl">
              Past Events
            </h2>
            <span className="text-[0.65rem] uppercase tracking-[0.24em] text-ash">
              Archive
            </span>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {pastEvents.map((event, i) => (
            <Reveal key={event.title} delay={i * 0.08}>
              <div className="card h-full p-6">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.28em] text-ash">
                  {new Date(`${event.date}T12:00:00`).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mt-3 text-lg font-bold text-white">{event.title}</h3>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-ash">
                  {event.venue}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-steel">{event.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ============================ CTA ============================ */}
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
            <p className="eyebrow">Host Oxsnow</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight text-metal sm:text-4xl">
              Bring a premiere to your town, school or broadcaster.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn btn-primary">
                Partner on an Event
              </Link>
              <Link href="/academy" className="btn btn-ghost">
                Join the Academy
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
