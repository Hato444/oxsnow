import { NextResponse } from "next/server";
import crypto from "crypto";
import { ensureSchema, query } from "@/lib/db";
import {
  createCustomerSession,
  destroyCustomerSession,
  getCustomerSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

// Device keys from the anonymous checkout flow can be adopted by an account
// on login, so rentals bought before signing in are not lost.
async function adoptDeviceEntitlements(customerId, deviceKey) {
  if (!deviceKey || deviceKey === customerId) return;
  await query(
    `INSERT INTO entitlements (user_key, movie_id, order_id, paid_at)
     SELECT $1, movie_id, order_id, paid_at FROM entitlements WHERE user_key = $2
     ON CONFLICT (user_key, movie_id) DO NOTHING`,
    [customerId, deviceKey]
  );
  await query("DELETE FROM entitlements WHERE user_key = $2 AND EXISTS (SELECT 1 FROM entitlements e2 WHERE e2.user_key = $1 AND e2.movie_id = entitlements.movie_id)", [customerId, deviceKey]);
}

export async function GET() {
  const customerId = await getCustomerSession();
  if (!customerId) {
    return NextResponse.json({ ok: true, authed: false });
  }
  try {
    await ensureSchema();
    const customer = await query(
      "SELECT id, email, name, created_at FROM customers WHERE id = $1",
      [customerId]
    );
    if (customer.rows.length === 0) {
      await destroyCustomerSession();
      return NextResponse.json({ ok: true, authed: false });
    }
    const ents = await query(
      "SELECT movie_id, paid_at FROM entitlements WHERE user_key = $1 ORDER BY paid_at DESC",
      [customerId]
    );
    return NextResponse.json({
      ok: true,
      authed: true,
      customer: customer.rows[0],
      entitlements: ents.rows,
    });
  } catch (err) {
    console.error("[account] me failed:", err);
    return NextResponse.json({ ok: false, error: "Could not load account." }, { status: 500 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const action = String(body.action || "login");
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim().slice(0, 80);
  const deviceKey = String(body.deviceKey || "").slice(0, 80);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  try {
    await ensureSchema();

    if (action === "register") {
      const existing = await query("SELECT id FROM customers WHERE email = $1", [email]);
      if (existing.rows.length > 0) {
        return NextResponse.json(
          { ok: false, error: "An account with this email already exists — sign in instead." },
          { status: 409 }
        );
      }
      const id = `cus_${crypto.randomBytes(8).toString("hex")}`;
      await query(
        "INSERT INTO customers (id, email, name, password_hash, created_at) VALUES ($1,$2,$3,$4,$5)",
        [id, email, name, hashPassword(password), Date.now()]
      );
      await adoptDeviceEntitlements(id, deviceKey);
      await createCustomerSession(id);
      return NextResponse.json({ ok: true, authed: true, customerId: id });
    }

    const found = await query("SELECT id, password_hash FROM customers WHERE email = $1", [email]);
    if (found.rows.length === 0 || !verifyPassword(password, found.rows[0].password_hash)) {
      return NextResponse.json(
        { ok: false, error: "Wrong email or password." },
        { status: 401 }
      );
    }
    const customerId = found.rows[0].id;
    await adoptDeviceEntitlements(customerId, deviceKey);
    await createCustomerSession(customerId);
    return NextResponse.json({ ok: true, authed: true, customerId });
  } catch (err) {
    console.error("[account] auth failed:", err);
    return NextResponse.json({ ok: false, error: "Account service unavailable." }, { status: 500 });
  }
}

export async function DELETE() {
  await destroyCustomerSession();
  return NextResponse.json({ ok: true });
}
