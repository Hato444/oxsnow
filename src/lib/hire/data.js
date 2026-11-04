import crypto from "crypto";
import { ensureSchema, query, withTransaction } from "@/lib/db";
import {
  BOOKING_STATUSES,
  HIRE_CATEGORIES,
  availabilityFor,
  canTransition,
  categoryLabel,
  computeTotals,
  rentalDays,
  todayISO,
  validateRentalRange,
} from "@/lib/hire/rules.mjs";

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function asObject(value, fallback = {}) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function mapEquipment(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    categoryLabel: categoryLabel(row.category),
    description: row.description || "",
    specs: asArray(row.specs),
    images: asArray(row.images),
    accessories: asArray(row.accessories),
    dailyRateMinor: Number(row.daily_rate_minor) || 0,
    depositMinor: Number(row.deposit_minor) || 0,
    quantityTotal: Number(row.quantity_total) || 0,
    ownership: row.ownership || "oxsnow",
    isDemo: Boolean(row.is_demo),
    active: Boolean(row.active),
    archived: Boolean(row.archived),
    createdAt: Number(row.created_at) || 0,
    updatedAt: Number(row.updated_at) || 0,
  };
}

function mapBooking(row) {
  return {
    id: row.id,
    reference: row.reference,
    customerId: row.customer_id,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    company: row.company || "",
    intendedUse: row.intended_use || "",
    productionLocation: row.production_location || "",
    notes: row.notes || "",
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    rentalDays: Number(row.rental_days) || 0,
    status: row.status,
    paymentStatus: row.payment_status,
    rentalSubtotalMinor: Number(row.rental_subtotal_minor) || 0,
    depositTotalMinor: Number(row.deposit_total_minor) || 0,
    totalMinor: Number(row.total_minor) || 0,
    currency: row.currency || "LSL",
    staffInstructions: row.staff_instructions || "",
    conditionNotes: row.condition_notes || "",
    damageNotes: row.damage_notes || "",
    missingAccessories: row.missing_accessories || "",
    checkedOutAt: row.checked_out_at ? Number(row.checked_out_at) : null,
    returnedAt: row.returned_at ? Number(row.returned_at) : null,
    createdAt: Number(row.created_at) || 0,
    updatedAt: Number(row.updated_at) || 0,
  };
}

function mapItem(row) {
  return {
    id: Number(row.id),
    bookingId: row.booking_id,
    equipmentId: row.equipment_id,
    name: row.name_snapshot,
    category: row.category_snapshot,
    dailyRateMinor: Number(row.daily_rate_minor) || 0,
    depositMinor: Number(row.deposit_minor) || 0,
    quantity: Number(row.quantity) || 0,
    lineRentalMinor: Number(row.line_rental_minor) || 0,
    lineDepositMinor: Number(row.line_deposit_minor) || 0,
  };
}

function mapPayment(row) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    kind: row.kind,
    method: row.method,
    reference: row.reference || "",
    amountMinor: Number(row.amount_minor) || 0,
    status: row.status,
    reportedBy: row.reported_by || "",
    verifiedBy: row.verified_by || "",
    verifiedAt: row.verified_at ? Number(row.verified_at) : null,
    note: row.note || "",
    createdAt: Number(row.created_at) || 0,
  };
}

function mapQuote(row) {
  return {
    id: row.id,
    reference: row.reference,
    customerId: row.customer_id || "",
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company || "",
    productionType: row.production_type || "",
    startsOn: row.starts_on || "",
    endsOn: row.ends_on || "",
    requestedEquipment: row.requested_equipment || "",
    budget: row.budget || "",
    notes: row.notes || "",
    status: row.status,
    createdAt: Number(row.created_at) || 0,
  };
}

function mapMaintenance(row) {
  return {
    id: row.id,
    equipmentId: row.equipment_id,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    reason: row.reason || "",
    createdBy: row.created_by || "",
    createdAt: Number(row.created_at) || 0,
  };
}

