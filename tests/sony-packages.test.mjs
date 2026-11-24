import test from "node:test";
import assert from "node:assert/strict";
import { SONY_PACKAGES, sonyPackageItem, validateHireRequestItems } from "../src/lib/hire/sony-packages.mjs";
import { computeTotals } from "../src/lib/hire/rules.mjs";

test("Sony package requests use the advertised rental rates without claiming stock", () => {
  assert.deepEqual(SONY_PACKAGES.map((item) => item.dailyRateMinor), [60000, 85000]);
  for (const item of SONY_PACKAGES) {
    assert.equal(sonyPackageItem(item).requestable, true);
    assert.equal(validateHireRequestItems([{ equipmentId: item.id, quantity: 1 }]).ok, true);
    assert.equal(computeTotals([{ ...item, quantity: 1 }], 3).rentalSubtotalMinor, item.dailyRateMinor * 3);
  }
});

test("request policy rejects stale carts, multiple packages and extra quantities", () => {
  const id = SONY_PACKAGES[0].id;
  for (const items of [[], [{ equipmentId: "old-demo", quantity: 1 }], [{ equipmentId: id, quantity: 2 }], SONY_PACKAGES.map((item) => ({ equipmentId: item.id, quantity: 1 }))]) {
    assert.equal(validateHireRequestItems(items).ok, false);
  }
});
