import nodemailer from "nodemailer";

const TO_EMAIL = process.env.HIRE_NOTIFY_EMAIL || "oxsnowstudio@gmail.com";
const SITE_LABEL = "Oxsnow Studio Hire";

export function emailConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function wrap({ title, intro, rows = [], body = "", footer = "" }) {
  const rowsHtml = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:0 0 14px;width:140px;vertical-align:top;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#6b6b6b;">${escapeHtml(label)}</td>
        <td style="padding:0 0 14px;vertical-align:top;font-size:14px;color:#e8e8e8;">${value}</td>
      </tr>`
    )
    .join("");
  return `
  <div style="margin:0;padding:0;background:#0a0a0a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#0d0d0d;border-bottom:3px solid #e25822;padding:26px 30px;">
              <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.28em;text-transform:uppercase;color:#e25822;">${SITE_LABEL}</p>
              <h1 style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:900;color:#fff;">${escapeHtml(title)}</h1>
              ${intro ? `<p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8a8a8a;">${escapeHtml(intro)}</p>` : ""}
            </td>
          </tr>
          <tr><td style="padding:26px 30px 6px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;">${rowsHtml}</table>
            ${body ? `<div style="margin:4px 0 20px;background:#0a0a0a;border:1px solid #2a2a2a;border-left:3px solid #e25822;border-radius:8px;padding:16px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#cfcfcf;white-space:pre-wrap;">${escapeHtml(body)}</div>` : ""}
          </td></tr>
          <tr><td style="background:#0d0d0d;border-top:1px solid #2a2a2a;padding:18px 30px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6b6b6b;">${footer || "Oxsnow Studio &middot; Maseru, Lesotho &middot; +266 6279 7598"}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </div>`;
}

export async function sendHireMail({ to, subject, text, html, replyTo }) {
  if (!emailConfigured()) {
    return {
      ok: false,
      configured: false,
      error: "Email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.",
    };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    await transporter.sendMail({
      from: `"${SITE_LABEL}" <${process.env.GMAIL_USER}>`,
      to: to || TO_EMAIL,
      replyTo,
      subject,
      text,
      html,
    });
    return { ok: true, configured: true };
  } catch (err) {
    console.error("[hire-email] send failed:", err);
    return { ok: false, configured: true, error: "Email could not be sent." };
  }
}

export function bookingRows(booking, extra = []) {
  const money = (minor) => `M ${(Number(minor || 0) / 100).toFixed(2)}`;
  const items = (booking.items || [])
    .map((i) => `${escapeHtml(i.name)} × ${i.quantity}`)
    .join("<br/>");
  return [
    ["Reference", `<strong>${escapeHtml(booking.reference)}</strong>`],
    ["Customer", escapeHtml(booking.customerName)],
    ["Email", `<a href="mailto:${escapeHtml(booking.email)}" style="color:#c0c0c0;">${escapeHtml(booking.email)}</a>`],
    ["Phone", escapeHtml(booking.phone)],
    ["Dates", `${escapeHtml(booking.startsOn)} → ${escapeHtml(booking.endsOn)} (${booking.rentalDays} day${booking.rentalDays === 1 ? "" : "s"})`],
    ["Items", items || "—"],
    ["Rental", money(booking.rentalSubtotalMinor)],
    ["Refundable deposit", money(booking.depositTotalMinor)],
    ["Total", `<strong>${money(booking.totalMinor)}</strong>`],
    ...extra,
  ];
}

export function bookingEmailHtml(booking, title, intro, extra = [], body = "") {
  return wrap({ title, intro, rows: bookingRows(booking, extra), body });
}
