// Pure equipment-hire rules. No database, no React, no aliases — imported by
// both the app and `node --test` so the critical rules are exercised directly.

export const HIRE_CATEGORIES = [
  { id: "cameras", label: "Cameras" },
  { id: "lenses", label: "Lenses" },
  { id: "lighting", label: "Lighting" },
  { id: "sound", label: "Sound" },
  { id: "support", label: "Tripods, Gimbals & Support" },
  { id: "drones", label: "Drones" },
  { id: "accessories", label: "Production Accessories" },
];

export function categoryLabel(id) {
  return HIRE_CATEGORIES.find((c) => c.id === id)?.label || id || "Other";
}

export const BOOKING_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "checked_out",
  "returned",
  "cancelled",
];

export const BOOKING_STATUS_LABELS = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  checked_out: "Checked out",
  returned: "Returned",
  cancelled: "Cancelled",
};

// Only these moves are legal. Enforced again inside the database transaction.
export const STATUS_TRANSITIONS = {
  pending: ["approved", "rejected", "cancelled"],
  approved: ["checked_out", "cancelled"],
  checked_out: ["returned"],
  returned: [],
  rejected: [],
  cancelled: [],
};

export function canTransition(from, to) {
  return Boolean(STATUS_TRANSITIONS[from]?.includes(to));
}

// Statuses that hold inventory. Pending requests deliberately do NOT reserve.
export const RESERVING_STATUSES = ["approved", "checked_out"];

export const PAYMENT_METHODS = [
  { id: "bank_transfer", label: "Bank transfer" },
  { id: "mpesa", label: "M-Pesa" },
  { id: "ecocash", label: "EcoCash" },
  { id: "other", label: "Other / arranged" },
];

export const PAYMENT_STATUS_LABELS = {
  unpaid: "Unpaid",
  reported: "Payment reported — awaiting verification",
  partial: "Partially verified",
  paid: "Verified paid",
  refunded: "Refunded",
};

export const RENTAL_DAY_RULE =
  "Rental days are counted inclusively: the collection day and the return day both count. " +
  "Collecting and returning on the same day is 1 rental day.";

const DAY_MS = 24 * 60 * 60 * 1000;

export function todayISO(now = new Date()) {
  // Lesotho is UTC+2; use it so "today" matches the customer's calendar.
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Maseru",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

export function isISODate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

export function parseISODate(value) {
  if (!isISODate(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function diffDays(start, end) {
  const a = parseISODate(start);
  const b = parseISODate(end);
  if (!a || !b) return null;
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

// Inclusive rental-day count: 10th → 10th = 1 day, 10th → 12th = 3 days.
export function rentalDays(start, end) {
  const diff = diffDays(start, end);
  if (diff === null || diff < 0) return null;
  return diff + 1;
}

export function validateRentalRange(start, end, today = todayISO()) {
  if (!start) return { ok: false, error: "Choose a collection date." };
  if (!end) return { ok: false, error: "Choose a return date." };
  if (!isISODate(start)) return { ok: false, error: "Collection date is invalid." };
  if (!isISODate(end)) return { ok: false, error: "Return date is invalid." };
  if (start < today) return { ok: false, error: "Collection date cannot be in the past." };
  if (end < start) return { ok: false, error: "Return date must be on or after the collection date." };
  return { ok: true, days: rentalDays(start, end) };
}

export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && aEnd >= bStart;
}

export function computeTotals(items, days) {
  const safeDays = Number.isInteger(days) && days > 0 ? days : 0;
  const lines = (items || []).map((item) => {
    const quantity = Number(item.quantity) || 0;
    const dailyRateMinor = Number(item.dailyRateMinor) || 0;
    const depositMinor = Number(item.depositMinor) || 0;
    const lineRentalMinor = dailyRateMinor * safeDays * quantity;
    const lineDepositMinor = depositMinor * quantity;
    return { ...item, quantity, dailyRateMinor, depositMinor, lineRentalMinor, lineDepositMinor };
  });
  const rentalSubtotalMinor = lines.reduce((sum, l) => sum + l.lineRentalMinor, 0);
  const depositTotalMinor = lines.reduce((sum, l) => sum + l.lineDepositMinor, 0);
  return {
    lines,
    rentalSubtotalMinor,
    depositTotalMinor,
    totalMinor: rentalSubtotalMinor + depositTotalMinor,
  };
}

// A maintenance block makes the whole unit unavailable for the overlapping days.
export function isBlocked(blocks, equipmentId, start, end) {
  return (blocks || []).some(
    (block) =>
      block.equipmentId === equipmentId &&
      rangesOverlap(block.startsOn, block.endsOn, start, end)
  );
}

// How many units are held by reserving bookings for the requested window.
// Checked-out bookings count until they are actually returned, even when the
// scheduled return date has passed (overdue stock must not reappear).
export function reservedQuantity(reservations, equipmentId, start, end) {
  let reserved = 0;
  for (const booking of reservations || []) {
    if (!RESERVING_STATUSES.includes(booking.status)) continue;
    const holds =
      booking.status === "checked_out" ||
      rangesOverlap(booking.startsOn, booking.endsOn, start, end);
    if (!holds) continue;
    for (const item of booking.items || []) {
      if (item.equipmentId === equipmentId) reserved += Number(item.quantity) || 0;
    }
  }
  return reserved;
}

export function availabilityFor(equipment, reservations, blocks, start, end) {
  const total = Number(equipment.quantityTotal) || 0;
  if (isBlocked(blocks, equipment.id, start, end)) return 0;
  const reserved = reservedQuantity(reservations, equipment.id, start, end);
  return Math.max(0, total - reserved);
}
