import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";
import {
  CURRENCY,
  PRICE_MINOR,
  providerConfigured,
  simulateEnabled,
  createPayment,
  queryTransaction,
  isSimRef,
} from "@/lib/payments/mpesa";
import { CULTURAL_PASS_ID, streamUrlFor } from "@/lib/payments/catalog";
import { films } from "@/lib/site";

const ORDER_TTL_MS = 15 * 60 * 1000;
const PASS_PRICE_MINOR = 9900; // M99.00 Cultural Pass (SVOD, 30 days)

function audit(orderId, event, detail = "") {
  query(
    "INSERT INTO payment_audit (order_id, event, detail, created_at) VALUES ($1,$2,$3,$4)",
    [orderId, event, detail.slice(0, 300), Date.now()]
  ).catch(() => {});
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  let movieId = String(body.movieId || "");
  let userKey = String(body.userKey || "").slice(0, 80);
  const phone = String(body.phone || "").replace(/[\s-]/g, "").slice(0, 15);

  // Signed-in customers pay under their account id, not the device key.
  const customerId = await getCustomerSession();
  if (customerId) userKey = customerId;

  if (!userKey) {
    return NextResponse.json({ ok: false, error: "Device key required." }, { status: 400 });
  }

  // phone: Lesotho mobile format 5xxxxxxx (8 digits) or +266 prefix
  const normalized = phone.startsWith("+266") ? phone.slice(4) : phone.replace(/^266/, "");
  if (!/^5\d{7}$/.test(normalized)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid Lesotho M-Pesa number (8 digits starting with 5)." },
      { status: 400 }
    );
  }

  const isPass = movieId === CULTURAL_PASS_ID;
  let movie;
  if (isPass) {
    movie = { title: CULTURAL_PASS_ID, displayName: "Cultural Pass" };
  } else {
    const found = films.find(
      (f) => f.title === movieId || f.title.toLowerCase() === movieId.toLowerCase()
    );
    if (!found || !streamUrlFor(found.title)) {
      return NextResponse.json(
        { ok: false, error: "This film isn't available for purchase yet." },
        { status: 400 }
      );
    }
    movie = { ...found, displayName: found.title };
  }

  const amountMinor = isPass ? PASS_PRICE_MINOR : PRICE_MINOR;

  try {
    await ensureSchema();

    // already owns it? no duplicate charge
    const owned = await query(
      "SELECT order_id FROM entitlements WHERE user_key = $1 AND movie_id = $2",
      [userKey, movie.title]
    );
    if (owned.rows.length > 0) {
      return NextResponse.json({ ok: true, status: "purchased", alreadyOwned: true });
    }

    // Cultural Pass active within its window? don't charge again
    if (isPass) {
      const active = await query(
        `SELECT 1 FROM entitlements
         WHERE user_key = $1 AND movie_id = $2 AND paid_at > $3 LIMIT 1`,
        [userKey, CULTURAL_PASS_ID, Date.now() - 30 * 24 * 60 * 60 * 1000]
      );
      if (active.rows.length > 0) {
        return NextResponse.json({ ok: true, status: "purchased", alreadyOwned: true });
      }
    }

    // reuse a live pending order for the same movie + user (prevents duplicate orders from double-clicks)
    const existing = await query(
      `SELECT * FROM orders WHERE movie_id = $1 AND user_key = $2 AND status IN ('pending','awaiting_authorisation')
       AND expires_at > $3 ORDER BY created_at DESC LIMIT 1`,
      [movie.title, userKey, Date.now()]
    ).catch(() => null);

    let order;
    if (existing && existing.rows.length > 0) {
      order = existing.rows[0];
    } else {
      const id = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = Date.now();
      await query(
        `INSERT INTO orders (id, movie_id, user_key, amount_minor, currency, status, phone, provider, created_at, expires_at)
         VALUES ($1,$2,$3,$4,$5,'pending',$6,'mpesa',$7,$8)`,
        [id, movie.title, userKey, amountMinor, CURRENCY, normalized, now, now + ORDER_TTL_MS]
      );
      const res = await query("SELECT * FROM orders WHERE id = $1", [id]);
      order = res.rows[0];
      audit(id, "order_created", `amount=${amountMinor} ${CURRENCY}`);
    }

    if (simulateEnabled()) {
      const providerRef = `SIM-${order.id.replace(/\D/g, "")}`;
      await query(
        "UPDATE orders SET status = 'awaiting_authorisation', provider_ref = $1 WHERE id = $2",
        [providerRef, order.id]
      );
      audit(order.id, "sim_initiated", providerRef);
      return NextResponse.json({
        ok: true,
        orderId: order.id,
        status: "awaiting_authorisation",
        simulated: true,
        amountMinor,
        currency: CURRENCY,
      });
    }

    if (!providerConfigured()) {
      audit(order.id, "config_missing");
      return NextResponse.json(
        {
          ok: false,
          error:
            "M-Pesa live payments aren't activated yet — merchant approval pending. Your order is saved and will work once Vodacom activates the API.",
          orderId: order.id,
          configMissing: true,
        },
        { status: 503 }
      );
    }

    try {
      const result = await createPayment({ ...order, movie: movie.displayName }, normalized);
      await query(
        "UPDATE orders SET status = 'awaiting_authorisation', provider_ref = $1 WHERE id = $2",
        [String(result?.reference || ""), order.id]
      );
      audit(order.id, "payment_initiated");
      return NextResponse.json({
        ok: true,
        orderId: order.id,
        status: "awaiting_authorisation",
        amountMinor,
        currency: CURRENCY,
      });
    } catch (err) {
      audit(order.id, "initiate_failed", err.code || "unknown");
      if (err.code === "SCHEMA_TODO") {
        return NextResponse.json(
          { ok: false, error: "Provider request schema pending portal access.", orderId: order.id },
          { status: 503 }
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("[payments] create failed:", err);
    return NextResponse.json({ ok: false, error: "Could not create order." }, { status: 500 });
  }
}

export async function GET(request) {
  const orderId = request.nextUrl.searchParams.get("orderId") || "";
  let userKey = request.nextUrl.searchParams.get("userKey") || "";

  const customerId = await getCustomerSession();
  if (customerId) userKey = customerId;

  if (!orderId || !userKey) {
    return NextResponse.json({ ok: false, error: "Missing parameters." }, { status: 400 });
  }

  try {
    await ensureSchema();
    const res = await query("SELECT * FROM orders WHERE id = $1", [orderId]);
    if (res.rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
    }
    const order = res.rows[0];

    if (order.expires_at < Date.now() && order.status !== "paid") {
      if (order.status !== "expired") {
        await query("UPDATE orders SET status = 'expired' WHERE id = $1 AND status != 'paid'", [orderId]);
        audit(orderId, "expired");
      }
      return NextResponse.json({ ok: true, status: "expired" });
    }

    if (order.status === "awaiting_authorisation" && isSimRef(order.provider_ref)) {
      const simStatus = await queryTransaction(order.provider_ref);
      if (simStatus.status === "successful") {
        await query("UPDATE orders SET status = 'paid' WHERE id = $1", [orderId]);
        await query(
          "INSERT INTO entitlements (user_key, movie_id, order_id, paid_at) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING",
          [userKey, order.movie_id, orderId, Date.now()]
        );
        audit(orderId, "sim_verified_paid");
        return NextResponse.json({ ok: true, status: "paid" });
      }
      if (simStatus.status === "failed" || simStatus.status === "cancelled") {
        await query("UPDATE orders SET status = $1 WHERE id = $2", [simStatus.status, orderId]);
        audit(orderId, `sim_${simStatus.status}`);
        return NextResponse.json({ ok: true, status: simStatus.status });
      }
    }

    if (order.status === "awaiting_authorisation" && providerConfigured()) {
      // TODO(provider): official Query Txn — only authoritative confirm marks paid.
      audit(orderId, "query_pending_schema");
    }

    return NextResponse.json({ ok: true, status: order.status });
  } catch (err) {
    console.error("[payments] status failed:", err);
    return NextResponse.json({ ok: false, error: "Status check failed." }, { status: 500 });
  }
}
