import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase().slice(0, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  // honeypot
  if (String(body.website || "")) {
    return NextResponse.json({ ok: true });
  }

  try {
    await ensureSchema();
    await query(
      "INSERT INTO newsletter (email, created_at) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
      [email, Date.now()]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not subscribe right now. Please try again." },
      { status: 500 }
    );
  }
}
