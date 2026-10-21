import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "oxsnow-founder";
const CUSTOMER_COOKIE = "oxsnow-customer";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  return process.env.AUTH_SECRET || "oxsnow-dev-secret-change-in-production";
}

function hmac(data) {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("hex");
}

export function createToken() {
  const expiry = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `founder.${expiry}`;
  return `${payload}.${hmac(payload)}`;
}

export function verifyToken(token) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expiry, signature] = parts;
  if (role !== "founder") return false;
  const payload = `${role}.${expiry}`;
  const expected = hmac(payload);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return false;
    }
  } catch {
    return false;
  }
  return Date.now() < Number(expiry);
}

/* ------------------------- Customer sessions ------------------------- */

export function hashPassword(password, saltHex) {
  const salt = saltHex || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  try {
    const [salt, hash] = String(stored).split(":");
    if (!salt || !hash) return false;
    const candidate = crypto.scryptSync(String(password), salt, 64).toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(candidate, "hex"),
      Buffer.from(hash, "hex")
    );
  } catch {
    return false;
  }
}

export function createCustomerToken(customerId) {
  const expiry = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `customer.${customerId}.${expiry}`;
  return `${payload}.${hmac(payload)}`;
}

export function verifyCustomerToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [role, customerId, expiry, signature] = parts;
  if (role !== "customer" || !customerId) return null;
  const payload = `customer.${customerId}.${expiry}`;
  const expected = hmac(payload);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }
  if (Date.now() >= Number(expiry)) return null;
  return customerId;
}

export async function createSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function verifySession() {
  try {
    const cookieStore = await cookies();
    return verifyToken(cookieStore.get(COOKIE_NAME)?.value);
  } catch {
    return false;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function createCustomerSession(customerId) {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, createCustomerToken(customerId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function getCustomerSession() {
  try {
    const cookieStore = await cookies();
    return verifyCustomerToken(cookieStore.get(CUSTOMER_COOKIE)?.value);
  } catch {
    return null;
  }
}

export async function destroyCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE);
}

export function checkFounderPassword(password) {
  const expected = process.env.FOUNDER_PASSWORD;
  if (!expected) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(String(password)),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}
