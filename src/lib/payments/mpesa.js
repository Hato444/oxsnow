// Vodacom Lesotho M-Pesa provider adapter.
//
// Real C2BPayment / Query Txn schemas come from the approved M-Pesa Open API
// product (https://business.m-pesa.com/developers/). They are behind the
// merchant portal login, so the real adapter below fails CLOSED until
// MPESA_BASE_URL + credentials are configured. Do not guess endpoints.
//
// In development only, MPESA_SIMULATE=1 enables a visible TEST simulator so
// the full order → authorisation → verification → entitlement flow can be
// exercised locally. It can never run in production.

export const CURRENCY = "LSL";
export const PRICE_MINOR = 2500; // 25.00 LSL in tambala — server-side price only

export function providerConfigured() {
  return Boolean(process.env.MPESA_BASE_URL && process.env.MPESA_SHORTCODE);
}

export function simulateEnabled() {
  return (
    process.env.NODE_ENV !== "production" && process.env.MPESA_SIMULATE === "1"
  );
}

const SIM_STATUSES = ["successful", "failed", "cancelled"];

export function normalizeSimStatus(ref) {
  // deterministic TEST outcome from the order ref: mostly succeeds
  const last = Number(ref.replace(/\D/g, "").slice(-1) || "0");
  return SIM_STATUSES[last % 10 === 7 ? 1 : last % 10 === 3 ? 2 : 0];
}

export function isSimRef(ref) {
  return typeof ref === "string" && ref.startsWith("SIM-");
}

// Real adapter — fill in from official portal docs once approved.
export async function createPayment(order, customerPhone) {
  if (!providerConfigured()) {
    const err = new Error(
      "M-Pesa is not configured yet. Live payments activate after merchant approval."
    );
    err.code = "CONFIG_MISSING";
    throw err;
  }
  // TODO(provider): POST the official C2BPayment request with order.id,
  // customerPhone, amount, currency exactly as documented for the approved
  // Vodacom Lesotho product. Never invent the endpoint or payload.
  const err = new Error("Official request schema pending portal access.");
  err.code = "SCHEMA_TODO";
  throw err;
}

export async function queryTransaction(providerRef) {
  if (isSimRef(providerRef)) {
    return { status: normalizeSimStatus(providerRef), reference: providerRef, simulated: true };
  }
  if (!providerConfigured()) {
    const err = new Error("M-Pesa is not configured yet.");
    err.code = "CONFIG_MISSING";
    throw err;
  }
  // TODO(provider): call the official Query Txn API for providerRef.
  const err = new Error("Official query schema pending portal access.");
  err.code = "SCHEMA_TODO";
  throw err;
}