export class HireError extends Error {
  constructor(message, status = 400, code = "HIRE_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/* ------------------------------- Inventory ------------------------------- */

export async function listEquipment({ category = "", q = "", includeInactive = false } = {}) {
  await ensureSchema();
  const clauses = ["archived = FALSE"];
  const params = [];
  if (!includeInactive) clauses.push("active = TRUE");
  if (category) {
    params.push(category);
    clauses.push(`category = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    clauses.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
  }
  const { rows } = await query(
    `SELECT * FROM hire_equipment WHERE ${clauses.join(" AND ")}
     ORDER BY category ASC, name ASC`,
    params
  );
  return rows.map(mapEquipment);
}

export async function listAllEquipment() {
  await ensureSchema();
  const { rows } = await query(
    "SELECT * FROM hire_equipment ORDER BY archived ASC, category ASC, name ASC"
  );
  return rows.map(mapEquipment);
}

export async function getEquipmentBySlug(slug) {
  await ensureSchema();
  const { rows } = await query(
    "SELECT * FROM hire_equipment WHERE slug = $1 AND archived = FALSE LIMIT 1",
    [slug]
  );
  return rows[0] ? mapEquipment(rows[0]) : null;
}

export async function getEquipmentById(id) {
  await ensureSchema();
  const { rows } = await query("SELECT * FROM hire_equipment WHERE id = $1 LIMIT 1", [id]);
  return rows[0] ? mapEquipment(rows[0]) : null;
}

export async function getRelatedEquipment(category, excludeId) {
  await ensureSchema();
  const { rows } = await query(
    `SELECT * FROM hire_equipment
     WHERE category = $1 AND id <> $2 AND archived = FALSE AND active = TRUE
     ORDER BY name ASC LIMIT 4`,
    [category, excludeId]
  );
  return rows.map(mapEquipment);
}

/* ------------------------------ Availability ----------------------------- */

async function loadReservations(start, end, db = { query }) {
  const { rows } = await db.query(
    `SELECT b.id, b.status, b.starts_on, b.ends_on, i.equipment_id, i.quantity
     FROM hire_bookings b
     JOIN hire_booking_items i ON i.booking_id = b.id
     WHERE b.status IN ('approved','checked_out')
       AND (b.status = 'checked_out' OR (b.starts_on <= $2 AND b.ends_on >= $1))`,
    [start, end]
  );
  const byBooking = new Map();
  for (const row of rows) {
    if (!byBooking.has(row.id)) {
      byBooking.set(row.id, {
        id: row.id,
        status: row.status,
        startsOn: row.starts_on,
        endsOn: row.ends_on,
        items: [],
      });
    }
    byBooking.get(row.id).items.push({
      equipmentId: row.equipment_id,
      quantity: Number(row.quantity) || 0,
    });
  }
  return [...byBooking.values()];
}

async function loadMaintenance(start, end, db = { query }) {
  const { rows } = await db.query(
    `SELECT equipment_id, starts_on, ends_on FROM hire_maintenance
     WHERE starts_on <= $2 AND ends_on >= $1`,
    [start, end]
  );
  return rows.map((r) => ({
    equipmentId: r.equipment_id,
    startsOn: r.starts_on,
    endsOn: r.ends_on,
  }));
}

export async function availabilityMap(equipmentRows, start, end, db = { query }) {
  const [reservations, blocks] = await Promise.all([
    loadReservations(start, end, db),
    loadMaintenance(start, end, db),
  ]);
  const map = {};
  for (const item of equipmentRows) {
    map[item.id] = availabilityFor(item, reservations, blocks, start, end);
  }
  return map;
}

export async function quoteAvailability(items, start, end) {
  await ensureSchema();
  const ids = [...new Set((items || []).map((i) => String(i.equipmentId)))];
  if (ids.length === 0) return { items: [], totals: computeTotals([], 0) };
  const { rows } = await query(
    "SELECT * FROM hire_equipment WHERE id = ANY($1::text[]) AND archived = FALSE",
    [ids]
  );
  const equipment = rows.map(mapEquipment);
  const byId = Object.fromEntries(equipment.map((e) => [e.id, e]));
  const available = await availabilityMap(equipment, start, end);
  const days = rentalDays(start, end) || 0;

  const lines = (items || []).map((requested) => {
    const found = byId[requested.equipmentId];
    const quantity = Number(requested.quantity) || 0;
    return {
      equipmentId: requested.equipmentId,
      name: found?.name || "Unavailable item",
      categoryLabel: found?.categoryLabel || "",
      quantity,
      dailyRateMinor: found?.dailyRateMinor || 0,
      depositMinor: found?.depositMinor || 0,
      available: found ? available[found.id] || 0 : 0,
      exists: Boolean(found),
      active: Boolean(found?.active),
      isDemo: Boolean(found?.isDemo),
      images: found?.images || [],
      slug: found?.slug || "",
    };
  });
  const totals = computeTotals(lines, days);
  return {
    days,
    items: totals.lines,
    rentalSubtotalMinor: totals.rentalSubtotalMinor,
    depositTotalMinor: totals.depositTotalMinor,
    totalMinor: totals.totalMinor,
  };
}

/* -------------------------------- Bookings ------------------------------- */

function newReference(prefix = "OXH") {
  const date = todayISO().replaceAll("-", "");
  const random = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 5);
  return `${prefix}-${date}-${random}`;
}

function normalizeItems(items) {
  const merged = new Map();
  for (const raw of items || []) {
    const id = String(raw?.equipmentId || "").trim();
    const quantity = Number(raw?.quantity);
    if (!id) throw new HireError("Every cart item needs an equipment id.");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new HireError("Quantities must be whole numbers between 1 and 99.");
    }
    merged.set(id, (merged.get(id) || 0) + quantity);
  }
  const list = [...merged.entries()].map(([equipmentId, quantity]) => ({ equipmentId, quantity }));
  if (list.length === 0) throw new HireError("Your cart is empty.");
  if (list.length > 50) throw new HireError("Too many different items in one booking.");
  return list;
}

export async function createBooking({ customerId, contact, start, end, items }) {
  if (!customerId) throw new HireError("Sign in to submit a booking request.", 401, "AUTH_REQUIRED");
  const range = validateRentalRange(start, end);
  if (!range.ok) throw new HireError(range.error);
  const requested = normalizeItems(items);

  const name = String(contact?.name || "").trim().slice(0, 120);
  const email = String(contact?.email || "").trim().toLowerCase().slice(0, 200);
  const phone = String(contact?.phone || "").trim().slice(0, 30);
  if (!name) throw new HireError("Your name is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HireError("Enter a valid email address.");
  if (!/^\+?[\d\s-]{8,20}$/.test(phone)) throw new HireError("Enter a valid phone number.");

  return withTransaction(async (client) => {
    const ids = requested.map((i) => i.equipmentId).sort();
    const { rows } = await client.query(
      "SELECT * FROM hire_equipment WHERE id = ANY($1::text[]) ORDER BY id FOR UPDATE",
      [ids]
    );
    const equipment = rows.map(mapEquipment);
    const byId = Object.fromEntries(equipment.map((e) => [e.id, e]));
    for (const item of requested) {
      const found = byId[item.equipmentId];
      if (!found) throw new HireError("One of the items is no longer available.", 409);
      if (!found.active || found.archived) throw new HireError(`${found.name} is not available.`, 409);
    }

    const available = await availabilityMap(equipment, start, end, client);
    for (const item of requested) {
      const found = byId[item.equipmentId];
      const left = available[found.id] || 0;
      if (item.quantity > left) {
        throw new HireError(
          `${found.name}: only ${left} available for those dates.`,
          409,
          "UNAVAILABLE"
        );
      }
    }

    const priced = requested.map((item) => {
      const found = byId[item.equipmentId];
      return {
        equipmentId: found.id,
        name: found.name,
        category: found.category,
        dailyRateMinor: found.dailyRateMinor,
        depositMinor: found.depositMinor,
        quantity: item.quantity,
      };
    });
    const totals = computeTotals(priced, range.days);

    let reference = newReference();
    for (let i = 0; i < 4; i += 1) {
      const exists = await client.query("SELECT 1 FROM hire_bookings WHERE reference = $1", [reference]);
      if (exists.rows.length === 0) break;
      reference = newReference();
    }

    const now = Date.now();
    const id = `hire_${crypto.randomBytes(8).toString("hex")}`;
    const bookingResult = await client.query(
      `INSERT INTO hire_bookings
        (id, reference, customer_id, customer_name, email, phone, company, intended_use,
         production_location, notes, starts_on, ends_on, rental_days, status, payment_status,
         rental_subtotal_minor, deposit_total_minor, total_minor, currency, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending','unpaid',$14,$15,$16,'LSL',$17,$17)
       RETURNING *`,
      [
        id,
        reference,
        customerId,
        name,
        email,
        phone,
        String(contact?.company || "").trim().slice(0, 160),
        String(contact?.intendedUse || "").trim().slice(0, 1000),
        String(contact?.productionLocation || "").trim().slice(0, 200),
        String(contact?.notes || "").trim().slice(0, 2000),
        start,
        end,
        range.days,
        totals.rentalSubtotalMinor,
        totals.depositTotalMinor,
        totals.totalMinor,
        now,
      ]
    );

    for (const line of totals.lines) {
      await client.query(
        `INSERT INTO hire_booking_items
          (booking_id, equipment_id, name_snapshot, category_snapshot, daily_rate_minor,
           deposit_minor, quantity, line_rental_minor, line_deposit_minor)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          id,
          line.equipmentId,
          line.name,
          line.category,
          line.dailyRateMinor,
          line.depositMinor,
          line.quantity,
          line.lineRentalMinor,
          line.lineDepositMinor,
        ]
      );
    }

    await client.query(
      "INSERT INTO hire_audit (entity, entity_id, action, detail, actor, created_at) VALUES ('booking',$1,'created',$2,$3,$4)",
      [id, `Reference ${reference}`, customerId, now]
    );

    return mapBooking(bookingResult.rows[0]);
  });
}

