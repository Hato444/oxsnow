import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const founder = await verifySession();
  return NextResponse.json({ ok: true, founder });
}
