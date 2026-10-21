import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";
import { CULTURAL_PASS_ID, streamUrlFor } from "@/lib/payments/catalog";

// GET /api/stream?title=Ho%20Lekane&userKey=<device-or-customer-id>
//
// Releases the full-film Blob URL ONLY when the caller holds an entitlement
// for that title (rental) or the Cultural Pass. The URL never ships in the
// client bundle; everything else 403s.
export async function GET(request) {
  const title = request.nextUrl.searchParams.get("title") || "";
  let userKey = request.nextUrl.searchParams.get("userKey") || "";

  // A signed-in customer always reads under their customer id; the device
  // key is only a fallback for anonymous renters.
  const customerId = await getCustomerSession();
  if (customerId) userKey = customerId;

  if (!title || !userKey) {
    return NextResponse.json({ ok: false, error: "Missing parameters." }, { status: 400 });
  }

  const url = streamUrlFor(title);
  if (!url) {
    return NextResponse.json(
      { ok: false, error: "This film isn't available for streaming yet.", available: false },
      { status: 404 }
    );
  }

  try {
    await ensureSchema();
    const owned = await query(
      `SELECT 1 FROM entitlements
       WHERE user_key = $1 AND (movie_id = $2 OR movie_id = $3) LIMIT 1`,
      [userKey, title, CULTURAL_PASS_ID]
    );
    if (owned.rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Payment required to watch this film.", entitled: false },
        { status: 403 }
      );
    }
    return NextResponse.json({ ok: true, url, entitled: true });
  } catch (err) {
    console.error("[stream] entitlement check failed:", err);
    return NextResponse.json({ ok: false, error: "Stream check failed." }, { status: 500 });
  }
}
