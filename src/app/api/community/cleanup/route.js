import { NextResponse } from "next/server";
import { ensureSchema, query, isBlobUrl } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export async function GET(request) {
  try {
    await ensureSchema();

    const authHeader = request.headers.get("authorization") || "";
    const cronSecret = process.env.CRON_SECRET;
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const isFounder = await verifySession();

    if (!isCron && !isFounder) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    const retentionDays = Number(process.env.POST_RETENTION_DAYS) || 90;
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

    // pinned posts are exempt from cleanup
    const { rows: oldPosts } = await query(
      "SELECT id, media FROM posts WHERE pinned = false AND created_at < $1",
      [cutoff]
    );

    if (oldPosts.length === 0) {
      return NextResponse.json({ ok: true, deleted: 0, retentionDays });
    }

    let blobDeleted = 0;
    let blobAvailable = false;
    try {
      const { del } = await import("@vercel/blob");
      blobAvailable = true;
      for (const p of oldPosts) {
        const media = typeof p.media === "string" ? JSON.parse(p.media) : p.media;
        for (const m of media || []) {
          if (isBlobUrl(m?.url)) {
            await del(m.url).catch(() => {});
            blobDeleted++;
          }
        }
      }
    } catch {}

    // cascade removes likes + comments via FK
    const ids = oldPosts.map((p) => p.id);
    await query("DELETE FROM posts WHERE id = ANY($1)", [ids]);

    return NextResponse.json({
      ok: true,
      deleted: oldPosts.length,
      blobFilesDeleted: blobDeleted,
      blobAvailable,
      retentionDays,
      cutoff,
    });
  } catch (err) {
    console.error("[cleanup] failed:", err);
    return NextResponse.json({ ok: false, error: "Cleanup failed." }, { status: 500 });
  }
}