async function attachBookingDetails(rows) {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const [items, payments] = await Promise.all([
    query(
      "SELECT * FROM hire_booking_items WHERE booking_id = ANY($1::text[]) ORDER BY id ASC",
      [ids]
    ),
    query(
      "SELECT * FROM hire_payments WHERE booking_id = ANY($1::text[]) ORDER BY created_at DESC",
      [ids]
    ),
  ]);
  const itemsByBooking = new Map();
  for (const row of items.rows) {
    if (!itemsByBooking.has(row.booking_id)) itemsByBooking.set(row.booking_id, []);
    itemsByBooking.get(row.booking_id).push(mapItem(row));
  }
  const paymentsByBooking = new Map();
  for (const row of payments.rows) {
    if (!paymentsByBooking.has(row.booking_id)) paymentsByBooking.set(row.booking_id, []);
    paymentsByBooking.get(row.booking_id).push(mapPayment(row));
  }
  return rows.map((row) => ({
    ...mapBooking(row),
    items: itemsByBooking.get(row.id) || [],
    payments: paymentsByBooking.get(row.id) || [],
  }));
}

export async function getCustomerBookings(customerId) {
  await ensureSchema();
  const { rows } = await query(
    "SELECT * FROM hire_bookings WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 200",
    [customerId]
  );
  return attachBookingDetails(rows);
}

