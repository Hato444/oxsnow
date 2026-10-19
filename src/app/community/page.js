"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { posters } from "@/lib/site";
import {
  getAllPosts,
  getMedia,
  putMedia,
  putPost,
  removeMedia,
  removePost,
  seedIfEmpty,
} from "@/lib/communityStore";

const ADMIN_KEY = process.env.NEXT_PUBLIC_COMMUNITY_ADMIN_KEY || "oxsnow2026";
const UID_KEY = "oxsnow-community-uid";
const NAME_KEY = "oxsnow-community-name";
const ADMIN_SESSION = "oxsnow-community-admin";

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

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [urls, setUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [composer, setComposer] = useState(null); // null | { editing?: post }
  const [openComments, setOpenComments] = useState({});
  const [lightbox, setLightbox] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const blobUrls = useRef([]);

  const load = useCallback(async () => {
    try {
      await seedIfEmpty();
      const all = await getAllPosts();
      all.sort(
        (a, b) =>
          Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
          b.createdAt - a.createdAt
      );
      setPosts(all);

      const map = {};
      for (const post of all) {
        for (const m of post.media || []) {
          if (m.url) {
            map[m.url] = m.url;
          } else if (m.mediaId) {
            const blob = await getMedia(m.mediaId);
            if (blob) {
              const url = URL.createObjectURL(blob);
              blobUrls.current.push(url);
              map[m.mediaId] = url;
            }
          }
        }
      }
      setUrls(map);
    } catch (err) {
      console.error("[community] load failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      setAdmin(sessionStorage.getItem(ADMIN_SESSION) === "1");
    } catch {}
    load();
    return () => {
      blobUrls.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrls.current = [];
    };
  }, [load]);

  const uid = useMemo(() => (typeof window === "undefined" ? "anon" : getUid()), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (lightbox) setLightbox(null);
      else if (menuFor) setMenuFor(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, menuFor]);
  const published = posts.filter((p) => p.published);
  const drafts = posts.filter((p) => !p.published);

  const srcOf = (m) => (m.url ? urls[m.url] || m.url : urls[m.mediaId] || "");

  function unlock() {
    const key = window.prompt("Enter the Oxsnow admin key");
    if (key === null) return;
    if (key === ADMIN_KEY) {
      try {
        sessionStorage.setItem(ADMIN_SESSION, "1");
      } catch {}
      setAdmin(true);
    } else {
      window.alert("Incorrect admin key.");
    }
  }

  function lock() {
    try {
      sessionStorage.removeItem(ADMIN_SESSION);
    } catch {}
    setAdmin(false);
    setComposer(null);
  }

  async function toggleLike(post) {
    const liked = (post.likedBy || []).includes(uid);
    const next = {
      ...post,
      likedBy: liked
        ? post.likedBy.filter((x) => x !== uid)
        : [...(post.likedBy || []), uid],
    };
    setPosts((ps) => ps.map((p) => (p.id === post.id ? next : p)));
    await putPost(next);
  }

  async function submitComment(post, name, text) {
    const clean = text.trim().slice(0, 500);
    if (!clean) return false;
    const next = {
      ...post,
      comments: [
        ...(post.comments || []),
        {
          id: `c-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          uid,
          name: name.trim().slice(0, 40) || "Community member",
          text: clean,
          createdAt: Date.now(),
        },
      ],
    };
    setPosts((ps) => ps.map((p) => (p.id === post.id ? next : p)));
    await putPost(next);
    return true;
  }

  async function deleteComment(post, comment) {
    if (!admin && comment.uid !== uid) return;
    if (!window.confirm("Delete this comment?")) return;
    const next = {
      ...post,
      comments: (post.comments || []).filter((c) => c.id !== comment.id),
    };
    setPosts((ps) => ps.map((p) => (p.id === post.id ? next : p)));
    await putPost(next);
  }

  async function togglePin(post) {
    const next = { ...post, pinned: !post.pinned };
    setPosts((ps) => ps.map((p) => (p.id === post.id ? next : p)));
    await putPost(next);
  }

  async function togglePublish(post) {
    const next = { ...post, published: !post.published };
    setPosts((ps) => ps.map((p) => (p.id === post.id ? next : p)));
    await putPost(next);
  }

  async function deletePost(post) {
    if (!window.confirm("Delete this post permanently?")) return;
    setPosts((ps) => ps.filter((p) => p.id !== post.id));
    for (const m of post.media || []) {
      if (m.mediaId) await removeMedia(m.mediaId);
    }
    await removePost(post.id);
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
          {admin ? (
            <>
              <button type="button" onClick={() => setComposer({})} className="btn btn-primary !py-2.5 !text-[0.7rem]">
                New Post
              </button>
              <button type="button" onClick={lock} className="rounded-full border border-white/15 px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-steel hover:border-ember hover:text-white">
                Lock Admin
              </button>
            </>
          ) : (
            <button type="button" onClick={unlock} className="rounded-full border border-white/12 px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ash hover:border-ember hover:text-white">
              Admin
            </button>
          )}
        </div>
      </div>

      {admin && drafts.length > 0 && (
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

      {composer && (
        <Composer
          editing={composer.editing}
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

              {admin && (
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
                  const src = srcOf(m);
                  if (!src) return null;
                  if (m.type === "video") {
                    return (
                      <video
                        key={i}
                        src={src}
                        controls
                        playsInline
                        preload="metadata"
                        className="max-h-[520px] w-full bg-black object-contain"
                      />
                    );
                  }
                  return (
                    <button key={i} type="button" onClick={() => setLightbox(src)} className="group relative block aspect-video overflow-hidden bg-black">
                      <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-6 border-t border-white/10 px-5 py-3">
              <button type="button" onClick={() => toggleLike(post)} className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${(post.likedBy || []).includes(uid) ? "text-ember" : "text-steel hover:text-white"}`}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill={(post.likedBy || []).includes(uid) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12 21s-7-4.5-9.5-8.5C.5 9 2 5.5 5.5 5.5c2 0 3.5 1.5 4.5 3 1-1.5 2.5-3 4.5-3C18 5.5 19.5 9 18 12.5 17 14.5 12 21 12 21z" />
                </svg>
                {(post.likedBy || []).length}
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
                uid={uid}
                admin={admin}
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

function Comments({ post, uid, admin, onAdd, onDelete }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) || "");
    } catch {}
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {}
    const ok = await onAdd(post, name, text);
    if (ok) setText("");
    setBusy(false);
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
                <span className="ml-2 font-normal text-ash">{timeLabel(c.createdAt)}</span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-silver-2 [overflow-wrap:anywhere]">{c.text}</p>
            </div>
            {(admin || c.uid === uid) && (
              <button type="button" onClick={() => onDelete(post, c)} aria-label="Delete comment" className="text-ash hover:text-red-300">✕</button>
            )}
          </div>
        ))}
        {(post.comments || []).length === 0 && (
          <p className="text-xs text-ash">No comments yet — start the conversation.</p>
        )}
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-2 sm:grid-cols-[140px_1fr_auto]">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={40}
          className="h-10 rounded-lg border border-white/12 bg-ink px-3 text-sm text-silver outline-none placeholder:text-ash focus:border-ember"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          maxLength={500}
          required
          className="h-10 rounded-lg border border-white/12 bg-ink px-3 text-sm text-silver outline-none placeholder:text-ash focus:border-ember"
        />
        <button type="submit" disabled={busy} className="btn btn-primary !py-2 disabled:opacity-60">
          {busy ? "Posting…" : "Comment"}
        </button>
      </form>
    </div>
  );
}

