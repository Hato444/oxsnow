import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { mediaAvailable } from "@/lib/payments/catalog";
import { getSession, getVodStatus, sessionEvent, startSession } from "@/lib/vod/data";

export async function GET(request) {
  const customerId = await getCustomerSession();
  if (!customerId) return NextResponse.json({ ok: false, error: "Sign in to watch." }, { status: 401 });
  const title = request.nextUrl.searchParams.get("title") || "";
  try {
    const status = await getVodStatus(customerId, title);
    const credit = status.credits.find((entry) => entry.movie_id === title);
    return NextResponse.json({ ok: true, available: mediaAvailable(title), ...status, remaining: credit?.remaining || 0 });
  } catch (error) {
    console.error("[vod] status failed", error);
    return NextResponse.json({ ok: false, error: "Could not load viewing access." }, { status: 500 });
  }
}

export async function POST(request) {
  const customerId = await getCustomerSession();
  if (!customerId) return NextResponse.json({ ok: false, error: "Sign in to watch." }, { status: 401 });
  try {
    const body = await request.json();
    if (body.action === "start") {
      if (!mediaAvailable(body.title)) return NextResponse.json({ ok: false, error: "This film is not available for streaming." }, { status: 404 });
      const session = await startSession(customerId, body.title);
      return NextResponse.json({ ok: true, sessionId: session.id, position: Number(session.position_seconds) || 0, url: `/api/stream/media?session=${encodeURIComponent(session.id)}` });
    }
    if (["playing", "progress", "complete"].includes(body.action)) {
      await sessionEvent(customerId, body.sessionId, body.action, body.position);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Playback request failed." }, { status: 409 });
  }
}