export async function getBookingById(id) {
  await ensureSchema();
  const { rows } = await query("SELECT * FROM hire_bookings WHERE id = $1 LIMIT 1", [id]);
  if (rows.length === 0) return null;
  const detailed = await attachBookingDetails(rows);
  return detailed[0];
}

export async function getCustomerBooking(reference, customerId) {
  await ensureSchema();
  const { rows } = await query(
    "SELECT * FROM hire_bookings WHERE reference = $1 AND customer_id = $2 LIMIT 1",
    [reference, customerId]
  );
  if (rows.length === 0) return null;
  const detailed = await attachBookingDetails(rows);
  return detailed[0];
}

export async function cancelCustomerBooking(reference, customerId) {
  return withTransaction(async (client) => {
    const found = await client.query(
      "SELECT * FROM hire_bookings WHERE reference = $1 AND customer_id = $2 FOR UPDATE",
      [reference, customerId]
    );
    if (found.rows.length === 0) throw new HireError("Booking not found.", 404);
    const booking = found.rows[0];
    if (!["pending", "approved"].includes(booking.status)) {
      throw new HireError("This booking can no longer be cancelled online. Contact the studio.", 409);
    }
    const now = Date.now();
    await client.query(
      "UPDATE hire_bookings SET status = 'cancelled', updated_at = $2 WHERE id = $1",
      [booking.id, now]
    );
    await client.query(
      "INSERT INTO hire_audit (entity, entity_id, action, detail, actor, created_at) VALUES ('booking',$1,'cancelled','Customer cancelled',$2,$3)",
      [booking.id, customerId, now]
    );
    return { ok: true, reference, status: "cancelled" };
  });
}

export async function reportPayment(reference, customerId, payload) {
  const kind = ["rental", "deposit"].includes(payload?.kind) ? payload.kind : "rental";
  const method = ["bank_transfer", "mpesa", "ecocash", "other"].includes(payload?.method)
    ? payload.method
    : "bank_transfer";
  const amountMinor = Number(payload?.amountMinor);
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    throw new HireError("Enter the amount you paid.");
  }
  return withTransaction(async (client) => {
    const found = await client.query(
      "SELECT * FROM hire_bookings WHERE reference = $1 AND customer_id = $2 FOR UPDATE",
      [reference, customerId]
    );
    if (found.rows.length === 0) throw new HireError("Booking not found.", 404);
    const booking = found.rows[0];
    if (["cancelled", "rejected"].includes(booking.status)) {
      throw new HireError("This booking is closed.", 409);
    }
    const now = Date.now();
    const id = `pay_${crypto.randomBytes(8).toString("hex")}`;
    await client.query(
      `INSERT INTO hire_payments
        (id, booking_id, kind, method, reference, amount_minor, status, reported_by, note, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,'reported',$7,$8,$9)`,
      [
        id,
        booking.id,
        kind,
        method,
        String(payload?.reference || "").trim().slice(0, 120),
        amountMinor,
        customerId,
        String(payload?.note || "").trim().slice(0, 500),
        now,
      ]
    );
    if (booking.payment_status === "unpaid") {
      await client.query(
        "UPDATE hire_bookings SET payment_status = 'reported', updated_at = $2 WHERE id = $1",
        [booking.id, now]
      );
    }
    await client.query(
      "INSERT INTO hire_audit (entity, entity_id, action, detail, actor, created_at) VALUES ('booking',$1,'payment_reported',$2,$3,$4)",
      [booking.id, `${kind} ${amountMinor}`, customerId, now]
    );
    return { ok: true, reference, paymentStatus: "reported" };
  });
}

/* --------------------------------- Quotes -------------------------------- */

