import { NextResponse } from "next/server";
import { createBooking, getCustomerBookings, HireError } from "@/lib/hire/data";
import { getCustomerSession } from "@/lib/auth";
import { bookingEmailHtml, sendHireMail } from "@/lib/hire/email";

export async function GET() {
  const customerId = await getCustomerSession();
  if (!customerId) {
    return NextResponse.json({ ok: false, error: "Sign in to view bookings." }, { status: 401 });
  }
  try {
    const bookings = await getCustomerBookings(customerId);
    return NextResponse.json({ ok: true, bookings });
  } catch (err) {
    console.error("[hire/bookings] list failed:", err);
    return NextResponse.json({ ok: false, error: "Could not load bookings." }, { status: 500 });
  }
}

export async function POST(request) {
  const customerId = await getCustomerSession();
  if (!customerId) {
    return NextResponse.json({ ok: false, error: "Sign in to submit a booking request." }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  try {
    const booking = await createBooking({
      customerId,
      contact: body?.contact || {},
      start: body?.start,
      end: body?.end,
      items: body?.items,
    });

    const html = bookingEmailHtml(
      booking,
      "New booking request",
      "A customer submitted an equipment hire request. Pending requests do not hold stock.",
      [["Payment", booking.paymentStatus]]
    );
    const mail = await sendHireMail({
      subject: `[Hire booking] ${booking.reference} — ${booking.customerName}`,
      text: `New hire booking ${booking.reference}\n\n${booking.customerName} (${booking.email}, ${booking.phone})\n${booking.startsOn} → ${booking.endsOn} (${booking.rentalDays} days)\n\n${booking.items.map((i) => `${i.name} x${i.quantity}`).join("\n")}\n\nRental: M ${(booking.rentalSubtotalMinor / 100).toFixed(2)}\nDeposit: M ${(booking.depositTotalMinor / 100).toFixed(2)}\nTotal: M ${(booking.totalMinor / 100).toFixed(2)}`,
      html,
      replyTo: `"${booking.customerName}" <${booking.email}>`,
    });

    const confirmation = await sendHireMail({
      to: booking.email,
      subject: `We received your hire request — ${booking.reference}`,
      text: `Hi ${booking.customerName},\n\nWe received your equipment hire request ${booking.reference} for ${booking.startsOn} → ${booking.endsOn}. It is pending studio review — pending requests do not reserve equipment.\n\nTotal: M ${(booking.totalMinor / 100).toFixed(2)} (includes refundable deposit of M ${(booking.depositTotalMinor / 100).toFixed(2)}).\n\nDo not send payment until studio staff confirm your booking and payment details.\n\nOxsnow Studio`,
      html: bookingEmailHtml(
        booking,
        "Request received",
        "Your request is pending studio review. Pending requests do not reserve equipment.",
        [["Next step", "Wait for Oxsnow staff to confirm availability and payment details."]]
      ),
    });

    return NextResponse.json({
      ok: true,
      booking,
      email: { staff: mail, customer: confirmation },
    });
  } catch (err) {
    if (err instanceof HireError) {
      return NextResponse.json(
        { ok: false, error: err.message, code: err.code },
        { status: err.status }
      );
    }
    console.error("[hire/bookings] create failed:", err);
    return NextResponse.json({ ok: false, error: "Could not submit your booking." }, { status: 500 });
  }
}
