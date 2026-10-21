"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useWatch } from "@/components/watch/WatchProvider";
import { useWatchlist } from "@/components/watch/WatchlistProvider";

const BUYER_KEY = "oxsnow-buyer-uid";

function getBuyerKey() {
  try {
    let key = localStorage.getItem(BUYER_KEY);
    if (!key) {
      key =
        (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
        `b-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(BUYER_KEY, key);
    }
    return key;
  } catch {
    return "anonymous";
  }
}

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-white/15 bg-ink px-4 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember";

function paidLabel(ts) {
  try {
    return new Date(ts).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function AccountPage() {
  const [mode, setMode] = useState("login"); // login | register
  const [authed, setAuthed] = useState(null); // null = loading
  const [customer, setCustomer] = useState(null);
  const [entitlements, setEntitlements] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { open } = useWatch();
  const watchlist = useWatchlist();

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/account");
      const data = await r.json();
      if (data.ok && data.authed) {
        setAuthed(true);
        setCustomer(data.customer);
        setEntitlements(data.entitlements || []);
      } else {
        setAuthed(false);
      }
    } catch {
      setAuthed(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          name: form.name,
          email: form.email,
          password: form.password,
          deviceKey: getBuyerKey(),
        }),
      });
      const data = await r.json().catch(() => ({ ok: false }));
      if (!r.ok || !data.ok) throw new Error(data.error || "Failed");
      setForm({ name: "", email: "", password: "" });
      await load();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/account", { method: "DELETE" });
    setAuthed(false);
    setCustomer(null);
    setEntitlements([]);
  }

  // Film metadata for entitlement rows (titles we know about)
  const FILM_META = {
    "Ho Lekane": { meta: "Documentary · 2026", poster: "/posters/ho-lekane.jpg", src: "/trailers/ho-lekane-trailer.mp4", teaser: "/trailers/ho-lekane-trailer.mp4" },
    "Lehlaba-phieo": { meta: "Tragedy · 2026", poster: "/posters/lehlaba-phieo.jpg", src: "/trailers/lehlaba-phieo-trailer.mp4", teaser: "/trailers/lehlaba-phieo-trailer.mp4" },
    "Phirimana": { meta: "Horror · 2025", poster: "/posters/phirimana.jpg", src: "/trailers/phirimana trailer.mp4", teaser: "/trailers/phirimana trailer.mp4" },
    "Konono": { meta: "Action-Drama · 2024", poster: "/posters/konono.jpg" },
  };

  const films = entitlements.filter((e) => e.movie_id !== "__cultural_pass__");
  const pass = entitlements.find((e) => e.movie_id === "__cultural_pass__");

  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-3">
            <span className="rule-fire" />
            My Account
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-metal sm:text-5xl">
            Your films, everywhere.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-steel">
            Sign in to carry rentals across devices — purchases made before you
            created the account are adopted automatically.
          </p>
        </div>
        {authed && (
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/12 px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-steel transition-colors hover:border-red-500/50 hover:text-red-300"
          >
            Sign out
          </button>
        )}
      </div>

      {authed === null ? (
        <div className="card mt-14 grid place-items-center gap-3 px-8 py-20 text-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-ember" />
          <p className="text-xs uppercase tracking-[0.24em] text-ash">
            Checking your session…
          </p>
        </div>
      ) : authed === false ? (
        <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-metal">
              {mode === "login" ? "Welcome back." : "Create your account."}
            </h2>
            <div className="rule-fire mt-5" />
            <ul className="mt-7 space-y-3">
              {[
                "Rentals follow your account, not your device",
                "One sign-in across phone, laptop and TV browser",
                "Device purchases are adopted on sign-in",
                "Cultural Pass status visible at a glance",
              ].map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-silver-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                  {perk}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[0.7rem] leading-relaxed text-ash">
              No account yet works too — rentals are keyed to this device until
              you sign in. An account just makes them portable.
            </p>
          </div>

          <form onSubmit={submit} className="card space-y-5 p-7 sm:p-8">
            <div className="flex gap-2">
              {["login", "register"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`cursor-pointer rounded-full border px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors ${
                    mode === m
                      ? "border-ember bg-ember/10 text-white"
                      : "border-white/12 text-steel hover:border-white/25"
                  }`}
                >
                  {m === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            {mode === "register" && (
              <label className="block">
                <span className="eyebrow">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </label>
            )}
            <label className="block">
              <span className="eyebrow">Email</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="eyebrow">Password</span>
              <input
                required
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
                minLength={8}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
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
              {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-14 space-y-12">
          {/* Identity card */}
          <div className="card flex flex-wrap items-center gap-5 p-7">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-ember/50 bg-ember/10 text-lg font-black text-ember">
              {(customer?.name || customer?.email || "?").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold text-white">
                {customer?.name || "Oxsnow viewer"}
              </p>
              <p className="truncate text-sm text-steel">{customer?.email}</p>
            </div>
            <div className="ml-auto flex gap-6 text-center">
              <div>
                <p className="text-2xl font-black text-metal">{films.length}</p>
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-ash">
                  Films
                </p>
              </div>
              <div>
                <p className={`text-2xl font-black ${pass ? "text-fire" : "text-steel"}`}>
                  {pass ? "Active" : "—"}
                </p>
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-ash">
                  Cultural Pass
                </p>
              </div>
            </div>
          </div>

          {/* Owned films */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-metal">
              Unlocked films
            </h2>
            {films.length === 0 ? (
              <div className="card mt-6 flex flex-col items-center gap-4 px-8 py-14 text-center">
                <p className="max-w-md text-sm leading-relaxed text-steel">
                  Nothing unlocked yet. Rent a film on the VOD storefront and it
                  appears here — on every device you sign into.
                </p>
                <Link href="/vod" className="btn btn-primary">
                  Browse the Storefront
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {films.map((ent) => {
                    const meta = FILM_META[ent.movie_id] || {};
                    return (
                      <motion.article
                        key={ent.movie_id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          open({
                            title: ent.movie_id,
                            meta: meta.meta,
                            poster: meta.poster,
                            src: meta.src,
                            teaser: meta.teaser,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            open({
                              title: ent.movie_id,
                              meta: meta.meta,
                              poster: meta.poster,
                              src: meta.src,
                              teaser: meta.teaser,
                            });
                          }
                        }}
                        className="card group flex cursor-pointer items-center gap-4 p-4"
                      >
                        {meta.poster && (
                          <img
                            src={meta.poster}
                            alt=""
                            className="h-24 w-16 shrink-0 rounded-md object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold text-white transition-colors group-hover:text-ember">
                            {ent.movie_id}
                          </h3>
                          {meta.meta && (
                            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-ash">
                              {meta.meta}
                            </p>
                          )}
                          <p className="mt-2 text-[0.7rem] text-steel">
                            Owned since {paidLabel(ent.paid_at)}
                          </p>
                          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-silver-2 transition-colors group-hover:text-ember">
                            Watch now →
                          </p>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Watchlist shortcut */}
          {watchlist.count > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-ink-2/50 px-6 py-5">
              <p className="text-sm text-steel">
                <span className="font-bold text-silver-2">{watchlist.count}</span>{" "}
                {watchlist.count === 1 ? "title" : "titles"} saved on this device.
              </p>
              <Link
                href="/watchlist"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-silver-2 transition-colors hover:text-ember"
              >
                Open watchlist →
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
