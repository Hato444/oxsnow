import crypto from "crypto";
import { ensureSchema as productionSchema, query as productionQuery, withTransaction as productionTransaction } from "../db.js";
import { PASS_ID, FILM_PRICE, PASS_PRICE, PASS_DURATION, SESSION_DURATION, PENDING_DURATION } from "./rules.mjs";

let ensureSchema = productionSchema;
let query = productionQuery;
let withTransaction = productionTransaction;

export function useTestDatabase(pool) {
  if (process.env.NODE_ENV !== "test") throw new Error("Test database injection is disabled.");
  ensureSchema = async () => {};
  query = (sql, params) => pool.query(sql, params);
  withTransaction = async (fn) => {
    const client = await pool.connect();
    try { await client.query("BEGIN"); const result = await fn(client); await client.query("COMMIT"); return result; }
    catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
  };
}

async function lockCustomer(client, customerId) {
  const result = await client.query("SELECT id FROM customers WHERE id=$1 FOR UPDATE", [customerId]);
  if (!result.rows.length) throw new Error("Customer not found.");
}

// Call only after independently verifying a provider transaction. The simulator
// invokes this inside its explicitly isolated local database.
export async function grantVerifiedOrder(client, order, reference, now = Date.now()) {
  if (!reference || order.status !== "paid" || order.amount_minor !== (order.movie_id === PASS_ID ? PASS_PRICE : FILM_PRICE) || order.currency !== "LSL") throw new Error("Invalid verified order.");
  const pass = order.movie_id === PASS_ID;
  await client.query(
    `INSERT INTO vod_grants (order_id, customer_id, movie_id, provider_reference, purchased_credits, remaining_credits, activated_at, expires_at)
     VALUES ($1,$2,$3,$4,$5,$5,$6,$7) ON CONFLICT (order_id) DO NOTHING`,
    [order.id, order.user_key, order.movie_id, reference, pass ? 0 : 2, now, pass ? now + PASS_DURATION : null]
  );
}

export async function simulatePurchase(customerId, movieId, outcome) {
  await ensureSchema();
  return withTransaction(async (client) => {
    await lockCustomer(client, customerId);
    const now = Date.now();
    const id = `test_${crypto.randomUUID()}`;
    const reference = `SIM-${crypto.randomUUID()}`;
    const amount = movieId === PASS_ID ? PASS_PRICE : FILM_PRICE;
    const status = outcome === "success" ? "paid" : "failed";
    await client.query(`INSERT INTO orders (id,movie_id,user_key,amount_minor,currency,status,provider,provider_ref,created_at,expires_at)
      VALUES ($1,$2,$3,$4,'LSL',$5,'simulator',$6,$7,$8)`, [id, movieId, customerId, amount, status, reference, now, now + 900000]);
    if (status === "paid") await grantVerifiedOrder(client, { id, movie_id: movieId, user_key: customerId, amount_minor: amount, currency: "LSL", status }, reference, now);
    return { orderId: id, status };
  });
}

export async function getVodStatus(customerId, movieId = "") {
  await ensureSchema();
  const now = Date.now();
  const pass = await query("SELECT MAX(expires_at) AS expires_at FROM vod_grants WHERE customer_id=$1 AND movie_id=$2 AND expires_at>$3", [customerId, PASS_ID, now]);
  const credits = await query(`SELECT movie_id, SUM(purchased_credits)::int AS purchased, SUM(remaining_credits)::int AS remaining
    FROM vod_grants WHERE customer_id=$1 AND movie_id<>$2 GROUP BY movie_id ORDER BY movie_id`, [customerId, PASS_ID]);
  const active = movieId ? await query("SELECT id FROM vod_sessions WHERE customer_id=$1 AND movie_id=$2 AND status IN ('pending','active') AND expires_at>$3 LIMIT 1", [customerId, movieId, now]) : { rows: [] };
  const legacy = await query("SELECT movie_id, paid_at FROM entitlements WHERE user_key=$1 AND movie_id IN ($2,$3)", [customerId, movieId, PASS_ID]);
  const legacyPass = legacy.rows.find((row) => row.movie_id === PASS_ID && Number(row.paid_at) + PASS_DURATION > now);
  return { passExpiresAt: Number(pass.rows[0]?.expires_at) || (legacyPass ? Number(legacyPass.paid_at) + PASS_DURATION : null), credits: credits.rows, legacyFilm: legacy.rows.some((row) => row.movie_id === movieId), activeSession: Boolean(active.rows.length) };
}

