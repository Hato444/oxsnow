"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";

export default function EventsFeed() {
  const [posts, setPosts] = useState(null); // null = loading

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/community?target=events");
        const data = await res.json();
        setPosts(data.ok ? data.posts.filter((p) => p.published) : []);
      } catch {
        setPosts([]);
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  if (posts === null) {
    return (
      <div className="mt-24 space-y-4" aria-hidden>
        <div className="h-6 w-56 animate-pulse rounded bg-white/8" />
        <div className="card h-32 animate-pulse" />
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div className="mt-24">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-metal sm:text-3xl">
            From the Events Feed
          </h2>
          <span className="text-[0.65rem] uppercase tracking-[0.24em] text-ash">
            Posted by the studio
          </span>
        </div>
      </Reveal>

      <div className="mt-8 space-y-5">
        {posts.map((post, i) => (
          <Reveal key={post.id} delay={Math.min(i * 0.06, 0.3)}>
            <article className="card group relative overflow-hidden p-6 sm:p-7">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-ember/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ember/50 bg-ember/10 text-[0.7rem] font-black text-ember">
                  {(post.author || "OX").slice(0, 2).toUpperCase()}
                </span>
                <span className="text-sm font-bold text-white">{post.author}</span>
                <span className="h-1 w-1 rounded-full bg-ash" />
                <span className="text-[0.6rem] uppercase tracking-[0.2em] text-ash">
                  {post.role}
                </span>
                {post.pinned && (
                  <span className="rounded-full border border-ember/50 bg-ember/10 px-2.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-ember">
                    Pinned
                  </span>
                )}
                <span className="ml-auto text-[0.65rem] text-ash">
                  {new Date(post.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {post.text && (
                <p className="mt-4 whitespace-pre-line max-w-3xl text-sm leading-relaxed text-silver-2">
                  {post.text}
                </p>
              )}

              {post.media?.length > 0 && (
                <div
                  className={`mt-4 grid gap-2 ${
                    post.media.length === 1
                      ? "max-w-2xl grid-cols-1"
                      : "grid-cols-2 sm:grid-cols-3"
                  }`}
                >
                  {post.media.map((m, j) =>
                    m.type === "video" ? (
                      <video
                        key={j}
                        src={m.url}
                        controls
                        playsInline
                        className="w-full rounded-lg border border-white/10 bg-black object-cover"
                      />
                    ) : (
                      <img
                        key={j}
                        src={m.url}
                        alt=""
                        loading="lazy"
                        className="w-full rounded-lg border border-white/10 object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                      />
                    )
                  )}
                </div>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
