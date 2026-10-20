import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export async function DELETE(request, { params }) {
  try {
    await ensureSchema();

    const { commentId } = await params;
    const deviceId = request.nextUrl.searchParams.get("device") || "";

    const { rows } = await query("SELECT * FROM comments WHERE id = $1", [commentId]);
    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Comment not found." }, { status: 404 });
    }

    const comment = rows[0];
    const founder = await verifySession();
    const ownComment = deviceId && comment.device_id === deviceId;

    if (!founder && !ownComment) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    await query("DELETE FROM comments WHERE id = $1", [commentId]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[comments] DELETE failed:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete comment." }, { status: 500 });
  }
}
