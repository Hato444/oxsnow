import { NextResponse } from "next/server";
import { createQuote, HireError } from "@/lib/hire/data";
import { getCustomerSession } from "@/lib/auth";
import { bookingEmailHtml, sendHireMail } from "@/lib/hire/email";

const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_HITS) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  if (String(body?.website || "").trim()) {
    return NextResponse.json({ ok: true, reference: "received" });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  try {
    const customerId = (await getCustomerSession()) || "";
    const quote = await createQuote(body, customerId);
    const html = bookingEmailHtml(
      {
        reference: quote.reference,
        customerName: quote.name,
        email: quote.email,
        phone: quote.phone,
        startsOn: quote.startsOn || "—",
        endsOn: quote.endsOn || "—",
        rentalDays: 0,
        items: [],
        rentalSubtotalMinor: 0,
        depositTotalMinor: 0,
        totalMinor: 0,
      },
      "New hire quote request",
      "A custom quote request came through the equipment hire page.",
      [
        ["Company", quote.company || "—"],
        ["Production", quote.productionType || "—"],
        ["Budget", quote.budget || "—"],
      ],
      [quote.requestedEquipment, quote.notes].filter(Boolean).join("\n\n")
    );
    const mail = await sendHireMail({
      subject: `[Hire quote] ${quote.reference} — ${quote.name}`,
      text: `New hire quote ${quote.reference}\n\nName: ${quote.name}\nEmail: ${quote.email}\nPhone: ${quote.phone}\nDates: ${quote.startsOn || "—"} → ${quote.endsOn || "—"}\n\n${quote.requestedEquipment}\n\n${quote.notes}`,
      html,
      replyTo: `"${quote.name}" <${quote.email}>`,
    });
    return NextResponse.json({ ok: true, reference: quote.reference, email: mail });
  } catch (err) {
    if (err instanceof HireError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[hire/quote] failed:", err);
    return NextResponse.json({ ok: false, error: "Could not send your quote request." }, { status: 500 });
  }
}
