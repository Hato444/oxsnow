import test from "node:test";
import assert from "node:assert/strict";
import { newDb } from "pg-mem";
import { BRIEF_FIELDS, validateBrief } from "../src/lib/services/brief.mjs";
import { saveServiceEnquiry } from "../src/lib/services/store.mjs";

test("project briefs validate each service, budget, contact and relevant fields", () => {
  for (const service of Object.keys(BRIEF_FIELDS)) {
    const body = { service, name: "Test", email: "test@example.test", budget: "500.50", details: { idea: "Example", recommend: "yes", ignored: "ignored" } };
    const result = validateBrief(body);
    assert.equal(result.ok, true);
    assert.equal(result.value.details.ignored, undefined);
    assert.equal(validateBrief({ ...body, email: "bad" }).ok, false);
    assert.equal(validateBrief({ ...body, budget: "-10" }).ok, false);
    assert.equal(validateBrief({ ...body, details: {} }).ok, false);
  }
  assert.equal(validateBrief({ service: "unknown" }).ok, false);
});

test("validated enquiry persists with its complete brief", async () => {
  const db = newDb();
  db.public.none("CREATE TABLE service_enquiries (id text primary key, service text, name text, email text, phone text, budget text, timeline text, details jsonb, created_at bigint)");
  const { Pool } = db.adapters.createPg();
  const pool = new Pool();
  const result = validateBrief({ service: "broadcast", name: "Test", email: "test@example.test", details: { idea: "Screen a film", content: "Film A", territory: "Lesotho" } });
  await saveServiceEnquiry((sql, params) => pool.query(sql, params), "svc-test", result.value, 1234);
  const stored = await pool.query("SELECT * FROM service_enquiries WHERE id=$1", ["svc-test"]);
  assert.equal(stored.rows.length, 1);
  assert.deepEqual(stored.rows[0].details, { idea: "Screen a film", recommend: "no", content: "Film A", territory: "Lesotho" });
  await pool.end();
});
