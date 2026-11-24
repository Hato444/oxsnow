import crypto from "crypto";
import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";
import { validateBrief } from "@/lib/services/brief.mjs";
import { saveServiceEnquiry } from "@/lib/services/store.mjs";

const hits = new Map();

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  if (body?.website) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const result = validateBrief(body);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((time) => now - time < 600000);
  if (recent.length >= 5) return NextResponse.json({ ok: false, error: "Please wait before sending another enquiry." }, { status: 429 });
  recent.push(now);
  hits.set(ip, recent);
  try {
    await ensureSchema();
    const id = `svc_${crypto.randomUUID()}`;
    await saveServiceEnquiry(query, id, result.value, now);
    return NextResponse.json({ ok: true, reference: id });
  } catch (error) {
    console.error("[services] enquiry save failed", error);
    return NextResponse.json({ ok: false, error: "Your brief could not be saved. Please try again." }, { status: 503 });
  }
}
