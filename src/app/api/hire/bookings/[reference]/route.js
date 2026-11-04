import { NextResponse } from "next/server";
import { cancelCustomerBooking, getCustomerBooking, HireError } from "@/lib/hire/data";
import { getCustomerSession } from "@/lib/auth";

export async function GET(_request, { params }) {
  const customerId = await getCustomerSession();
  if (!customerId) {
    return NextResponse.json({ ok: false, error: "Sign in to view this booking." }, { status: 401 });
  }
  const { reference } = await params;
  try {
    const booking = await getCustomerBooking(reference, customerId);
    if (!booking) return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
    return NextResponse.json({ ok: true, booking });
  } catch (err) {
    console.error("[hire/booking] load failed:", err);
    return NextResponse.json({ ok: false, error: "Could not load booking." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const customerId = await getCustomerSession();
  if (!customerId) {
    return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  if (body?.action !== "cancel") {
    return NextResponse.json({ ok: false, error: "Unsupported action." }, { status: 400 });
  }
  const { reference } = await params;
  try {
    const result = await cancelCustomerBooking(reference, customerId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof HireError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[hire/booking] cancel failed:", err);
    return NextResponse.json({ ok: false, error: "Could not cancel booking." }, { status: 500 });
  }
}
