import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";
import { verifySession } from "@/lib/auth";

// GET /api/admin — founder-only operational overview.
export async function GET() {
  if (!(await verifySession())) {
    return NextResponse.json({ ok: false, error: "Founder access required." }, { status: 401 });
  }

  try {
    await ensureSchema();

    const [orders, revenue, entitlements, customers, newsletter, academyApps, audit, passHolders] =
      await Promise.all([
        query(
          `SELECT id, movie_id, amount_minor, currency, status, phone, provider, provider_ref, created_at, expires_at
           FROM orders ORDER BY created_at DESC LIMIT 100`
        ),
        query(
          `SELECT
             COUNT(*) FILTER (WHERE status = 'paid') AS paid_count,
             COALESCE(SUM(amount_minor) FILTER (WHERE status = 'paid'), 0) AS revenue_minor,
             COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
             COUNT(*) FILTER (WHERE status IN ('failed','cancelled')) AS failed_count,
             COUNT(*) FILTER (WHERE status = 'expired') AS expired_count,
             COUNT(*) AS total
           FROM orders`
        ),
        query(
          `SELECT movie_id, COUNT(*) AS holders FROM entitlements GROUP BY movie_id ORDER BY holders DESC`
        ),
        query("SELECT COUNT(*) AS total FROM customers"),
        query("SELECT email, created_at FROM newsletter ORDER BY created_at DESC LIMIT 200"),
        query(
          `SELECT id, name, email, phone, district, track, status, created_at
           FROM academy_applications ORDER BY created_at DESC LIMIT 100`
        ),
        query(
          `SELECT order_id, event, detail, created_at FROM payment_audit
           ORDER BY id DESC LIMIT 50`
        ),
        query(
          `SELECT COUNT(*) AS active FROM entitlements
           WHERE movie_id = '__cultural_pass__' AND paid_at > $1`,
          [Date.now() - 30 * 24 * 60 * 60 * 1000]
        ),
      ]);

    return NextResponse.json({
      ok: true,
      orders: orders.rows,
      revenue: revenue.rows[0],
      entitlements: entitlements.rows,
      customers: customers.rows[0],
      newsletter: newsletter.rows,
      academy: academyApps.rows,
      audit: audit.rows,
      passHolders: passHolders.rows[0],
    });
  } catch (err) {
    console.error("[admin] overview failed:", err);
    return NextResponse.json({ ok: false, error: "Could not load dashboard." }, { status: 500 });
  }
}
