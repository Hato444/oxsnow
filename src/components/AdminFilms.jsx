"use client";

import { useEffect, useState } from "react";

const fields = [
  ["title", "Title"], ["description", "Short description"], ["synopsis", "Synopsis"],
  ["genre", "Genre"], ["category", "Category"], ["year", "Release year"],
  ["runtime", "Runtime"], ["director", "Director"], ["productionCompany", "Production company"],
  ["cast", "Cast"], ["language", "Language"], ["country", "Country"],
  ["rating", "Age rating"], ["price", "Proposed rental price"], ["duration", "Proposed access duration"],
  ["trailerUrl", "Trailer URL"], ["releaseDate", "Release date"],
];
const collections = ["New Releases", "Basotho History Archive", "Diaspora Favorites"];
const input = "mt-2 w-full rounded-lg border border-white/15 bg-ink px-4 py-3 text-sm text-silver outline-none focus:border-ember";

export default function AdminFilms() {
  const [films, setFilms] = useState([]);
  const [form, setForm] = useState({ collections: [] });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/admin/films", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFilms(data.films);
    } catch (error) { setMessage(error.message || "Could not load drafts."); }
  }
  useEffect(() => { const timer = setTimeout(load, 0); return () => clearTimeout(timer); }, []);

  async function save(event) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/admin/films", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((previous) => ({ ...previous, id: data.id }));
      setMessage("Draft saved. It is not published or available for rental.");
      await load();
    } catch (error) { setMessage(error.message || "Could not save draft."); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-bold text-metal">Film drafts</h2>
        <p className="mt-2 text-sm leading-relaxed text-steel">Save film information privately. Media uploads and publishing will be available after protected streaming is configured. Proposed prices and durations do not change existing rental rules.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => { setForm({ collections: [] }); setMessage(""); }}>New draft</button>
          {films.map((film) => <button type="button" key={film.id} className="btn btn-ghost" onClick={() => { setForm(film); setMessage(""); }}>{film.title}</button>)}
        </div>
      </div>
      <form onSubmit={save} className="card space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([key, label]) => (
            <label key={key} className="block text-xs font-semibold text-silver-2">
              {label}{key === "title" && " *"}
              {key === "synopsis" ? <textarea className={input} rows={3} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /> : <input className={input} required={key === "title"} type={key === "releaseDate" ? "date" : "text"} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />}
            </label>
          ))}
        </div>
        <fieldset><legend className="text-xs font-semibold text-silver-2">Collections</legend><div className="mt-2 flex flex-wrap gap-4">{collections.map((name) => <label key={name} className="flex items-center gap-2 text-sm text-steel"><input type="checkbox" checked={(form.collections || []).includes(name)} onChange={(e) => setForm({ ...form, collections: e.target.checked ? [...(form.collections || []), name] : form.collections.filter((entry) => entry !== name) })} />{name}</label>)}</div></fieldset>
        <label className="flex items-center gap-2 text-sm text-steel"><input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />Featured</label>
        {message && <p role="status" className="text-sm text-silver-2">{message}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary disabled:opacity-50">{busy ? "Saving…" : "Save draft"}</button>
      </form>
    </div>
  );
}
