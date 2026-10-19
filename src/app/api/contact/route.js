import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const TO_EMAIL = "oxsnowstudio@gmail.com";
const SITE_LABEL = "Oxsnow Studio Website";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

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

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmail({ name, email, organisation, interests, message }) {
  const interestRow =
    interests && interests.length
      ? interests
          .map(
            (i) =>
              `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 12px;border-radius:999px;background:#E25822;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(i)}</span>`
          )
          .join("")
      : `<span style="color:#888;">None selected</span>`;

  return `
  <div style="margin:0;padding:0;background:#0A0A0A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">

            <tr>
              <td style="background:#0d0d0d;border-bottom:3px solid #E25822;padding:28px 32px;">
                <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.28em;text-transform:uppercase;color:#E25822;">New inquiry &mdash; ${SITE_LABEL}</p>
                <h1 style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.01em;">Contact form submission</h1>
                <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8A8A8A;">Received just now via oxsnowstudio.com/contact</p>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;">
                  <tr>
                    <td style="padding:0 0 18px;width:130px;vertical-align:top;">
                      <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#6b6b6b;">Name</p>
                    </td>
                    <td style="padding:0 0 18px;vertical-align:top;">
                      <p style="margin:0;font-size:15px;font-weight:700;color:#e8e8e8;">${escapeHtml(name)}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 18px;vertical-align:top;">
                      <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#6b6b6b;">Email</p>
                    </td>
                    <td style="padding:0 0 18px;vertical-align:top;">
                      <p style="margin:0;font-size:15px;"><a href="mailto:${escapeHtml(email)}" style="color:#C0C0C0;text-decoration:underline;">${escapeHtml(email)}</a></p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 18px;vertical-align:top;">
                      <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#6b6b6b;">Organisation</p>
                    </td>
                    <td style="padding:0 0 18px;vertical-align:top;">
                      <p style="margin:0;font-size:15px;color:#e8e8e8;">${organisation ? escapeHtml(organisation) : "<span style='color:#666;'>&mdash;</span>"}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 18px;vertical-align:top;">
                      <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#6b6b6b;">Interested in</p>
                    </td>
                    <td style="padding:0 0 18px;vertical-align:top;">${interestRow}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 32px 28px;">
                <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#6b6b6b;">Message</p>
                <div style="background:#0A0A0A;border:1px solid #2a2a2a;border-left:3px solid #E25822;border-radius:8px;padding:18px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#cfcfcf;white-space:pre-wrap;">${escapeHtml(message)}</div>
              </td>
            </tr>

            <tr>
              <td style="background:#0d0d0d;border-top:1px solid #2a2a2a;padding:20px 32px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b6b6b;">
                  Reply directly to this email to respond to ${escapeHtml(name)}.<br/>
                  Oxsnow Studio &middot; Maseru, Lesotho &middot; +266 6279 7598
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>`;
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

  try {
    await transporter.sendMail({
      from: `"${SITE_LABEL}" <${process.env.GMAIL_USER}>`,
      to: TO_EMAIL,
      replyTo: `"${name}" <${email}>`,
      subject: `[Website] ${interestLabel} inquiry from ${name}`,
      text: [
        `New inquiry from the ${SITE_LABEL} (oxsnowstudio.com/contact)`,
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Organisation: ${organisation || "—"}`,
        `Interested in: ${interestLabel}`,
        "",
        "Message:",
        message,
        "",
        "—",
        "Reply directly to this email to respond.",
        "Oxsnow Studio · Maseru, Lesotho · +266 6279 7598",
      ].join("\n"),
      html: buildEmail({ name, email, organisation, interests, message }),
    });

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