export async function createQuote(payload, customerId = "") {
  await ensureSchema();
  const name = String(payload?.name || "").trim().slice(0, 120);
  const email = String(payload?.email || "").trim().toLowerCase().slice(0, 200);
  const phone = String(payload?.phone || "").trim().slice(0, 30);
  if (!name) throw new HireError("Your name is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HireError("Enter a valid email address.");
  if (!/^\+?[\d\s-]{8,20}$/.test(phone)) throw new HireError("Enter a valid phone number.");

  const startsOn = String(payload?.startsOn || "").trim();
  const endsOn = String(payload?.endsOn || "").trim();
  if (startsOn && !/^\d{4}-\d{2}-\d{2}$/.test(startsOn)) throw new HireError("Start date is invalid.");
  if (endsOn && !/^\d{4}-\d{2}-\d{2}$/.test(endsOn)) throw new HireError("End date is invalid.");
  if (startsOn && endsOn && endsOn < startsOn) throw new HireError("End date must be after the start date.");

  const id = `quote_${crypto.randomBytes(8).toString("hex")}`;
  const reference = newReference("OXQ");
  const now = Date.now();
  const { rows } = await query(
    `INSERT INTO hire_quotes
      (id, reference, customer_id, name, email, phone, company, production_type,
       starts_on, ends_on, requested_equipment, budget, notes, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'new',$14)
     RETURNING *`,
    [
      id,
      reference,
      customerId || "",
      name,
      email,
      phone,
      String(payload?.company || "").trim().slice(0, 160),
      String(payload?.productionType || "").trim().slice(0, 120),
      startsOn,
      endsOn,
      String(payload?.requestedEquipment || "").trim().slice(0, 2000),
      String(payload?.budget || "").trim().slice(0, 120),
      String(payload?.notes || "").trim().slice(0, 2000),
      now,
    ]
  );
  return mapQuote(rows[0]);
}

/* -------------------------------- Settings ------------------------------- */

const SETTINGS_FALLBACK = {
  paymentInstructions: {
    status: "draft",
    note:
      "Draft — pending Oxsnow confirmation. Do not send money until studio staff confirm your booking and payment details.",
    bank_transfer: "Draft — bank details to be supplied by Oxsnow Studio.",
    mpesa: "Draft — M-Pesa business number to be supplied by Oxsnow Studio.",
    ecocash: "Draft — EcoCash number to be supplied by Oxsnow Studio.",
  },
  terms: {
    status: "draft",
    note:
      "Draft policies — these require Oxsnow Studio's decision and review. They are not legal advice and are not binding until approved.",
    collection_return: "Draft — collection and return times/location to be confirmed by Oxsnow Studio.",
    deposits: "Draft — refundable deposit amounts are configured per item.",
    inspection: "Draft — equipment is inspected at collection and return.",
    damage: "Draft — damage or missing accessories may affect the refundable deposit.",
    cancellation: "Draft — cancellation windows and charges require Oxsnow approval.",
    late_returns: "Draft — late-return policy and charges require Oxsnow approval.",
  },
};

export async function getSettings() {
  await ensureSchema();
  const { rows } = await query("SELECT key, value, updated_at FROM hire_settings");
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r]));
  return {
    paymentInstructions: byKey.payment_instructions
      ? asObject(byKey.payment_instructions.value, SETTINGS_FALLBACK.paymentInstructions)
      : SETTINGS_FALLBACK.paymentInstructions,
    terms: byKey.terms ? asObject(byKey.terms.value, SETTINGS_FALLBACK.terms) : SETTINGS_FALLBACK.terms,
    updatedAt: Math.max(0, ...rows.map((r) => Number(r.updated_at) || 0)),
  };
}

/* --------------------------------- Admin --------------------------------- */

