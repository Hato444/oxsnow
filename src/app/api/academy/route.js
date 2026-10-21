import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { ensureSchema, query } from "@/lib/db";

const TO_EMAIL = "oxsnowstudio@gmail.com";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const TRACK_LABELS = {
  direction: "Directing & Story",
  camera: "Camera & Lighting",
  sound: "Sound & Post",
  producing: "Producing & Production",
};

const DISTRICTS = [
  "Maseru", "Leribe", "Teyateyaneng", "Mohale's Hoek", "Quthing",
  "Qacha's Nek", "Mokhotlong", "Butha-Buthe", "Mafeteng", "Thaba-Tseka",
];

// naive in-memory rate limit: max 3 submissions per IP per hour
const hits = new Map();
const WINDOW_MS = 60 * 60 * 1000;
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

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").replace(/[^\d+]/g, "").slice(0, 15);
  const district = String(body.district || "").trim().slice(0, 60);
  const track = String(body.track || "").slice(0, 30);
  const why = String(body.why || "").trim();
  const honeypot = String(body.website || "").trim();

  if (honeypot) return NextResponse.json({ ok: true });

  if (!name || !email || !phone || !district || !why) {
    return NextResponse.json(
      { ok: false, error: "All fields are required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }
  if (why.length > 2000) {
    return NextResponse.json({ ok: false, error: "Answer is too long." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many applications from this device. Try again later." },
      { status: 429 }
    );
  }

  const districtMatch = DISTRICTS.find(
    (d) => d.toLowerCase() === district.toLowerCase()
  );

  try {
    await ensureSchema();
    await query(
      `INSERT INTO academy_applications (id, name, email, phone, district, track, why, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'new',$8)`,
      [
        `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name,
        email,
        phone,
        districtMatch || district,
        track,
        why,
        Date.now(),
      ]
    );
  } catch (err) {
    // DB down shouldn't block the applicant — still email the studio
    console.error("[academy] db save failed:", err);
  }

  if (!process.env.GMAIL_APP_PASSWORD) {
    console.warn("[academy] GMAIL_APP_PASSWORD missing — application stored but not emailed.");
    return NextResponse.json({ ok: true });
  }

  try {
    const trackLabel = TRACK_LABELS[track] || "Not specified";
    await transporter.sendMail({
      from: `"Oxsnow Academy" <${process.env.GMAIL_USER}>`,
      to: TO_EMAIL,
      replyTo: `"${name}" <${email}>`,
      subject: `[Academy] New application — ${name} (${trackLabel})`,
      text: [
        "New Oxsnow Academy application",
        "--------------------------------",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `District: ${district}`,
        `Track: ${trackLabel}`,
        "",
        "Why the Academy:",
        why,
        "",
        "—",
        "Oxsnow Studio · Maseru, Lesotho",
      ].join("\n"),
      html: `
  <div style="margin:0;padding:0;background:#0A0A0A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#0d0d0d;border-bottom:3px solid #E25822;padding:28px 32px;">
              <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.28em;text-transform:uppercase;color:#E25822;">Academy &mdash; Intake I</p>
              <h1 style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:900;color:#ffffff;">New application from ${escapeHtml(name)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#cfcfcf;line-height:1.9;">
              <p style="margin:0"><strong style="color:#8A8A8A;">Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#C0C0C0;">${escapeHtml(email)}</a></p>
              <p style="margin:0"><strong style="color:#8A8A8A;">Phone:</strong> ${escapeHtml(phone)}</p>
              <p style="margin:0"><strong style="color:#8A8A8A;">District:</strong> ${escapeHtml(district)}</p>
              <p style="margin:0"><strong style="color:#8A8A8A;">Track:</strong> ${escapeHtml(trackLabel)}</p>
              <p style="margin:18px 0 6px;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#6b6b6b;">Why the Academy</p>
              <div style="background:#0A0A0A;border:1px solid #2a2a2a;border-left:3px solid #E25822;border-radius:8px;padding:16px 18px;white-space:pre-wrap;">${escapeHtml(why)}</div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </div>`,
    });
  } catch (err) {
    console.error("[academy] email failed:", err);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405 });
}