function Composer({ editing, onClose, onSaved }) {
  const [text, setText] = useState(editing?.text || "");
  const [pinned, setPinned] = useState(Boolean(editing?.pinned));
  const [author, setAuthor] = useState(editing?.author || "Oxsnow Studio");
  const [role, setRole] = useState(editing?.role || "Official Studio Channel");
  const [existing, setExisting] = useState(editing?.media || []);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    const next = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setPreviews(next);
    return () => next.forEach((p) => URL.revokeObjectURL(p.url));
  }, [files]);

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
    setFiles((prev) => [...prev, ...valid].slice(0, 6));
    if (fileRef.current) fileRef.current.value = "";
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
        const id = (crypto.randomUUID && crypto.randomUUID()) || `m-${Date.now()}-${Math.random()}`;
        await putMedia(id, file);
        media.push({ type: file.type.startsWith("video/") ? "video" : "image", mediaId: id });
      }
      const post = {
        id: editing?.id || ((crypto.randomUUID && crypto.randomUUID()) || `p-${Date.now()}`),
        text: text.trim(),
        media,
        pinned,
        published,
        author: author.trim() || "Oxsnow Studio",
        role: role.trim() || "Official Studio Channel",
        createdAt: editing?.createdAt || Date.now(),
        updatedAt: Date.now(),
        likedBy: editing?.likedBy || [],
        comments: editing?.comments || [],
      };
      await putPost(post);
      await onSaved();
    } catch (err) {
      console.error("[community] save failed", err);
      setError("Could not save the post. Please try again.");
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
              <button type="button" onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-xs text-silver">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-full border border-white/15 px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-silver-2 hover:border-ember hover:text-white">
          Attach Photos / Video
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={onFiles} className="sr-only" />
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-steel">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="accent-ember" />
          Pin to top
        </label>
        <span className="ml-auto text-[0.6rem] uppercase tracking-[0.16em] text-ash">Up to 6 files · 60 MB each</span>
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