export async function adminOverview() {
  await ensureSchema();
  const [equipment, bookings, quotes, maintenance, settings, counts, payments] = await Promise.all([
    listAllEquipment(),
    query("SELECT * FROM hire_bookings ORDER BY created_at DESC LIMIT 300"),
    query("SELECT * FROM hire_quotes ORDER BY created_at DESC LIMIT 100"),
    query("SELECT * FROM hire_maintenance ORDER BY starts_on ASC"),
    getSettings(),
    query(
      `SELECT status, COUNT(*) AS count FROM hire_bookings GROUP BY status`
    ),
    query(
      `SELECT kind, status, COALESCE(SUM(amount_minor),0) AS total, COUNT(*) AS count
       FROM hire_payments GROUP BY kind, status`
    ),
  ]);

  const detailedBookings = await attachBookingDetails(bookings.rows);
  const today = todayISO();
  const upcomingCollections = detailedBookings
    .filter((b) => b.status === "approved" && b.startsOn >= today)
    .sort((a, b) => a.startsOn.localeCompare(b.startsOn))
    .slice(0, 20);
  const upcomingReturns = detailedBookings
    .filter((b) => b.status === "checked_out" && b.endsOn >= today)
    .sort((a, b) => a.endsOn.localeCompare(b.endsOn))
    .slice(0, 20);
  const overdue = detailedBookings
    .filter((b) => b.status === "checked_out" && b.endsOn < today)
    .sort((a, b) => a.endsOn.localeCompare(b.endsOn));

  const statusCounts = Object.fromEntries(BOOKING_STATUSES.map((s) => [s, 0]));
  for (const row of counts.rows) statusCounts[row.status] = Number(row.count) || 0;

  const money = { verifiedRentalMinor: 0, verifiedDepositMinor: 0, reportedMinor: 0 };
  for (const row of payments.rows) {
    const total = Number(row.total) || 0;
    if (row.status === "verified") {
      if (row.kind === "deposit") money.verifiedDepositMinor += total;
      else money.verifiedRentalMinor += total;
    }
    if (row.status === "reported") money.reportedMinor += total;
  }

  return {
    equipment,
    bookings: detailedBookings,
    quotes: quotes.rows.map(mapQuote),
    maintenance: maintenance.rows.map(mapMaintenance),
    settings,
    reports: {
      statusCounts,
      money,
      upcomingCollections,
      upcomingReturns,
      overdue,
      totals: {
        equipment: equipment.filter((e) => !e.archived).length,
        activeEquipment: equipment.filter((e) => e.active && !e.archived).length,
        bookings: detailedBookings.length,
        quotes: quotes.rows.length,
      },
    },
    emailConfigured: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
    categories: HIRE_CATEGORIES,
    today,
  };
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanSpecs(specs) {
  if (!Array.isArray(specs)) return [];
  return specs
    .map((s) => ({
      label: String(s?.label || "").trim().slice(0, 80),
      value: String(s?.value || "").trim().slice(0, 200),
    }))
    .filter((s) => s.label || s.value)
    .slice(0, 30);
}

function cleanImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .map((i) => String(i || "").trim())
    .filter((i) => /^(https?:\/\/|\/)/.test(i))
    .slice(0, 10);
}

function cleanList(list) {
  if (!Array.isArray(list)) return [];
  return list.map((i) => String(i || "").trim()).filter(Boolean).slice(0, 30);
}

function nonNegativeInt(value, label) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) throw new HireError(`${label} must be a whole number of 0 or more.`);
  return n;
}

export async function saveEquipment(payload, actor) {
  await ensureSchema();
  const name = String(payload?.name || "").trim().slice(0, 160);
  if (!name) throw new HireError("Equipment name is required.");
  const category = HIRE_CATEGORIES.some((c) => c.id === payload?.category)
    ? payload.category
    : null;
  if (!category) throw new HireError("Choose a valid category.");
  const slug = slugify(payload?.slug || name);
  if (!slug) throw new HireError("Could not build a slug from that name.");
  const dailyRateMinor = nonNegativeInt(payload?.dailyRateMinor, "Daily rate");
  const depositMinor = nonNegativeInt(payload?.depositMinor, "Deposit");
  const quantityTotal = nonNegativeInt(payload?.quantityTotal, "Quantity");
  const ownership = payload?.ownership === "partner" ? "partner" : "oxsnow";
  const now = Date.now();
  const values = [
    slug,
    name,
    category,
    String(payload?.description || "").trim().slice(0, 4000),
    JSON.stringify(cleanSpecs(payload?.specs)),
    JSON.stringify(cleanImages(payload?.images)),
    JSON.stringify(cleanList(payload?.accessories)),
    dailyRateMinor,
    depositMinor,
    quantityTotal,
    ownership,
    payload?.isDemo !== false,
    payload?.active !== false,
    now,
  ];

  try {
    if (payload?.id) {
      const { rows } = await query(
        `UPDATE hire_equipment SET
           slug=$1, name=$2, category=$3, description=$4, specs=$5, images=$6,
           accessories=$7, daily_rate_minor=$8, deposit_minor=$9, quantity_total=$10,
           ownership=$11, is_demo=$12, active=$13, updated_at=$14
         WHERE id=$15 RETURNING *`,
        [...values, payload.id]
      );
      if (rows.length === 0) throw new HireError("Equipment not found.", 404);
      await audit("equipment", payload.id, "updated", name, actor);
      return mapEquipment(rows[0]);
    }
    const id = `eq_${crypto.randomBytes(8).toString("hex")}`;
    const { rows } = await query(
      `INSERT INTO hire_equipment
        (slug, name, category, description, specs, images, accessories,
         daily_rate_minor, deposit_minor, quantity_total, ownership, is_demo, active,
         archived, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,FALSE,$14,$14)
       RETURNING *`,
      values
    );
    await audit("equipment", id, "created", name, actor);
    return mapEquipment(rows[0]);
  } catch (err) {
    if (err instanceof HireError) throw err;
    if (err?.code === "23505") throw new HireError("That slug is already used by another item.");
    throw err;
  }
}

export async function setEquipmentArchived(id, archived, actor) {
  await ensureSchema();
  const { rows } = await query(
    "UPDATE hire_equipment SET archived = $2, updated_at = $3 WHERE id = $1 RETURNING *",
    [id, Boolean(archived), Date.now()]
  );
  if (rows.length === 0) throw new HireError("Equipment not found.", 404);
  await audit("equipment", id, archived ? "archived" : "restored", rows[0].name, actor);
  return mapEquipment(rows[0]);
}

