import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    await ensureSchema();
    const { id } = await params;

    const { rows } = await query(
      "SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC",
      [id]
    );

    return NextResponse.json({
      ok: true,
      comments: rows.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        text: c.text,
        deviceId: c.device_id,
        createdAt: Number(c.created_at),
      })),
    });
  } catch (err) {
    console.error("[comments] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Failed to load comments." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    await ensureSchema();

    const { id } = await params;
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    const name = String(body.name || "").trim().slice(0, 40);
    const email = String(body.email || "").trim().slice(0, 120);
    const text = String(body.text || "").trim().slice(0, 500);
    const deviceId = String(body.deviceId || "").trim().slice(0, 80);

    if (!text) {
      return NextResponse.json({ ok: false, error: "Comment text required." }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
    }

    const post = await query("SELECT id FROM posts WHERE id = $1", [id]);
    if (post.rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
    }

    const commentId =
      crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    await query(
      "INSERT INTO comments (id, post_id, name, email, text, device_id, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [commentId, id, name || "Community member", email, text, deviceId, Date.now()]
    );

    return NextResponse.json({
      ok: true,
      comment: {
        id: commentId,
        name: name || "Community member",
        email,
        text,
        deviceId,
        createdAt: Date.now(),
      },
    });
  } catch (err) {
    console.error("[comments] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Failed to post comment." }, { status: 500 });
  }
}
