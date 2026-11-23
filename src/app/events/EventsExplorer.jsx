"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const filters = ["All Events", "Premieres", "Screenings", "Academy", "Workshops", "Past Events"];
const typeFor = (event) => event.type || (/workshop/i.test(event.title) ? "Workshop" : /screening/i.test(event.title) ? "Screening" : "Archive");
const eventKey = (event) => event.id || event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const matches = { Premieres: "Premiere", Screenings: "Screening", Academy: "Academy", Workshops: "Workshop" };

function todayInLesotho() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Maseru", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (name) => parts.find((item) => item.type === name).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00Z`));
}

function calendarLink(event) {
  const start = event.time
    ? new Date(`${event.date}T${event.time}:00+02:00`).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
    : event.date.replace(/-/g, "");
  const escape = (value) => String(value || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Oxsnow Studio//Events//EN", "BEGIN:VEVENT", `UID:${escape(event.id || event.title)}@oxsnow`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`, `${event.time ? "DTSTART" : "DTSTART;VALUE=DATE"}:${start}`, `SUMMARY:${escape(event.title)}`, `DESCRIPTION:${escape(event.copy)}`, `LOCATION:${escape(event.venue)}`, "END:VEVENT", "END:VCALENDAR"];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}

function EventArtwork({ event, featured = false }) {
  const artwork = /molamu/i.test(event.title) ? "/posters/molamu.jpg" : null;
  return (
    <div aria-hidden="true" className={`relative overflow-hidden bg-[#171310] ${featured ? "min-h-56 sm:min-h-80" : "min-h-36"}`}>
      {artwork ? <Image src={artwork} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover object-center opacity-60 transition-transform duration-700 group-hover:scale-[1.02] motion-reduce:transition-none" /> : <div className="absolute inset-0 bg-[linear-gradient(135deg,#221915,#101010_60%,#1b1b1b)]" />}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-transparent to-black/30" />
      <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
        <span className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-silver-2">{artwork ? "From the film · Molamu" : "Oxsnow Studio · Events"}</span>
        <span className="text-3xl font-black tracking-tight text-white/30">{event.date.slice(8, 10)}<span className="text-ember">.</span></span>
      </div>
    </div>
  );
}

export default function EventsExplorer({ events, archive }) {
  const [today, setToday] = useState(null);
  const [filter, setFilter] = useState("All Events");
  const [selected, setSelected] = useState(null);
  const [shareMessage, setShareMessage] = useState("");
  const dialog = useRef(null);
  const returnFocus = useRef(null);

  useEffect(() => {
    const update = () => setToday(todayInLesotho());
    const initial = setTimeout(update, 0);
    const timer = setInterval(update, 60000);
    return () => { clearTimeout(initial); clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [selected]);

  useEffect(() => {
    if (!today) return;
    const key = new URLSearchParams(window.location.search).get("event");
    const event = [...events, ...archive].find((item) => eventKey(item) === key);
    if (!event) return;
    const timer = setTimeout(() => {
      setSelected({ ...event, isPast: event.date < today });
      if (!dialog.current?.open) dialog.current?.showModal();
    }, 0);
    return () => clearTimeout(timer);
  }, [today, events, archive]);

  const openDetails = (event, isPast, trigger) => {
    setShareMessage("");
    returnFocus.current = trigger;
    setSelected({ ...event, isPast });
    dialog.current?.showModal();
  };
  const upcoming = today ? events.filter((event) => event.date >= today).sort((a, b) => a.date.localeCompare(b.date)) : [];
  const past = today ? [...events.filter((event) => event.date < today), ...archive].sort((a, b) => b.date.localeCompare(a.date)) : [];
  const listed = filter === "Past Events" ? past : filter === "All Events" ? upcoming : upcoming.filter((event) => typeFor(event) === matches[filter]);
  const featured = filter === "All Events" ? listed[0] : null;
  const cards = featured ? listed.slice(1) : listed;

  async function share(event) {
    const url = `${window.location.origin}/events?event=${encodeURIComponent(eventKey(event))}`;
    try {
      if (navigator.share) await navigator.share({ title: event.title, text: `${event.title} — ${formatDate(event.date)}`, url });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(`${event.title} — ${formatDate(event.date)}\n${url}`); setShareMessage("Event details copied."); }
      else setShareMessage("Copy this page address to share the event.");
    } catch (error) { if (error.name !== "AbortError") setShareMessage("Could not share. Copy the page address instead."); }
  }

  const card = (event, isPast = false) => (
    <article key={event.id || event.title} className="card group flex h-full min-w-0 flex-col overflow-hidden">
      <EventArtwork event={event} />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-ember">{typeFor(event)} <span className="text-ash">/ {isPast ? "Past event" : formatDate(event.date)}</span></p>
        <h3 className="mt-3 text-xl font-bold text-white">{event.title}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">{event.copy}</p>
        <p className="mt-5 text-xs leading-relaxed text-silver-2">{event.online ? "Online" : event.venue}{event.time ? ` · ${event.time}` : ""}{event.price ? ` · ${event.price}` : ""}</p>
        <button type="button" onClick={(e) => openDetails(event, isPast, e.currentTarget)} className="mt-5 self-start text-xs font-bold uppercase tracking-[0.15em] text-silver-2 transition-colors hover:text-ember focus-visible:outline-2 focus-visible:outline-ember">View details <span aria-hidden="true">→</span></button>
      </div>
    </article>
  );

  return (
    <div className="mt-16">
      <div className="flex flex-wrap gap-2" aria-label="Filter events">
        {filters.map((name) => <button key={name} type="button" aria-pressed={filter === name} onClick={() => setFilter(name)} className={`rounded-full border px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-ember motion-reduce:transition-none ${filter === name ? "border-ember/70 bg-ember/10 text-white" : "border-white/15 text-silver-2 hover:border-white/40"}`}>{name}</button>)}
      </div>
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{filter === "Past Events" ? "The archive" : "On the calendar"}</p><h2 className="mt-3 text-2xl font-bold tracking-tight text-metal sm:text-3xl">{filter === "Past Events" ? "Past Events" : "Upcoming"}</h2></div><span className="text-[0.65rem] uppercase tracking-[0.18em] text-ash">{today ? `${listed.length} ${listed.length === 1 ? "event" : "events"}` : "Checking dates…"}</span></div>
      {featured && <article className="card group mt-7 grid overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
        <EventArtwork event={featured} featured />
        <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.26em] text-ember">Featured · {typeFor(featured)}</p>
          <h3 className="mt-4 text-2xl font-black leading-tight text-white sm:text-4xl">{featured.title}</h3>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-silver-2">{featured.copy}</p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-silver-2"><span>{formatDate(featured.date)} · {featured.time}</span><span>{featured.online ? "Online" : featured.venue}</span><span>{featured.price}</span></div>
          <p className="mt-3 text-xs text-steel">Listed: {featured.seats}. Availability is not tracked online.</p>
          <button type="button" onClick={(e) => openDetails(featured, false, e.currentTarget)} className="btn btn-primary mt-7 self-start">Explore event <span aria-hidden="true">→</span></button>
        </div>
      </article>}
      {cards.length > 0 && <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{cards.map((event) => card(event, filter === "Past Events"))}</div>}
      {today && listed.length === 0 && <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-sm text-silver-2">No {filter === "Past Events" ? "past" : "upcoming"} events in this selection. Check back for studio updates.</div>}
      {filter === "All Events" && past.length > 0 && <button type="button" onClick={() => setFilter("Past Events")} className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-silver-2 hover:text-ember">Explore {past.length} past events →</button>}

      <dialog ref={dialog} aria-labelledby="event-detail-title" onClose={() => { setSelected(null); returnFocus.current?.focus(); returnFocus.current = null; }} className="m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-y-auto border-0 bg-ink-2 p-0 text-silver backdrop:bg-black/85 sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:w-[min(92vw,680px)] sm:rounded-2xl sm:border sm:border-white/15">
        {selected && <div className="relative px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:p-9">
          <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">{typeFor(selected)} · {selected.isPast ? "Past event" : "Event details"}</p><h2 id="event-detail-title" className="mt-3 text-2xl font-black text-metal sm:text-3xl">{selected.title}</h2></div><button type="button" onClick={() => dialog.current?.close()} aria-label="Close event details" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 text-xl text-silver-2 hover:border-ember hover:text-white focus-visible:outline-2 focus-visible:outline-ember">×</button></div>
          <p className="mt-6 text-sm leading-relaxed text-silver-2">{selected.copy}</p>
          <dl className="mt-6 grid gap-4 border-y border-white/10 py-6 text-sm sm:grid-cols-2"><div><dt className="text-xs text-steel">Date &amp; time</dt><dd className="mt-1 text-white">{formatDate(selected.date)}{selected.time ? ` · ${selected.time} (Lesotho time)` : ""}</dd></div><div><dt className="text-xs text-steel">Location</dt><dd className="mt-1 text-white">{selected.venue || "Not specified"}</dd></div>{selected.price && <div><dt className="text-xs text-steel">Admission</dt><dd className="mt-1 text-white">{selected.price}</dd></div>}{selected.seats && <div><dt className="text-xs text-steel">Listed capacity / seating</dt><dd className="mt-1 text-white">{selected.seats}</dd></div>}</dl>
          {!selected.isPast && <><p className="mt-5 text-xs leading-relaxed text-steel">Availability is not tracked online. Contact the studio to ask about this event; submitting an enquiry does not reserve a place.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/contact" onClick={() => dialog.current?.close()} className="btn btn-primary">{selected.cta || "Contact the studio"}</Link><a href={calendarLink(selected)} download="oxsnow-event.ics" className="btn btn-ghost">Add to calendar</a></div></>}
          <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-silver-2"><button type="button" onClick={() => share(selected)} className="hover:text-ember">Share event ↗</button>{!selected.online && selected.venue && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.venue}${selected.city ? `, ${selected.city}` : ""}`)}`} target="_blank" rel="noopener noreferrer" className="hover:text-ember">Find location ↗</a>}</div><p role="status" className="mt-3 text-xs text-steel">{shareMessage}</p>
        </div>}
      </dialog>
    </div>
  );
}
