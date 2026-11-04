import test from "node:test";
import assert from "node:assert/strict";
import {
  availabilityFor,
  canTransition,
  computeTotals,
  isISODate,
  rangesOverlap,
  rentalDays,
  reservedQuantity,
  validateRentalRange,
} from "../src/lib/hire/rules.mjs";

test("rental days are inclusive", () => {
  assert.equal(rentalDays("2026-11-10", "2026-11-10"), 1);
  assert.equal(rentalDays("2026-11-10", "2026-11-11"), 2);
  assert.equal(rentalDays("2026-11-10", "2026-11-12"), 3);
  assert.equal(rentalDays("2026-11-12", "2026-11-10"), null);
});

test("ISO dates are validated, not just pattern-matched", () => {
  assert.equal(isISODate("2026-02-28"), true);
  assert.equal(isISODate("2026-02-30"), false);
  assert.equal(isISODate("2026-2-3"), false);
  assert.equal(isISODate(""), false);
});

test("range validation rejects past and reversed dates", () => {
  const today = "2026-11-04";
  assert.equal(validateRentalRange("2026-11-03", "2026-11-05", today).ok, false);
  assert.equal(validateRentalRange("2026-11-05", "2026-11-04", today).ok, false);
  assert.equal(validateRentalRange("2026-11-04", "2026-11-04", today).ok, true);
  assert.equal(validateRentalRange("2026-11-04", "2026-11-06", today).days, 3);
});

test("totals keep rental and refundable deposits separate", () => {
  const totals = computeTotals(
    [
      { equipmentId: "cam", quantity: 2, dailyRateMinor: 120000, depositMinor: 200000 },
      { equipmentId: "lens", quantity: 1, dailyRateMinor: 35000, depositMinor: 80000 },
    ],
    3
  );
  assert.equal(totals.rentalSubtotalMinor, 2 * 120000 * 3 + 35000 * 3);
  assert.equal(totals.depositTotalMinor, 2 * 200000 + 80000);
  assert.equal(totals.totalMinor, totals.rentalSubtotalMinor + totals.depositTotalMinor);
});

test("overlap is inclusive on both ends", () => {
  assert.equal(rangesOverlap("2026-11-10", "2026-11-12", "2026-11-12", "2026-11-14"), true);
  assert.equal(rangesOverlap("2026-11-10", "2026-11-12", "2026-11-13", "2026-11-14"), false);
});

test("pending requests do not reserve inventory", () => {
  const reservations = [
    {
      status: "pending",
      startsOn: "2026-11-10",
      endsOn: "2026-11-12",
      items: [{ equipmentId: "cam", quantity: 1 }],
    },
  ];
  assert.equal(reservedQuantity(reservations, "cam", "2026-11-10", "2026-11-12"), 0);
});

test("approved bookings reserve only overlapping quantities", () => {
  const reservations = [
    {
      status: "approved",
      startsOn: "2026-11-10",
      endsOn: "2026-11-12",
      items: [{ equipmentId: "cam", quantity: 2 }],
    },
    {
      status: "approved",
      startsOn: "2026-11-20",
      endsOn: "2026-11-22",
      items: [{ equipmentId: "cam", quantity: 1 }],
    },
  ];
  assert.equal(reservedQuantity(reservations, "cam", "2026-11-11", "2026-11-11"), 2);
  assert.equal(reservedQuantity(reservations, "cam", "2026-11-21", "2026-11-21"), 1);
  assert.equal(reservedQuantity(reservations, "cam", "2026-11-15", "2026-11-16"), 0);
});

test("overdue checked-out stock stays reserved", () => {
  const reservations = [
    {
      status: "checked_out",
      startsOn: "2026-10-01",
      endsOn: "2026-10-03",
      items: [{ equipmentId: "cam", quantity: 1 }],
    },
  ];
  assert.equal(reservedQuantity(reservations, "cam", "2026-11-10", "2026-11-12"), 1);
});

test("maintenance blocks the whole unit and availability is quantity-aware", () => {
  const equipment = { id: "cam", quantityTotal: 3 };
  const reservations = [
    {
      status: "approved",
      startsOn: "2026-11-10",
      endsOn: "2026-11-12",
      items: [{ equipmentId: "cam", quantity: 2 }],
    },
  ];
  assert.equal(availabilityFor(equipment, reservations, [], "2026-11-10", "2026-11-12"), 1);
  const blocks = [{ equipmentId: "cam", startsOn: "2026-11-11", endsOn: "2026-11-11" }];
  assert.equal(availabilityFor(equipment, reservations, blocks, "2026-11-10", "2026-11-12"), 0);
  assert.equal(availabilityFor(equipment, reservations, blocks, "2026-11-20", "2026-11-21"), 3);
});

test("status transitions are restricted", () => {
  assert.equal(canTransition("pending", "approved"), true);
  assert.equal(canTransition("pending", "checked_out"), false);
  assert.equal(canTransition("approved", "checked_out"), true);
  assert.equal(canTransition("checked_out", "returned"), true);
  assert.equal(canTransition("returned", "approved"), false);
  assert.equal(canTransition("cancelled", "pending"), false);
});
