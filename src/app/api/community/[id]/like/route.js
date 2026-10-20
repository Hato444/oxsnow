import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";

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

    const deviceId = String(body.deviceId || "").trim().slice(0, 80);
    if (!deviceId) {
      return NextResponse.json({ ok: false, error: "Device ID required." }, { status: 400 });
    }

    const post = await query("SELECT id FROM posts WHERE id = $1", [id]);
    if (post.rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
    }

    const existing = await query(
      "SELECT post_id FROM likes WHERE post_id = $1 AND device_id = $2",
      [id, deviceId]
    );

    let liked;
    if (existing.rows.length > 0) {
      await query("DELETE FROM likes WHERE post_id = $1 AND device_id = $2", [id, deviceId]);
      liked = false;
    } else {
      await query(
        "INSERT INTO likes (post_id, device_id, created_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [id, deviceId, Date.now()]
      );
      liked = true;
    }

    const { rows } = await query(
      "SELECT COUNT(*)::int AS count FROM likes WHERE post_id = $1",
      [id]
    );

    return NextResponse.json({ ok: true, liked, likeCount: rows[0].count });
  } catch (err) {
    console.error("[community] like failed:", err);
    return NextResponse.json({ ok: false, error: "Failed to update like." }, { status: 500 });
  }
}
