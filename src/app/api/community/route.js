import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export async function GET(request) {
  try {
    await ensureSchema();
    const founder = await verifySession();
    const deviceId = request.nextUrl.searchParams.get("device") || "";
    const showAll = request.nextUrl.searchParams.get("all") === "1" && founder;
    const target =
      request.nextUrl.searchParams.get("target") === "events" ? "events" : "community";

    const postQuery = showAll
      ? "SELECT * FROM posts WHERE target = $1 ORDER BY pinned DESC, created_at DESC"
      : "SELECT * FROM posts WHERE published = true AND target = $1 ORDER BY pinned DESC, created_at DESC";

    const { rows: posts } = await query(postQuery, [target]);

    if (posts.length === 0) {
      return NextResponse.json({ ok: true, posts: [], founder });
    }

    const ids = posts.map((p) => p.id);

    const { rows: likeRows } = await query(
      "SELECT post_id, COUNT(*)::int AS count FROM likes WHERE post_id = ANY($1) GROUP BY post_id",
      [ids]
    );
    const likeMap = {};
    for (const r of likeRows) likeMap[r.post_id] = r.count;

    let likedSet = new Set();
    if (deviceId) {
      const { rows } = await query(
        "SELECT post_id FROM likes WHERE device_id = $1 AND post_id = ANY($2)",
        [deviceId, ids]
      );
      likedSet = new Set(rows.map((r) => r.post_id));
    }

    const { rows: commentRows } = await query(
      "SELECT * FROM comments WHERE post_id = ANY($1) ORDER BY created_at ASC",
      [ids]
    );
    const commentMap = {};
    for (const c of commentRows) {
      if (!commentMap[c.post_id]) commentMap[c.post_id] = [];
      commentMap[c.post_id].push(c);
    }

    const formatted = posts.map((p) => ({
      id: p.id,
      text: p.text,
      author: p.author,
      role: p.role,
      pinned: p.pinned,
      published: p.published,
      target: p.target === "events" ? "events" : "community",
      media: typeof p.media === "string" ? JSON.parse(p.media) : p.media,
      createdAt: Number(p.created_at),
      updatedAt: Number(p.updated_at),
      likeCount: likeMap[p.id] || 0,
      liked: likedSet.has(p.id),
      comments: (commentMap[p.id] || []).map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        text: c.text,
        deviceId: c.device_id,
        createdAt: Number(c.created_at),
      })),
    }));

    return NextResponse.json({ ok: true, posts: formatted, founder });
  } catch (err) {
    console.error("[community] GET failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load community feed." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await ensureSchema();
    if (!(await verifySession())) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    const text = String(body.text || "").trim().slice(0, 5000);
    const media = Array.isArray(body.media)
      ? body.media.filter((m) => m && typeof m.url === "string" && typeof m.type === "string").slice(0, 6)
      : [];
    const pinned = Boolean(body.pinned);
    const published = body.published !== false;
    const target = body.target === "events" ? "events" : "community";
    const author = String(body.author || "Oxsnow Studio").trim().slice(0, 40) || "Oxsnow Studio";
    const role = String(body.role || "Official Studio Channel").trim().slice(0, 60) || "Official Studio Channel";
    const id = body.id
      ? String(body.id).slice(0, 80)
      : (crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`);

    if (!text && media.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Write something or attach media first." },
        { status: 400 }
      );
    }

    const now = Date.now();

    if (body.updating) {
      const existing = await query("SELECT id FROM posts WHERE id = $1", [id]);
      if (existing.rows.length === 0) {
        return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
      }
      await query(
        `UPDATE posts SET text=$1, media=$2, pinned=$3, published=$4, author=$5, role=$6, target=$7, updated_at=$8 WHERE id=$9`,
        [text, JSON.stringify(media), pinned, published, author, role, target, now, id]
      );
    } else {
      await query(
        `INSERT INTO posts (id, text, author, role, pinned, published, target, media, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9)
         ON CONFLICT (id) DO UPDATE SET
           text=EXCLUDED.text, media=EXCLUDED.media, pinned=EXCLUDED.pinned,
           published=EXCLUDED.published, author=EXCLUDED.author, role=EXCLUDED.role,
           target=EXCLUDED.target, updated_at=EXCLUDED.updated_at`,
        [id, text, author, role, pinned, published, target, JSON.stringify(media), now]
      );
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[community] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Failed to save post." }, { status: 500 });
  }
}
