import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { films } from "@/lib/site";
import { simulatePurchase } from "@/lib/vod/data";
import { PASS_ID, simulatorAllowed } from "@/lib/vod/rules.mjs";

export async function GET() {
  return NextResponse.json({ enabled: simulatorAllowed(process.env) });
}

export async function POST(request) {
  if (!simulatorAllowed(process.env)) return new NextResponse(null, { status: 404 });
  const customerId = await getCustomerSession();
  if (!customerId) return NextResponse.json({ ok: false, error: "Sign in to test purchases." }, { status: 401 });
  try {
    const { movieId, outcome } = await request.json();
    if ((movieId !== PASS_ID && !films.some((film) => film.title === movieId)) || !["success", "failed"].includes(outcome)) return NextResponse.json({ ok: false, error: "Invalid simulator request." }, { status: 400 });
    const result = await simulatePurchase(customerId, movieId, outcome);
    return NextResponse.json({ ok: true, simulated: true, ...result });
  } catch {
    return NextResponse.json({ ok: false, error: "Simulator failed." }, { status: 500 });
  }
}