export async function startSession(customerId, movieId) {
  await ensureSchema();
  return withTransaction(async (client) => {
    await lockCustomer(client, customerId);
    const now = Date.now();
    const existing = await client.query("SELECT * FROM vod_sessions WHERE customer_id=$1 AND movie_id=$2 AND status IN ('pending','active') AND expires_at>$3 ORDER BY created_at DESC LIMIT 1", [customerId, movieId, now]);
    if (existing.rows.length) return existing.rows[0];
    const pass = await client.query("SELECT order_id, expires_at FROM vod_grants WHERE customer_id=$1 AND movie_id=$2 AND expires_at>$3 ORDER BY expires_at DESC LIMIT 1", [customerId, PASS_ID, now]);
    const legacy = await client.query("SELECT movie_id,paid_at FROM entitlements WHERE user_key=$1 AND movie_id IN ($2,$3)", [customerId, movieId, PASS_ID]);
    const legacyFilm = legacy.rows.some((row) => row.movie_id === movieId);
    const legacyPass = legacy.rows.find((row) => row.movie_id === PASS_ID && Number(row.paid_at) + PASS_DURATION > now);
    const credit = pass.rows.length || legacyFilm || legacyPass ? { rows: [] } : await client.query("SELECT order_id FROM vod_grants WHERE customer_id=$1 AND movie_id=$2 AND remaining_credits>0 ORDER BY activated_at, order_id LIMIT 1", [customerId, movieId]);
    if (!pass.rows.length && !credit.rows.length && !legacyFilm && !legacyPass) throw new Error("No viewing credits remaining.");
    const id = crypto.randomUUID();
    const type = pass.rows.length ? "pass" : credit.rows.length ? "credit" : legacyFilm ? "legacy" : "legacy_pass";
    const result = await client.query(`INSERT INTO vod_sessions (id,customer_id,movie_id,access_type,grant_order_id,status,created_at,expires_at)
      VALUES ($1,$2,$3,$4,$5,'pending',$6,$7) RETURNING *`, [id, customerId, movieId, type, (pass.rows[0] || credit.rows[0])?.order_id || null, now, Math.min(now + PENDING_DURATION, Number(pass.rows[0]?.expires_at) || (legacyPass && !legacyFilm ? Number(legacyPass.paid_at) + PASS_DURATION : Infinity))]);
    return result.rows[0];
  });
}

export async function sessionEvent(customerId, id, event, position) {
  await ensureSchema();
  return withTransaction(async (client) => {
    await lockCustomer(client, customerId);
    const now = Date.now();
    const result = await client.query("SELECT * FROM vod_sessions WHERE id=$1 AND customer_id=$2 FOR UPDATE", [id, customerId]);
    const session = result.rows[0];
    if (!session || Number(session.expires_at) <= now || !["pending", "active"].includes(session.status)) throw new Error("Playback session expired.");
    if (event === "playing" && session.status === "pending") {
      if (session.access_type === "credit") {
        const debit = await client.query("UPDATE vod_grants SET remaining_credits = remaining_credits - 1 WHERE order_id=$1 AND remaining_credits>0 RETURNING order_id", [session.grant_order_id]);
        if (!debit.rows.length) throw new Error("No viewing credits remaining.");
      }
      let expires = now + SESSION_DURATION;
      if (session.access_type === "pass") {
        const pass = await client.query("SELECT expires_at FROM vod_grants WHERE order_id=$1", [session.grant_order_id]);
        expires = Math.min(expires, Number(pass.rows[0].expires_at));
      }
      if (session.access_type === "legacy_pass") {
        const pass = await client.query("SELECT paid_at FROM entitlements WHERE user_key=$1 AND movie_id=$2", [customerId, PASS_ID]);
        expires = Math.min(expires, Number(pass.rows[0].paid_at) + PASS_DURATION);
      }
      await client.query("UPDATE vod_sessions SET status='active',started_at=$2,expires_at=$3 WHERE id=$1", [id, now, expires]);
    } else if (event === "progress") {
      if (session.status !== "active" || !Number.isFinite(position) || position < 0) throw new Error("Invalid playback position.");
      await client.query("UPDATE vod_sessions SET position_seconds=$2 WHERE id=$1", [id, Math.min(Math.floor(position), 86400)]);
    } else if (event === "complete") {
      await client.query("UPDATE vod_sessions SET status='complete',completed_at=$2 WHERE id=$1", [id, now]);
    } else if (event !== "playing") throw new Error("Invalid session event.");
    return { ok: true };
  });
}

export async function getSession(customerId, id) {
  await ensureSchema();
  const result = await query("SELECT * FROM vod_sessions WHERE id=$1 AND customer_id=$2 AND status IN ('pending','active') AND expires_at>$3", [id, customerId, Date.now()]);
  return result.rows[0] || null;
}
