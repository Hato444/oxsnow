import { NextResponse } from "next/server";

const TO_EMAIL = "oxsnowstudio@gmail.com";
const SITE_LABEL = "Oxsnow Studio Website";
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${TO_EMAIL}`;

// naive in-memory rate limit: max 3 submissions per IP per 10 minutes
const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 3;

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

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const organisation = String(body.organisation || "").trim();
  const message = String(body.message || "").trim();
  const website = String(body.website || "").trim(); // honeypot
  const interests = Array.isArray(body.interests)
    ? body.interests.map(String).slice(0, 10)
    : [];

  if (website) {
    // honeypot tripped — pretend success so bots don't retry
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "Name, email and message are required." },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  if (message.length > 5000) {
    return NextResponse.json({ ok: false, error: "Message is too long (max 5000 characters)." }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many messages. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const interestLabel = interests.length ? interests.join(", ") : "General";

  const payload = {
    _subject: `[Website] ${interestLabel} inquiry from ${name}`,
    _template: "table",
    _captcha: "false",
    Name: name,
    Email: email,
    Organisation: organisation || "—",
    "Interested in": interestLabel,
    Message: message,
    Source: `${SITE_LABEL} — oxsnowstudio.com/contact`,
  };

  try {
    // FormSubmit rejects server-side calls without a web-looking Referer
    const referer = request.headers.get("referer") || request.headers.get("origin") || "http://localhost:3000";

    const res = await fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Referer: referer,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    const success = data.success === "true" || data.success === true;

    if (!res.ok || !success) {
      console.error("[contact] formsubmit error:", data);
      return NextResponse.json(
        { ok: false, error: "Something went wrong sending your message. Please email us directly at oxsnowstudio@gmail.com." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong sending your message. Please email us directly at oxsnowstudio@gmail.com." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405 });
}
