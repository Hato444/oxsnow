import { NextResponse } from "next/server";
import { quoteAvailability } from "@/lib/hire/data";
import { validateRentalRange } from "@/lib/hire/rules.mjs";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const range = validateRentalRange(body?.start, body?.end);
  if (!range.ok) {
    return NextResponse.json({ ok: false, error: range.error }, { status: 400 });
  }
  const items = Array.isArray(body?.items) ? body.items.slice(0, 50) : [];
  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "Add at least one item." }, { status: 400 });
  }

  try {
    const quote = await quoteAvailability(items, body.start, body.end);
    return NextResponse.json({ ok: true, ...quote });
  } catch (err) {
    console.error("[hire/availability] failed:", err);
    return NextResponse.json({ ok: false, error: "Could not check availability." }, { status: 500 });
  }
}
