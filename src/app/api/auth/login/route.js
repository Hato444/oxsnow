import { NextResponse } from "next/server";
import { checkFounderPassword, createSession } from "@/lib/auth";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const password = String(body.password || "");
  if (!password) {
    return NextResponse.json({ ok: false, error: "Password required." }, { status: 400 });
  }

  if (!checkFounderPassword(password)) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