export async function addMaintenance(payload, actor) {
  await ensureSchema();
  const equipment = await getEquipmentById(String(payload?.equipmentId || ""));
  if (!equipment) throw new HireError("Choose equipment to block.");
  const range = validateRentalRange(payload?.startsOn, payload?.endsOn);
  if (!range.ok) throw new HireError(range.error);
  const id = `mnt_${crypto.randomBytes(6).toString("hex")}`;
  const now = Date.now();
  const { rows } = await query(
    `INSERT INTO hire_maintenance (id, equipment_id, starts_on, ends_on, reason, created_by, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      id,
      equipment.id,
      payload.startsOn,
      payload.endsOn,
      String(payload?.reason || "").trim().slice(0, 300),
      actor,
      now,
    ]
  );
  await audit("maintenance", id, "created", `${equipment.name} ${payload.startsOn}→${payload.endsOn}`, actor);
  return mapMaintenance(rows[0]);
}

export async function deleteMaintenance(id, actor) {
  await ensureSchema();
  const { rows } = await query("DELETE FROM hire_maintenance WHERE id = $1 RETURNING *", [id]);
  if (rows.length === 0) throw new HireError("Maintenance block not found.", 404);
  await audit("maintenance", id, "deleted", rows[0].equipment_id, actor);
  return { ok: true };
}

const ACTION_TARGET = {
  approve: "approved",
  reject: "rejected",
  checkout: "checked_out",
  return: "returned",
  cancel: "cancelled",
};

export async function transitionBooking({ bookingId, action, actor, extra = {} }) {
  const target = ACTION_TARGET[action];
  if (!target) throw new HireError("Unknown booking action.");
  return withTransaction(async (client) => {
    const found = await client.query("SELECT * FROM hire_bookings WHERE id = $1 FOR UPDATE", [bookingId]);
    if (found.rows.length === 0) throw new HireError("Booking not found.", 404);
    const booking = found.rows[0];
    if (!canTransition(booking.status, target)) {
      throw new HireError(`Cannot move a ${booking.status.replaceAll("_", " ")} booking to ${target.replaceAll("_", " ")}.`, 409);
    }

    if (target === "approved" || target === "checked_out") {
      const itemRows = await client.query(
        "SELECT equipment_id, quantity FROM hire_booking_items WHERE booking_id = $1",
        [bookingId]
      );
      const ids = [...new Set(itemRows.rows.map((r) => r.equipment_id))].sort();
      const equipmentRows = await client.query(
        "SELECT * FROM hire_equipment WHERE id = ANY($1::text[]) ORDER BY id FOR UPDATE",
        [ids]
      );
      const equipment = equipmentRows.rows.map(mapEquipment);
      const reservations = (await loadReservations(booking.starts_on, booking.ends_on, client)).filter(
        (r) => r.id !== booking.id
      );
      const blocks = await loadMaintenance(booking.starts_on, booking.ends_on, client);
      for (const item of itemRows.rows) {
        const eq = equipment.find((e) => e.id === item.equipment_id);
        if (!eq) throw new HireError("Equipment for this booking no longer exists.", 409);
        const left = availabilityFor(eq, reservations, blocks, booking.starts_on, booking.ends_on);
        if (Number(item.quantity) > left) {
          throw new HireError(
            `${eq.name}: only ${left} available — another booking or maintenance block now conflicts.`,
            409,
            "UNAVAILABLE"
          );
        }
      }
    }

    const now = Date.now();
    const sets = ["status = $2", "updated_at = $3"];
    const params = [bookingId, target, now];
    if (target === "checked_out") {
      sets.push(`checked_out_at = $${params.length + 1}`);
      params.push(now);
    }
    if (target === "returned") {
      sets.push(`returned_at = $${params.length + 1}`);
      params.push(now);
      sets.push(`condition_notes = $${params.length + 1}`);
      params.push(String(extra?.conditionNotes || "").slice(0, 1000));
      sets.push(`damage_notes = $${params.length + 1}`);
      params.push(String(extra?.damageNotes || "").slice(0, 1000));
      sets.push(`missing_accessories = $${params.length + 1}`);
      params.push(String(extra?.missingAccessories || "").slice(0, 1000));
    }
    if (typeof extra?.staffInstructions === "string") {
      sets.push(`staff_instructions = $${params.length + 1}`);
      params.push(extra.staffInstructions.slice(0, 2000));
    }

    const updated = await client.query(
      `UPDATE hire_bookings SET ${sets.join(", ")} WHERE id = $1 RETURNING *`,
      params
    );
    await client.query(
      "INSERT INTO hire_audit (entity, entity_id, action, detail, actor, created_at) VALUES ('booking',$1,$2,$3,$4,$5)",
      [bookingId, target, extra?.detail || "", actor, now]
    );
    return mapBooking(updated.rows[0]);
  });
}

export async function recordPayment(payload, actor) {
  const bookingId = String(payload?.bookingId || "");
  if (!bookingId) throw new HireError("Booking is required.");
  const kind = ["rental", "deposit"].includes(payload?.kind) ? payload.kind : "rental";
  const method = ["bank_transfer", "mpesa", "ecocash", "other"].includes(payload?.method)
    ? payload.method
    : "bank_transfer";
  const amountMinor = Number(payload?.amountMinor);
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    throw new HireError("Amount must be a positive whole number of cents.");
  }
  const verify = Boolean(payload?.verify);

  return withTransaction(async (client) => {
    const found = await client.query("SELECT * FROM hire_bookings WHERE id = $1 FOR UPDATE", [bookingId]);
    if (found.rows.length === 0) throw new HireError("Booking not found.", 404);
    const booking = found.rows[0];
    const now = Date.now();
    const id = `pay_${crypto.randomBytes(8).toString("hex")}`;
    await client.query(
      `INSERT INTO hire_payments
        (id, booking_id, kind, method, reference, amount_minor, status, reported_by,
         verified_by, verified_at, note, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        id,
        bookingId,
        kind,
        method,
        String(payload?.reference || "").trim().slice(0, 120),
        amountMinor,
        verify ? "verified" : "reported",
        String(payload?.reportedBy || "staff").slice(0, 80),
        verify ? actor : "",
        verify ? now : null,
        String(payload?.note || "").trim().slice(0, 500),
        now,
      ]
    );

    const sums = await client.query(
      `SELECT
         COALESCE(SUM(amount_minor) FILTER (WHERE kind='rental' AND status='verified'),0) AS rental,
         COALESCE(SUM(amount_minor) FILTER (WHERE kind='deposit' AND status='verified'),0) AS deposit,
         COUNT(*) FILTER (WHERE status='reported') AS reported
       FROM hire_payments WHERE booking_id = $1`,
      [bookingId]
    );
    const sum = sums.rows[0];
    let paymentStatus = "unpaid";
    if (Number(sum.rental) >= Number(booking.rental_subtotal_minor) && Number(sum.deposit) >= Number(booking.deposit_total_minor)) {
      paymentStatus = "paid";
    } else if (Number(sum.rental) > 0 || Number(sum.deposit) > 0) {
      paymentStatus = "partial";
    } else if (Number(sum.reported) > 0) {
      paymentStatus = "reported";
    }

    await client.query(
      "UPDATE hire_bookings SET payment_status = $2, updated_at = $3 WHERE id = $1",
      [bookingId, paymentStatus, now]
    );
    await client.query(
      "INSERT INTO hire_audit (entity, entity_id, action, detail, actor, created_at) VALUES ('booking',$1,$2,$3,$4,$5)",
      [bookingId, verify ? "payment_verified" : "payment_recorded", `${kind} ${amountMinor}`, actor, now]
    );
    return { ok: true, paymentStatus };
  });
}

