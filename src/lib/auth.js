import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "oxsnow-founder";
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
