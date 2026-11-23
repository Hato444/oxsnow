import Link from "next/link";
import Reveal from "@/components/Reveal";
import { events, pastEvents } from "@/lib/site";
import EventsExplorer from "./EventsExplorer";
import EventsFeed from "./EventsFeed";

export const metadata = {
  title: "Events",
  description: "Premieres, community screenings, workshops and Academy sessions from Oxsnow Studio — Maseru and across Lesotho.",
};

export default function EventsPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow flex items-center gap-3"><span className="rule-fire" />Events &amp; Marketing</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-metal sm:text-6xl">Where the stories meet the crowd.</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel">Premieres, open-air community screenings, workshops and Academy intakes. Find the next Oxsnow room — then walk into it.</p>
      </Reveal>
      <EventsExplorer events={events} archive={pastEvents} />
      <EventsFeed />
      <Reveal delay={0.1}>
        <div className="card relative mt-20 overflow-hidden px-8 py-14 text-center sm:px-16">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_120%_at_50%_130%,rgba(255,69,0,0.18),transparent_60%)]" />
          <div className="relative">
            <p className="eyebrow">Host Oxsnow</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight text-metal sm:text-4xl">Bring a premiere to your town, school or broadcaster.</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/contact" className="btn btn-primary">Partner on an Event</Link><Link href="/academy" className="btn btn-ghost">Join the Academy</Link></div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
