import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    await ensureSchema();
    if (!(await verifySession())) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    const existing = await query("SELECT * FROM posts WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
    }

    const post = existing.rows[0];
    const text = body.text !== undefined ? String(body.text).trim().slice(0, 5000) : post.text;
    const media = body.media !== undefined
      ? (Array.isArray(body.media)
          ? body.media.filter((m) => m && typeof m.url === "string").slice(0, 6)
          : [])
      : (typeof post.media === "string" ? JSON.parse(post.media) : post.media);
    const pinned = body.pinned !== undefined ? Boolean(body.pinned) : post.pinned;
    const published = body.published !== undefined ? Boolean(body.published) : post.published;
    const author = body.author !== undefined
      ? (String(body.author).trim().slice(0, 40) || "Oxsnow Studio")
      : post.author;
    const role = body.role !== undefined
      ? (String(body.role).trim().slice(0, 60) || "Official Studio Channel")
      : post.role;

    await query(
      `UPDATE posts SET text=$1, media=$2, pinned=$3, published=$4, author=$5, role=$6, updated_at=$7 WHERE id=$8`,
      [text, JSON.stringify(media), pinned, published, author, role, Date.now(), id]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[community] PUT failed:", err);
    return NextResponse.json({ ok: false, error: "Failed to update post." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await ensureSchema();
    if (!(await verifySession())) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await query("SELECT media FROM posts WHERE id = $1", [id]);
    if (existing.rows.length > 0) {
      const media = typeof existing.rows[0].media === "string"
        ? JSON.parse(existing.rows[0].media)
        : existing.rows[0].media;
      // best-effort: delete blob files (cascade removes likes + comments rows)
      try {
        const { del } = await import("@vercel/blob");
        for (const m of media || []) {
          if (m?.url?.includes(".blob.vercel-storage.com")) {
            await del(m.url).catch(() => {});
          }
        }
      } catch {}
    }

    await query("DELETE FROM posts WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[community] DELETE failed:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete post." }, { status: 500 });
  }
}