export async function updateQuoteStatus(id, status, actor) {
  await ensureSchema();
  const allowed = ["new", "contacted", "quoted", "closed"];
  if (!allowed.includes(status)) throw new HireError("Invalid quote status.");
  const { rows } = await query(
    "UPDATE hire_quotes SET status = $2 WHERE id = $1 RETURNING *",
    [id, status]
  );
  if (rows.length === 0) throw new HireError("Quote not found.", 404);
  await audit("quote", id, "status", status, actor);
  return mapQuote(rows[0]);
}

export async function saveSettings(payload, actor) {
  await ensureSchema();
  const now = Date.now();
  const entries = [];
  if (payload?.paymentInstructions) {
    entries.push(["payment_instructions", JSON.stringify(payload.paymentInstructions)]);
  }
  if (payload?.terms) {
    entries.push(["terms", JSON.stringify(payload.terms)]);
  }
  if (entries.length === 0) throw new HireError("Nothing to save.");
  for (const [key, value] of entries) {
    await query(
      `INSERT INTO hire_settings (key, value, updated_by, updated_at)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value,
         updated_by = EXCLUDED.updated_by, updated_at = EXCLUDED.updated_at`,
      [key, value, actor, now]
    );
    await audit("settings", key, "updated", "", actor);
  }
  return getSettings();
}

export async function audit(entity, entityId, action, detail, actor) {
  try {
    await query(
      "INSERT INTO hire_audit (entity, entity_id, action, detail, actor, created_at) VALUES ($1,$2,$3,$4,$5,$6)",
      [entity, entityId, action, String(detail || "").slice(0, 500), String(actor || ""), Date.now()]
    );
  } catch (err) {
    console.error("[hire] audit failed:", err);
  }
}
