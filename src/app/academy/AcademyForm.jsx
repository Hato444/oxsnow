"use client";

import { useState } from "react";

const tracks = [
  { id: "direction", label: "Directing & Story" },
  { id: "camera", label: "Camera & Lighting" },
  { id: "sound", label: "Sound & Post" },
  { id: "producing", label: "Producing & Production" },
];
const inputClass = "mt-2 h-12 w-full rounded-lg border border-white/15 bg-ink px-4 text-sm text-silver outline-none focus:border-ember";

export default function AcademyForm({ track, onTrackChange }) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", district: "", why: "", website: "" });
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (step === 0 && !track) return setError("Choose your preferred track.");
    if (step < 3) { setStep(step + 1); return; }
    setStatus("busy");
    try {
      const response = await fetch("/api/academy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, track }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Could not submit application.");
      setStatus("sent");
    } catch (err) { setError(err.message || "Please try again."); setStatus("idle"); }
  }

  if (status === "sent") return <div className="card p-8"><p className="eyebrow">Application submitted</p><h3 className="mt-4 text-2xl font-bold text-white">Thank you for applying.</h3><p className="mt-3 text-sm text-silver-2">Your application has been saved for the Academy team to review.</p></div>;

  return <form onSubmit={submit} className="card space-y-6 p-6 sm:p-8">
    <div><p className="eyebrow">Crew application · {String(step + 1).padStart(2, "0")} / 04</p><div className="mt-4 grid grid-cols-4 gap-2" aria-label={`Step ${step + 1} of 4`}>{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 rounded ${i <= step ? "bg-ember" : "bg-white/15"}`} />)}</div></div>
    {step === 0 && <div><h3 className="text-xl font-bold text-white">Choose your discipline.</h3><div className="mt-4 grid gap-2 sm:grid-cols-2">{tracks.map((item) => <button key={item.id} type="button" aria-pressed={track === item.id} onClick={() => onTrackChange(item.id)} className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${track === item.id ? "border-ember bg-ember/10 text-white" : "border-white/15 text-silver-2 hover:border-white/40"}`}>{item.label}</button>)}</div></div>}
    {step === 1 && <div><h3 className="text-xl font-bold text-white">Tell us about yourself.</h3><div className="mt-4 grid gap-4 sm:grid-cols-2">{[["name", "Full name", "text"], ["email", "Email", "email"], ["phone", "Phone", "tel"], ["district", "District", "text"]].map(([key, label, type]) => <label key={key} className="block"><span className="eyebrow">{label}</span><input required type={type} value={form[key]} onChange={set(key)} className={inputClass} /></label>)}</div></div>}
    {step === 2 && <label className="block"><span className="text-xl font-bold text-white">Why the Academy?</span><textarea required maxLength={2000} rows={6} value={form.why} onChange={set("why")} placeholder="Tell us why you want to join the crew." className="mt-4 w-full rounded-lg border border-white/15 bg-ink p-4 text-sm text-silver outline-none focus:border-ember" /></label>}
    {step === 3 && <div><h3 className="text-xl font-bold text-white">Review your application.</h3><dl className="mt-4 space-y-3 text-sm text-silver-2">{[["Discipline", tracks.find((item) => item.id === track)?.label], ["Name", form.name], ["Email", form.email], ["Phone", form.phone], ["District", form.district], ["Why the Academy", form.why]].map(([label, value]) => <div key={label} className="border-b border-white/10 pb-3"><dt className="text-xs uppercase tracking-wider text-ash">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{value}</dd></div>)}</dl></div>}
    <input type="text" value={form.website} onChange={set("website")} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    <div className="flex flex-wrap gap-3">{step > 0 && <button type="button" onClick={() => { setStep(step - 1); setError(""); }} className="btn btn-ghost">Back</button>}<button type="submit" disabled={status === "busy"} className="btn btn-primary flex-1 disabled:opacity-60">{status === "busy" ? "Submitting…" : step === 3 ? "Submit application" : "Continue"}</button></div>
  </form>;
}
