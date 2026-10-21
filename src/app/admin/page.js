"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function timeLabel(ts) {
  try {
    return new Date(Number(ts)).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function money(minor, currency = "LSL") {
  return `${currency === "LSL" ? "M " : ""}${(Number(minor || 0) / 100).toFixed(2)}`;
}

const STATUS_STYLES = {
  paid: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  pending: "border-ember/40 bg-ember/5 text-silver-2",
  awaiting_authorisation: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  failed: "border-red-500/40 bg-red-500/10 text-red-300",
  cancelled: "border-red-500/40 bg-red-500/10 text-red-300",
  expired: "border-white/15 bg-white/[0.03] text-ash",
};

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-white/15 bg-ink px-4 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember";

function Stat({ label, value, fire = false }) {
  return (
    <div className="bg-ink-2 px-6 py-7 text-center">
      <p className={`text-3xl font-black tracking-tight ${fire ? "text-fire" : "text-metal"}`}>
        {value}
      </p>
      <p className="mt-2 text-[0.6rem] uppercase tracking-[0.28em] text-ash">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview");

  const check = useCallback(async () => {
    try {
      const r = await fetch("/api/community?device=admin-check");
      const d = await r.json();
      setAuthed(Boolean(d.founder));
      if (d.founder) {
        const res = await fetch("/api/admin");
        const overview = await res.json();
        if (overview.ok) setData(overview);
      }
    } catch {
      setAuthed(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(check, 0);
    return () => clearTimeout(t);
  }, [check]);

  async function login(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const d = await r.json().catch(() => ({ ok: false }));
      if (!r.ok || !d.ok) throw new Error(d.error || "Sign-in failed");
      setAuthed(true);
      setPassword("");
      const res = await fetch("/api/admin");
      const overview = await res.json();
      if (overview.ok) setData(overview);
    } catch (err) {
      setError(err.message || "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthed(false);
    setData(null);
  }

  async function refresh() {
    const res = await fetch("/api/admin");
    const overview = await res.json();
    if (overview.ok) setData(overview);
  }

  if (authed === null) {
    return (
      <section className="mx-auto grid w-full max-w-5xl place-items-center px-5 pb-24 pt-40 sm:px-8">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-ember" />
      </section>
    );
  }

  if (authed === false) {
    return (
      <section className="mx-auto w-full max-w-md px-5 pb-24 pt-40 sm:px-8">
        <p className="eyebrow flex items-center gap-3">
          <span className="rule-fire" />
          Studio Admin
        </p>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-metal">
          Founder access only.
        </h1>
        <form onSubmit={login} className="card mt-8 space-y-5 p-7">
          <label className="block">
            <span className="eyebrow">Founder password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className={inputClass}
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="btn btn-primary w-full disabled:opacity-60"
          >
            {busy ? "Checking…" : "Enter Dashboard"}
          </button>
        </form>
      </section>
    );
  }

  const rev = data?.revenue || {};
  const orders = data?.orders || [];
  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: `Orders (${orders.length})` },
    { id: "academy", label: `Academy (${data?.academy?.length || 0})` },
    { id: "newsletter", label: `Newsletter (${data?.newsletter?.length || 0})` },
    { id: "audit", label: "Audit" },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-3">
            <span className="rule-fire" />
            Studio Admin · Founder
          </p>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-metal sm:text-4xl">
            Operations Dashboard
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={refresh}
            className="rounded-full border border-white/12 px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-steel transition-colors hover:border-ember hover:text-ember"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/12 px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-steel transition-colors hover:border-red-500/50 hover:text-red-300"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-scrollbar mt-10 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 cursor-pointer rounded-full border px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors ${
              tab === t.id
                ? "border-ember bg-ember/10 text-white"
                : "border-white/12 text-steel hover:border-white/25"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          {tab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-5">
                <Stat label="Revenue (paid)" value={money(rev.revenue_minor)} fire />
                <Stat label="Paid Orders" value={rev.paid_count || "0"} />
                <Stat label="Pending" value={rev.pending_count || "0"} />
                <Stat label="Failed / Cancelled" value={rev.failed_count || "0"} />
                <Stat label="Accounts" value={data?.customers?.total || "0"} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-metal">Entitlements by title</h2>
                  <p className="mt-1 text-[0.7rem] text-ash">
                    Who owns what — rentals plus active Cultural Passes.
                  </p>
                  <ul className="mt-5 space-y-3">
                    {(data?.entitlements || []).map((e) => (
                      <li
                        key={e.movie_id}
                        className="flex items-center justify-between border-b border-white/8 pb-3 text-sm last:border-0"
                      >
                        <span className={e.movie_id === "__cultural_pass__" ? "text-fire font-semibold" : "text-silver-2"}>
                          {e.movie_id === "__cultural_pass__" ? "Cultural Pass (active)" : e.movie_id}
                        </span>
                        <span className="font-bold text-metal">{e.holders}</span>
                      </li>
                    ))}
                    {(data?.entitlements || []).length === 0 && (
                      <li className="text-sm text-ash">No entitlements yet.</li>
                    )}
                  </ul>
                </div>

                <div className="card p-6">
                  <h2 className="text-lg font-bold text-metal">Latest payment events</h2>
                  <p className="mt-1 text-[0.7rem] text-ash">
                    Raw audit trail — newest first.
                  </p>
                  <ul className="mt-5 space-y-3">
                    {(data?.audit || []).slice(0, 10).map((a, i) => (
                      <li key={i} className="border-b border-white/8 pb-3 text-sm last:border-0">
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate font-semibold text-silver-2">
                            {a.event}
                          </span>
                          <span className="shrink-0 text-[0.65rem] text-ash">
                            {timeLabel(a.created_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[0.7rem] text-ash">
                          {a.order_id}
                          {a.detail ? ` · ${a.detail}` : ""}
                        </p>
                      </li>
                    ))}
                    {(data?.audit || []).length === 0 && (
                      <li className="text-sm text-ash">No events yet.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="card overflow-x-auto p-0">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[0.6rem] uppercase tracking-[0.2em] text-ash">
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Title</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-white/6 last:border-0 hover:bg-white/[0.02]">
                      <td className="max-w-[180px] truncate px-5 py-3.5 font-mono text-[0.7rem] text-ash">
                        {o.id}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-silver-2">
                        {o.movie_id === "__cultural_pass__" ? "Cultural Pass" : o.movie_id}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-metal">
                        {money(o.amount_minor, o.currency)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] ${
                            STATUS_STYLES[o.status] || "border-white/15 text-steel"
                          }`}
                        >
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-steel">
                        {o.phone ? `+266 ${o.phone}` : "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-ash">
                        {timeLabel(o.created_at)}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-ash">
                        No orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "academy" && (
            <div className="card overflow-x-auto p-0">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[0.6rem] uppercase tracking-[0.2em] text-ash">
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">District</th>
                    <th className="px-5 py-4">Track</th>
                    <th className="px-5 py-4">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.academy || []).map((a) => (
                    <tr key={a.id} className="border-b border-white/6 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5 font-semibold text-silver-2">{a.name}</td>
                      <td className="px-5 py-3.5">
                        <a href={`mailto:${a.email}`} className="block text-steel hover:text-ember">
                          {a.email}
                        </a>
                        <span className="text-[0.7rem] text-ash">{a.phone}</span>
                      </td>
                      <td className="px-5 py-3.5 text-steel">{a.district || "—"}</td>
                      <td className="px-5 py-3.5 text-steel">{a.track || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-ash">
                        {timeLabel(a.created_at)}
                      </td>
                    </tr>
                  ))}
                  {(!data?.academy || data.academy.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-ash">
                        No applications yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "newsletter" && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-metal">Newsletter subscribers</h2>
              <p className="mt-1 text-[0.7rem] text-ash">
                {data?.newsletter?.length || 0} emails — newest first.
              </p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(data?.newsletter || []).map((n) => (
                  <li
                    key={n.email}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3 text-sm"
                  >
                    <span className="truncate text-silver-2">{n.email}</span>
                    <span className="shrink-0 text-[0.65rem] text-ash">
                      {timeLabel(n.created_at)}
                    </span>
                  </li>
                ))}
                {(!data?.newsletter || data.newsletter.length === 0) && (
                  <li className="text-sm text-ash">No subscribers yet.</li>
                )}
              </ul>
            </div>
          )}

          {tab === "audit" && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-metal">Payment audit trail</h2>
              <p className="mt-1 text-[0.7rem] text-ash">
                Last 50 events across all orders — newest first.
              </p>
              <ul className="mt-5 space-y-2.5">
                {(data?.audit || []).map((a, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-white/8 pb-2.5 text-sm last:border-0"
                  >
                    <span className="font-mono text-[0.72rem] text-ash">{a.order_id}</span>
                    <span className="font-semibold text-silver-2">{a.event}</span>
                    <span className="text-[0.72rem] text-steel">{a.detail}</span>
                    <span className="ml-auto text-[0.65rem] text-ash">
                      {timeLabel(a.created_at)}
                    </span>
                  </li>
                ))}
                {(!data?.audit || data.audit.length === 0) && (
                  <li className="text-sm text-ash">No events yet.</li>
                )}
              </ul>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
