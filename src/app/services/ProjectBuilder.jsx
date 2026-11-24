"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { BRIEF_FIELDS } from "@/lib/services/brief.mjs";

export const SERVICE_CHOICES = [
  { id: "commercial", label: "Make a video or film" },
  { id: "broadcast", label: "License an existing film" },
  { id: "education", label: "Organize an educational screening" },
  { id: "studio", label: "Hire equipment or production services" },
  { id: "general", label: "I'm not sure yet" },
];

const input = "mt-2 w-full rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-base text-white outline-none placeholder:text-steel focus:border-ember sm:text-sm";

export default function ProjectBuilder({ selected, onSelect }) {
  const [drafts, setDrafts] = useState({});
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState({ name: "", email: "", phone: "", budget: "", timeline: "", website: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const details = drafts[selected] || {};
  const fields = BRIEF_FIELDS[selected];
  const choice = SERVICE_CHOICES.find((item) => item.id === selected);

  function setDetail(key, value) {
    setDrafts((current) => ({ ...current, [selected]: { ...current[selected], [key]: value } }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (step === 0) {
      if (!details.idea?.trim()) {
        setError("Please tell us a little about what you need.");
        return;
      }
      setStep(1);
      return;
    }
    if (status === "busy") return;
    setStatus("busy");
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: selected, details, ...contact }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Could not save your request.");
      setReference(result.reference);
      setStatus("sent");
    } catch (err) {
      setError(err.message || "Could not save your request.");
      setStatus("idle");
    }
  }

  return (
    <section id="project-builder" className="scroll-mt-24 bg-[#0c0c0d] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="eyebrow">Start a project</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-metal sm:text-5xl">Tell us what you have in mind.</h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-silver-2">Share your idea and contact details. The studio can review your request and get back to you to discuss the next step.</p>
        {status === "sent" ? (
          <div role="status" className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] p-8">
            <Check className="text-ember" aria-hidden="true" />
            <h3 className="mt-4 text-2xl font-bold text-white">Your request has been received.</h3>
            <p className="mt-3 text-sm text-silver-2">The studio can review your request and contact you. Reference: {reference}</p>
          </div>
        ) : (
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <p className="text-sm font-bold text-white">{step === 0 ? "Step 1 of 2: Your idea" : "Step 2 of 2: How to reach you"}</p>
              </div>
              {step === 0 ? (
                <>
                  <fieldset className="mt-6">
                    <legend className="text-lg font-bold text-white">What would you like us to help you with?</legend>
                    <div className="mt-4 grid gap-2">
                      {SERVICE_CHOICES.map((item) => (
                        <label key={item.id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm ${selected === item.id ? "border-ember bg-ember/10 text-white" : "border-white/15 text-silver-2 hover:border-white/40"}`}>
                          <input type="radio" name="service" value={item.id} checked={selected === item.id} onChange={() => { onSelect(item.id); setError(""); }} className="h-4 w-4 accent-[#e25822]" />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className="mt-6 block">
                    <span className="text-sm font-semibold text-white">Tell us about your idea <span className="text-ember">*</span></span>
                    <textarea required rows={4} maxLength={1500} value={details.idea || ""} onChange={(event) => setDetail("idea", event.target.value)} placeholder="For example: I need a short video to introduce my business." className={input} />
                  </label>
                  <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-silver-2">
                    <input type="checkbox" checked={details.recommend === "yes"} onChange={(event) => setDetail("recommend", event.target.checked ? "yes" : "no")} className="mt-1 h-4 w-4 accent-[#e25822]" />
                    I&apos;d like Oxsnow to recommend what I need.
                  </label>
                  {fields.length > 0 && (
                    <details className="mt-6 rounded-lg border border-white/10 p-4">
                      <summary className="cursor-pointer font-semibold text-white">Add more details <span className="font-normal text-steel">(optional)</span></summary>
                      <p className="mt-3 text-sm text-silver-2">Already know what you need? Add any details that apply.</p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {fields.map((field) => (
                          <label key={field.key} className={`block ${field.multiline ? "sm:col-span-2" : ""}`}>
                            <span className="text-sm font-semibold text-silver-2">{field.label}</span>
                            {field.multiline ? (
                              <textarea rows={3} maxLength={1500} className={input} placeholder={field.placeholder || "Optional"} value={details[field.key] || ""} onChange={(event) => setDetail(field.key, event.target.value)} />
                            ) : (
                              <input type={field.type || "text"} min={field.type === "number" ? 0 : undefined} maxLength={1500} className={input} placeholder={field.placeholder || "Optional"} value={details[field.key] || ""} onChange={(event) => setDetail(field.key, event.target.value)} />
                            )}
                          </label>
                        ))}
                      </div>
                    </details>
                  )}
                </>
              ) : (
                <div className="mt-6 space-y-4">
                  {[["name", "Your name", "text", true], ["email", "Email address", "email", true], ["phone", "Phone number (optional)", "tel", false], ["budget", "Estimated budget in maloti (optional)", "number", false], ["timeline", "When do you need this? (optional)", "text", false]].map(([key, label, type, required]) => (
                    <label key={key} className="block">
                      <span className="text-sm font-semibold text-silver-2">{label}</span>
                      <input required={required} type={type} min={type === "number" ? 0 : undefined} step={type === "number" ? "0.01" : undefined} placeholder={key === "budget" || key === "timeline" ? "Leave blank if you're not sure yet" : ""} className={input} value={contact[key]} onChange={(event) => setContact({ ...contact, [key]: event.target.value })} />
                    </label>
                  ))}
                  <input value={contact.website} onChange={(event) => setContact({ ...contact, website: event.target.value })} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                </div>
              )}
              {error && <p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                {step === 1 && <button type="button" className="btn btn-ghost" onClick={() => { setStep(0); setError(""); }}>Back</button>}
                <button type="submit" disabled={status === "busy"} className="btn btn-primary disabled:opacity-50">{status === "busy" ? "Sending…" : step === 0 ? "Continue" : "Send my request"} <ArrowUpRight size={16} aria-hidden="true" /></button>
              </div>
              <p className="mt-5 text-sm text-silver-2">Prefer a simple message? <Link href="/contact" className="font-semibold text-white underline underline-offset-4 hover:text-ember">Contact the studio</Link>.</p>
            </form>
            <aside className="rounded-2xl border border-white/10 bg-black/35 p-6 lg:sticky lg:top-28" aria-label="Your request summary">
              <p className="eyebrow">Your request</p>
              <h3 className="mt-5 text-lg font-bold text-white">{choice.label}</h3>
              <dl className="mt-5 space-y-4 border-t border-white/10 pt-5 text-sm">
                {details.idea ? <div><dt className="text-steel">Your idea</dt><dd className="mt-1 whitespace-pre-wrap break-words text-silver-2">{details.idea}</dd></div> : <p className="text-silver-2">Your idea will appear here as you write.</p>}
                {details.recommend === "yes" && <p className="text-silver-2">You&apos;d like the studio to make recommendations.</p>}
                {fields.filter((field) => details[field.key]?.trim()).map((field) => <div key={field.key}><dt className="text-steel">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-silver-2">{details[field.key]}</dd></div>)}
                {contact.budget && <div><dt className="text-steel">Estimated budget</dt><dd className="text-silver-2">M {contact.budget}</dd></div>}
                {contact.timeline && <div><dt className="text-steel">Timeline</dt><dd className="text-silver-2">{contact.timeline}</dd></div>}
              </dl>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
