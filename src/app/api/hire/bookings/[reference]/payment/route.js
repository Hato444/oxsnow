import { NextResponse } from "next/server";
import { HireError, reportPayment } from "@/lib/hire/data";
import { getCustomerSession } from "@/lib/auth";

export async function POST(request, { params }) {
  const customerId = await getCustomerSession();
  if (!customerId) {
    return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }
  const { reference } = await params;
  try {
    const result = await reportPayment(reference, customerId, body);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof HireError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[hire/payment] failed:", err);
    return NextResponse.json({ ok: false, error: "Could not report payment." }, { status: 500 });
  }
}
