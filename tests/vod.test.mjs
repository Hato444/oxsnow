import test from "node:test";
import assert from "node:assert/strict";
import { newDb } from "pg-mem";
import { PASS_ID, PASS_DURATION, simulatorAllowed } from "../src/lib/vod/rules.mjs";

process.env.NODE_ENV = "test";
const vod = await import("../src/lib/vod/data.js");
const memory = newDb();
memory.public.none(`
 CREATE TABLE customers (id text primary key);
 CREATE TABLE orders (id text primary key, movie_id text, user_key text, amount_minor integer, currency text, status text, provider text, provider_ref text, created_at bigint, expires_at bigint);
 CREATE TABLE entitlements (user_key text, movie_id text, order_id text, paid_at bigint);
 CREATE TABLE vod_grants (order_id text primary key, customer_id text, movie_id text, provider_reference text, purchased_credits integer, remaining_credits integer, activated_at bigint, expires_at bigint);
 CREATE TABLE vod_sessions (id text primary key, customer_id text, movie_id text, access_type text, grant_order_id text, status text, created_at bigint, started_at bigint, expires_at bigint, completed_at bigint, position_seconds integer default 0);
 INSERT INTO customers VALUES ('customer');
`);
const { Pool } = memory.adapters.createPg();
const pool = new Pool();
vod.useTestDatabase(pool);

test("development simulator requires an explicit isolated loopback database and cannot run in production", () => {
  const env = { NODE_ENV: "development", VOD_SIMULATE: "1", POSTGRES_URL: "postgres://localhost/test", VOD_TEST_DATABASE_URL: "postgres://localhost/test" };
  assert.equal(simulatorAllowed(env), true);
  assert.equal(simulatorAllowed({ ...env, NODE_ENV: "production" }), false);
  assert.equal(simulatorAllowed({ ...env, POSTGRES_URL: "postgres://example.com/prod" }), false);
  assert.equal(simulatorAllowed({ ...env, POSTGRES_URL: "postgres://example.com/prod", VOD_TEST_DATABASE_URL: "postgres://example.com/prod" }), false);
});

test("purchase, failed payment, resume, completion, second viewing and pass", async () => {
  await vod.simulatePurchase("customer", "Film", "failed");
  assert.equal((await vod.getVodStatus("customer", "Film")).credits.length, 0);
  await vod.simulatePurchase("customer", "Film", "success");
  assert.equal((await vod.getVodStatus("customer", "Film")).credits[0].remaining, 2);
  const stored = (await pool.query("SELECT * FROM orders WHERE movie_id=$1 AND status='paid'", ["Film"])).rows[0];
  await vod.grantVerifiedOrder(pool, stored, stored.provider_ref);
  assert.equal((await vod.getVodStatus("customer", "Film")).credits[0].remaining, 2);
  const first = await vod.startSession("customer", "Film");
  assert.equal((await vod.getVodStatus("customer", "Film")).credits[0].remaining, 2);
  await vod.sessionEvent("customer", first.id, "playing");
  await vod.sessionEvent("customer", first.id, "progress", 42);
  await vod.sessionEvent("customer", first.id, "playing");
  assert.equal((await vod.startSession("customer", "Film")).id, first.id);
  assert.equal((await vod.startSession("customer", "Film")).position_seconds, 42);
  assert.equal((await vod.getVodStatus("customer", "Film")).credits[0].remaining, 1);
  await vod.sessionEvent("customer", first.id, "complete");
  const second = await vod.startSession("customer", "Film");
  assert.notEqual(second.id, first.id);
  await vod.sessionEvent("customer", second.id, "playing");
  await vod.sessionEvent("customer", second.id, "complete");
  assert.equal((await vod.getVodStatus("customer", "Film")).credits[0].remaining, 0);
  await assert.rejects(vod.startSession("customer", "Film"), /No viewing credits/);
  await vod.simulatePurchase("customer", "Film", "success");
  await vod.simulatePurchase("customer", PASS_ID, "success");
  const status = await vod.getVodStatus("customer", "Film");
  assert.ok(status.passExpiresAt > Date.now() + PASS_DURATION - 5000);
  const passSession = await vod.startSession("customer", "Film");
  await vod.sessionEvent("customer", passSession.id, "playing");
  assert.equal((await vod.getVodStatus("customer", "Film")).credits[0].remaining, 2);
  await vod.sessionEvent("customer", passSession.id, "complete");
  await pool.query("UPDATE vod_grants SET expires_at=$1 WHERE movie_id=$2", [Date.now() - 1, PASS_ID]);
  assert.equal((await vod.getVodStatus("customer", "Film")).passExpiresAt, null);
});

test("legacy film entitlements are retained without spending newly purchased credits", async () => {
  await pool.query("INSERT INTO entitlements VALUES ($1,$2,$3,$4)", ["customer", "Legacy", "old-order", Date.now()]);
  await vod.simulatePurchase("customer", "Legacy", "success");
  const session = await vod.startSession("customer", "Legacy");
  await vod.sessionEvent("customer", session.id, "playing");
  const status = await vod.getVodStatus("customer", "Legacy");
  assert.equal(status.legacyFilm, true);
  assert.equal(status.credits.find((item) => item.movie_id === "Legacy").remaining, 2);
});
