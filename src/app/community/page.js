"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { posters } from "@/lib/site";

const UID_KEY = "oxsnow-community-uid";
const NAME_KEY = "oxsnow-community-name";
const EMAIL_KEY = "oxsnow-community-email";

function getUid() {
  try {
    let uid = localStorage.getItem(UID_KEY);
    if (!uid) {
      uid =
        (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
        `u-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(UID_KEY, uid);
    }
    return uid;
  } catch {
    return "anon";
  }
}

function timeLabel(ts) {
  try {
    return new Date(ts).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({ ok: false }));
  if (!res.ok || !data.ok) throw new Error(data.error || "Request failed");
  return data;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [founder, setFounder] = useState(false);
  const [composer, setComposer] = useState(null);
  const [openComments, setOpenComments] = useState({});
  const [lightbox, setLightbox] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [feed, setFeed] = useState("community");

  const load = useCallback(async () => {
    try {
      const deviceId = getUid();
      const data = await api(
        `/api/community?device=${encodeURIComponent(deviceId)}&target=${feed}`
      );
      setPosts(data.posts);
      setFounder(data.founder);
    } catch (err) {
      console.error("[community] load failed", err);
    } finally {
      setLoading(false);
    }
  }, [feed]);

  useEffect(() => {
    // defer so setState inside load() never runs synchronously in the effect
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (lightbox) setLightbox(null);
      else if (menuFor) setMenuFor(null);
      else if (loginOpen) setLoginOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, menuFor, loginOpen]);

  const published = posts.filter((p) => p.published);
  const drafts = posts.filter((p) => !p.published);

  async function handleLogin(password) {
    await api("/api/auth/login", { method: "POST", body: { password } });
    setLoginOpen(false);
    await load();
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    setFounder(false);
    setComposer(null);
    await load();
  }

  async function toggleLike(post) {
    // optimistic
    const prevLiked = post.liked;
    const prevCount = post.likeCount;
    setPosts((ps) =>
      ps.map((p) =>
        p.id === post.id
          ? { ...p, liked: !prevLiked, likeCount: prevCount + (prevLiked ? -1 : 1) }
          : p
      )
    );
    try {
      const data = await api(`/api/community/${post.id}/like`, {
        method: "POST",
        body: { deviceId: getUid() },
      });
      setPosts((ps) =>
        ps.map((p) => (p.id === post.id ? { ...p, liked: data.liked, likeCount: data.likeCount } : p))
      );
    } catch (err) {
      console.error("[community] like failed", err);
      // rollback
      setPosts((ps) =>
        ps.map((p) => (p.id === post.id ? { ...p, liked: prevLiked, likeCount: prevCount } : p))
      );
    }
  }

  async function submitComment(post, name, email, text) {
    const data = await api(`/api/community/${post.id}/comments`, {
      method: "POST",
      body: { name, email, text, deviceId: getUid() },
    });
    setPosts((ps) =>
      ps.map((p) =>
        p.id === post.id ? { ...p, comments: [...p.comments, data.comment] } : p
      )
    );
    return true;
  }

  async function deleteComment(post, comment) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api(`/api/community/comments/${comment.id}?device=${encodeURIComponent(getUid())}`, {
        method: "DELETE",
      });
      setPosts((ps) =>
        ps.map((p) =>
          p.id === post.id ? { ...p, comments: p.comments.filter((c) => c.id !== comment.id) } : p
        )
      );
    } catch (err) {
      console.error("[community] delete comment failed", err);
    }
  }

  async function togglePin(post) {
    await api(`/api/community/${post.id}`, { method: "PUT", body: { pinned: !post.pinned } });
    await load();
  }

  async function togglePublish(post) {
    await api(`/api/community/${post.id}`, { method: "PUT", body: { published: !post.published } });
    await load();
  }

  async function deletePost(post) {
    if (!window.confirm("Delete this post permanently?")) return;
    setPosts((ps) => ps.filter((p) => p.id !== post.id));
    await api(`/api/community/${post.id}`, { method: "DELETE" });
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-24 pt-36 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-3">
            <span className="rule-fire" />
            Official Channel
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-metal sm:text-6xl">
            Community
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-steel">
            Announcements, premieres, behind-the-scenes and studio news — straight
            from Oxsnow. Like, comment, and stay close to the stories being built.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {founder ? (
            <>
              <button type="button" onClick={() => setComposer({})} className="btn btn-primary !py-2.5 !text-[0.7rem]">
                New Post
              </button>
              <button type="button" onClick={logout} className="rounded-full border border-white/15 px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-steel hover:border-ember hover:text-white">
                Lock Admin
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setLoginOpen(true)} className="rounded-full border border-white/12 px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ash hover:border-ember hover:text-white">
              Admin
            </button>
          )}
        </div>
      </div>

      {/* Founder-only feed switch — community announcements vs event posters */}
      {founder && (
        <div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label="Select feed">
          {[
            { id: "community", label: "Community feed", hint: "Normal channel posts" },
            { id: "events", label: "Events feed", hint: "Shown on /events" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={feed === f.id}
              onClick={() => setFeed(f.id)}
              className={`cursor-pointer rounded-full border px-5 py-2.5 text-left transition-colors ${
                feed === f.id
                  ? "border-ember bg-ember/10"
                  : "border-white/12 hover:border-white/30"
              }`}
            >
              <span
                className={`block text-[0.7rem] font-bold uppercase tracking-[0.16em] ${
                  feed === f.id ? "text-white" : "text-silver-2"
                }`}
              >
                {f.label}
              </span>
              <span className="mt-0.5 block text-[0.6rem] tracking-wide text-ash">
                {f.hint}
              </span>
            </button>
          ))}
        </div>
      )}

      {founder && drafts.length > 0 && (
        <div className="card mt-8 p-5">
          <p className="eyebrow !text-ember">Drafts &amp; unpublished</p>
          <div className="mt-3 space-y-2">
            {drafts.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 px-4 py-3">
                <p className="min-w-0 flex-1 truncate text-sm text-silver-2">{p.text || "(media only)"}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => togglePublish(p)} className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ember hover:text-white">Publish</button>
                  <button type="button" onClick={() => setComposer({ editing: p })} className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-silver-2 hover:text-white">Edit</button>
                  <button type="button" onClick={() => deletePost(p)} className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-red-300 hover:text-red-200">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={handleLogin}
        />
      )}

      {composer && (
        <Composer
          editing={composer.editing}
          defaultTarget={feed}
          onClose={() => setComposer(null)}
          onSaved={async () => {
            setComposer(null);
            await load();
          }}
        />
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
        {loading && (
          <div className="card animate-pulse p-8 text-sm text-ash">Loading the channel…</div>
        )}

        {!loading && published.length === 0 && (
          <div className="card flex flex-col items-center gap-4 px-8 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-ember/50 bg-ember/10 text-2xl">🔥</span>
            <h2 className="text-xl font-black text-white">The channel is warming up</h2>
            <p className="max-w-sm text-sm text-steel">Studio posts will appear here. Check back soon.</p>
          </div>
        )}

        {published.map((post) => (
          <article key={post.id} className="card overflow-hidden">
            <header className="flex items-start justify-between gap-4 p-5 pb-3">
              <div className="flex items-center gap-3">
                <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-ember/40 bg-ink-2">
                  <Image src="/brand/SM LOGO.jpeg" alt="Oxsnow Studio" fill sizes="44px" className="object-cover" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-white">{post.author || "Oxsnow Studio"}</p>
                    {post.pinned && (
                      <span className="rounded-full border border-ember/40 bg-ember/10 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-ember">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.16em] text-ash">
                    {post.role || "Official Studio Channel"} · {timeLabel(post.createdAt)}
                  </p>
                </div>
              </div>

              {founder && (
                <div className="relative">
                  <button type="button" onClick={() => setMenuFor(menuFor === post.id ? null : post.id)} aria-label="Post actions" className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-silver-2 hover:border-ember hover:text-white">
                    ⋯
                  </button>
                  {menuFor === post.id && (
                    <div className="absolute right-0 top-10 z-30 w-40 overflow-hidden rounded-lg border border-white/15 bg-ink-2 shadow-2xl">
                      <button type="button" onClick={() => { setComposer({ editing: post }); setMenuFor(null); }} className="block w-full px-4 py-2.5 text-left text-xs text-silver-2 hover:bg-white/5 hover:text-white">Edit</button>
                      <button type="button" onClick={() => { togglePin(post); setMenuFor(null); }} className="block w-full px-4 py-2.5 text-left text-xs text-silver-2 hover:bg-white/5 hover:text-white">{post.pinned ? "Unpin" : "Pin"}</button>
                      <button type="button" onClick={() => { togglePublish(post); setMenuFor(null); }} className="block w-full px-4 py-2.5 text-left text-xs text-silver-2 hover:bg-white/5 hover:text-white">Unpublish</button>
                      <button type="button" onClick={() => { deletePost(post); setMenuFor(null); }} className="block w-full px-4 py-2.5 text-left text-xs text-red-300 hover:bg-white/5">Delete</button>
                    </div>
                  )}
                </div>
              )}
            </header>

            {post.text && <PostText text={post.text} />}

            {post.media && post.media.length > 0 && (
              <div className={`grid gap-1 bg-black ${post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                {post.media.map((m, i) => {
                  if (!m.url) return null;
                  if (m.type === "video") {
                    return (
                      <video
                        key={i}
                        src={m.url}
                        controls
                        playsInline
                        preload="metadata"
                        className="max-h-[520px] w-full bg-black object-contain"
                      />
                    );
                  }
                  return (
                    <button key={i} type="button" onClick={() => setLightbox(m.url)} className="group relative block aspect-video overflow-hidden bg-black">
                      <img src={m.url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-6 border-t border-white/10 px-5 py-3">
              <button type="button" onClick={() => toggleLike(post)} className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${post.liked ? "text-ember" : "text-steel hover:text-white"}`}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill={post.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12 21s-7-4.5-9.5-8.5C.5 9 2 5.5 5.5 5.5c2 0 3.5 1.5 4.5 3 1-1.5 2.5-3 4.5-3C18 5.5 19.5 9 18 12.5 17 14.5 12 21 12 21z" />
                </svg>
                {post.likeCount}
              </button>
              <button type="button" onClick={() => setOpenComments((o) => ({ ...o, [post.id]: !o[post.id] }))} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-steel hover:text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />
                </svg>
                {(post.comments || []).length}
              </button>
            </div>

            {openComments[post.id] && (
              <Comments
                post={post}
                uid={getUid()}
                founder={founder}
                onAdd={submitComment}
                onDelete={deleteComment}
              />
            )}
          </article>
        ))}
        </div>

        <aside className="hidden space-y-4 lg:block">
          <div className="card p-5">
            <p className="eyebrow !text-ember">From the slate</p>
            <div className="mt-4 space-y-3">
              {posters.slice(0, 3).map((p) => (
                <Link key={p.title} href={p.href} className="group flex items-center gap-3">
                  <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black">
                    <img src={p.src} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white group-hover:text-ember">{p.title}</span>
                    <span className="text-[0.6rem] uppercase tracking-[0.16em] text-ash">{p.year}</span>
                  </span>
                </Link>
              ))}
            </div>
            <Link href="/films" className="mt-5 block text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ember hover:text-white">
              Explore all films →
            </Link>
          </div>

          <div className="card p-5">
            <p className="eyebrow !text-ember">The storefront</p>
            <p className="mt-3 text-sm leading-relaxed text-steel">
              Rent current releases or open the full archive with the Cultural Pass.
            </p>
            <Link href="/vod" className="btn btn-primary mt-4 w-full !py-2.5 !text-[0.7rem]">
              Enter VOD
            </Link>
          </div>

          <div className="card p-5">
            <p className="eyebrow !text-ember">Work with us</p>
            <p className="mt-3 text-sm leading-relaxed text-steel">
              Broadcasters, schools, funders and future filmmakers — the door is open.
            </p>
            <Link href="/contact" className="mt-4 block text-[0.65rem] font-bold uppercase tracking-[0.18em] text-silver-2 hover:text-white">
              Start a conversation →
            </Link>
          </div>
        </aside>
      </div>

      {menuFor && (
        <div className="fixed inset-0 z-20" onClick={() => setMenuFor(null)} />
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 p-4 backdrop-blur" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-full max-w-full object-contain" />
          <button type="button" aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/60 text-silver">✕</button>
        </div>
      )}
    </section>
  );
}

function PostText({ text }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 320;

  return (
    <div className="px-5 pb-4">
      <p
        className={`whitespace-pre-wrap text-sm leading-relaxed text-silver-2 [overflow-wrap:anywhere] ${
          long && !open ? "line-clamp-4" : ""
        }`}
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ember hover:text-white"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

function LoginModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError("");
    try {
      await onSuccess(password);
      onClose();
    } catch (err) {
      setError(err.message || "Incorrect password.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur" onClick={onClose}>
      <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="eyebrow !text-ember">Founder Access</p>
          <button type="button" onClick={onClose} className="text-ash hover:text-white">✕</button>
        </div>
        <p className="mt-3 text-sm text-steel">Enter the founder password to manage the channel.</p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="h-10 w-full rounded-lg border border-white/12 bg-ink px-3 text-sm text-silver outline-none placeholder:text-ash focus:border-ember"
          />
          {error && <p className="text-xs font-semibold text-red-300">{error}</p>}
          <button type="submit" disabled={busy || !password} className="btn btn-primary w-full disabled:opacity-60">
            {busy ? "Checking…" : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Comments({ post, uid, founder, onAdd, onDelete }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const initializedRef = useRef(false);

  function ensurePrefilled() {
    if (initializedRef.current) return;
    initializedRef.current = true;
    try {
      const savedName = localStorage.getItem(NAME_KEY) || "";
      const savedEmail = localStorage.getItem(EMAIL_KEY) || "";
      if (savedName) setName(savedName);
      if (savedEmail) setEmail(savedEmail);
    } catch {}
  }

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      try {
        localStorage.setItem(NAME_KEY, name.trim());
        localStorage.setItem(EMAIL_KEY, email.trim());
      } catch {}
      await onAdd(post, name, email, text);
      setText("");
    } catch (err) {
      setError(err.message || "Could not post comment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-white/10 bg-black/30 px-5 py-4">
      <div className="space-y-3">
        {(post.comments || []).map((c) => (
          <div key={c.id} className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 bg-ink-2 text-[0.6rem] font-bold uppercase text-silver-2">
              {(c.name || "C").slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-silver">
                {c.name}
                {c.email && (
                  <span className="ml-2 font-normal text-ash">· {c.email}</span>
                )}
                <span className="ml-2 font-normal text-ash">{timeLabel(c.createdAt)}</span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-silver-2 [overflow-wrap:anywhere]">{c.text}</p>
            </div>
            {(founder || c.deviceId === uid) && (
              <button type="button" onClick={() => onDelete(post, c)} aria-label="Delete comment" className="text-ash hover:text-red-300">✕</button>
            )}
          </div>
        ))}
        {(post.comments || []).length === 0 && (
          <p className="text-xs text-ash">No comments yet — start the conversation.</p>
        )}
      </div>

      <form onSubmit={submit} onFocus={ensurePrefilled} className="mt-4 grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={40}
          className="h-10 rounded-lg border border-white/12 bg-ink px-3 text-sm text-silver outline-none placeholder:text-ash focus:border-ember"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
          maxLength={120}
          className="h-10 rounded-lg border border-white/12 bg-ink px-3 text-sm text-silver outline-none placeholder:text-ash focus:border-ember"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          maxLength={500}
          required
          className="h-10 rounded-lg border border-white/12 bg-ink px-3 text-sm text-silver outline-none placeholder:text-ash focus:border-ember sm:col-span-2"
        />
        {error && <p className="text-xs font-semibold text-red-300 sm:col-span-2">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary !py-2 disabled:opacity-60 sm:col-span-2 sm:w-fit">
          {busy ? "Posting…" : "Comment"}
        </button>
      </form>
    </div>
  );
}

function compressImage(file) {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve(file);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1920;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const scale = MAX / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file),
        "image/jpeg",
        0.82
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

function Composer({ editing, defaultTarget = "community", onClose, onSaved }) {
  const [text, setText] = useState(editing?.text || "");
  const [pinned, setPinned] = useState(Boolean(editing?.pinned));
  const [target, setTarget] = useState(editing?.target || defaultTarget);
  const [author, setAuthor] = useState(editing?.author || "Oxsnow Studio");
  const [role, setRole] = useState(editing?.role || "Official Studio Channel");
  const [existing, setExisting] = useState(editing?.media || []);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const previewsRef = useRef([]);

  useEffect(() => {
    return () => previewsRef.current.forEach((p) => URL.revokeObjectURL(p.url));
  }, []);

  function updateFiles(next) {
    previewsRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    const nextPreviews = next.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    previewsRef.current = nextPreviews;
    setFiles(next);
    setPreviews(nextPreviews);
  }

  function onFiles(e) {
    const picked = Array.from(e.target.files || []).slice(0, 6);
    const valid = picked.filter(
      (f) =>
        (f.type.startsWith("image/") || f.type.startsWith("video/")) &&
        f.size <= 60 * 1024 * 1024
    );
    if (valid.length !== picked.length) {
      setError("Some files were skipped — only images/videos up to 60 MB are accepted.");
    } else {
      setError("");
    }
    updateFiles([...files, ...valid].slice(0, 6));
    if (fileRef.current) fileRef.current.value = "";
  }

  async function uploadFile(file) {
    const toUpload = file.type.startsWith("image/") ? await compressImage(file) : file;
    const fd = new FormData();
    fd.append("file", toUpload);
    const res = await fetch("/api/community/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({ ok: false }));
    if (!res.ok || !data.ok) throw new Error(data.error || "Upload failed");
    return data.media;
  }

  async function save(published) {
    if (busy) return;
    if (!text.trim() && files.length === 0 && existing.length === 0) {
      setError("Write something or attach media first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const media = [...existing];
      for (const file of files) {
        const m = await uploadFile(file);
        media.push(m);
      }
      await api("/api/community", {
        method: "POST",
        body: {
          id: editing?.id,
          updating: Boolean(editing?.id),
          text: text.trim(),
          media,
          pinned,
          published,
          target,
          author: author.trim() || "Oxsnow Studio",
          role: role.trim() || "Official Studio Channel",
        },
      });
      await onSaved();
    } catch (err) {
      console.error("[community] save failed", err);
      setError(err.message || "Could not save the post. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="card mt-8 p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow !text-ember">{editing ? "Edit post" : "New post"}</p>
        <button type="button" onClick={onClose} className="text-ash hover:text-white">✕</button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author name"
          maxLength={40}
          className="h-10 rounded-lg border border-white/12 bg-ink px-3 text-sm text-silver outline-none placeholder:text-ash focus:border-ember"
        />
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role / title"
          maxLength={60}
          className="h-10 rounded-lg border border-white/12 bg-ink px-3 text-sm text-silver outline-none placeholder:text-ash focus:border-ember"
        />
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        maxLength={5000}
        placeholder="Write an announcement, premiere update or behind-the-scenes note…"
        className="mt-4 w-full rounded-lg border border-white/12 bg-ink px-4 py-3 text-sm text-silver outline-none placeholder:text-ash focus:border-ember"
      />

      {existing.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {existing.map((m, i) => (
            <span key={i} className="flex items-center gap-2 rounded-full border border-white/12 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] text-silver-2">
              {m.type}
              <button type="button" onClick={() => setExisting((xs) => xs.filter((_, j) => j !== i))} className="text-ash hover:text-red-300">✕</button>
            </span>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((p, i) => (
            <div key={i} className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-black">
              {p.file.type.startsWith("video/") ? (
                <video src={p.url} muted playsInline className="h-full w-full object-cover" />
              ) : (
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              )}
              <button type="button" onClick={() => updateFiles(files.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-xs text-silver">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-full border border-white/15 px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-silver-2 hover:border-ember hover:text-white">
          Attach Photos / Video
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={onFiles} className="sr-only" />
        </label>
        <div
          role="radiogroup"
          aria-label="Post to feed"
          className="flex items-center rounded-full border border-white/15 p-0.5"
        >
          {[
            { id: "community", label: "Community feed" },
            { id: "events", label: "Events feed" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={target === f.id}
              onClick={() => setTarget(f.id)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] transition-colors ${
                target === f.id
                  ? "bg-ember text-ink shadow-[0_0_14px_-4px_rgba(255,69,0,0.9)]"
                  : "text-ash hover:text-silver"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-steel">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="accent-ember" />
          Pin to top
        </label>
        <span className="ml-auto text-[0.6rem] uppercase tracking-[0.16em] text-ash">Up to 6 files · 4 MB each</span>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-300">{error}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => save(true)} disabled={busy} className="btn btn-primary disabled:opacity-60">
          {busy ? "Saving…" : editing ? "Save & Publish" : "Publish"}
        </button>
        <button type="button" onClick={() => save(false)} disabled={busy} className="btn btn-ghost disabled:opacity-60">
          Save Draft
        </button>
      </div>
    </div>
  );
}
