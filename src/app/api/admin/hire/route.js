import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import {
  addMaintenance,
  adminOverview,
  deleteMaintenance,
  getBookingById,
  HireError,
  recordPayment,
  saveEquipment,
  saveSettings,
  setEquipmentArchived,
  transitionBooking,
  updateQuoteStatus,
} from "@/lib/hire/data";
import { BOOKING_STATUS_LABELS } from "@/lib/hire/rules.mjs";
import { bookingEmailHtml, sendHireMail } from "@/lib/hire/email";

export async function GET() {
  if (!(await verifySession())) {
    return NextResponse.json({ ok: false, error: "Founder access required." }, { status: 401 });
  }
  try {
    const overview = await adminOverview();
    return NextResponse.json({ ok: true, ...overview });
  } catch (err) {
    console.error("[admin/hire] overview failed:", err);
    return NextResponse.json({ ok: false, error: "Could not load hire dashboard." }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await verifySession())) {
    return NextResponse.json({ ok: false, error: "Founder access required." }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const actor = "founder";
  const action = body?.action;

  try {
    let result;
    if (action === "equipment-save") {
      result = await saveEquipment(body.equipment, actor);
    } else if (action === "equipment-archive") {
      result = await setEquipmentArchived(body.id, Boolean(body.archived), actor);
    } else if (action === "maintenance-add") {
      result = await addMaintenance(body.maintenance, actor);
    } else if (action === "maintenance-delete") {
      result = await deleteMaintenance(body.id, actor);
    } else if (action === "booking-transition") {
      result = await transitionBooking({
        bookingId: body.bookingId,
        action: body.transition,
        actor,
        extra: body.extra || {},
      });
      const full = await getBookingById(result.id);
      if (full?.email) {
        const label = BOOKING_STATUS_LABELS[result.status] || result.status;
        const mail = await sendHireMail({
          to: full.email,
          subject: `Hire booking ${full.reference} — ${label}`,
          text: `Hi ${full.customerName},\n\nYour equipment hire booking ${full.reference} (${full.startsOn} → ${full.endsOn}) is now: ${label}.\n\n${full.staffInstructions || ""}\n\nOxsnow Studio`,
          html: bookingEmailHtml(
            full,
            `Booking ${label.toLowerCase()}`,
            `Your hire request ${full.reference} was updated by Oxsnow Studio.`,
            [["Status", label]],
            full.staffInstructions || ""
          ),
        });
        result.email = mail;
      }
    } else if (action === "payment-record") {
      result = await recordPayment(body.payment, actor);
    } else if (action === "quote-status") {
      result = await updateQuoteStatus(body.id, body.status, actor);
    } else if (action === "settings-save") {
      result = await saveSettings(
        { paymentInstructions: body.paymentInstructions, terms: body.terms },
        actor
      );
    } else {
      return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    if (err instanceof HireError) {
      return NextResponse.json(
        { ok: false, error: err.message, code: err.code },
        { status: err.status }
      );
    }
    console.error("[admin/hire] action failed:", err);
    return NextResponse.json({ ok: false, error: "Could not complete that action." }, { status: 500 });
  }
}
