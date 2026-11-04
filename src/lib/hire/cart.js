"use client";

const KEY = "oxsnow-hire-cart";
export const CART_EVENT = "oxsnow-hire-cart";

export function readCart() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { items: [], start: "", end: "" };
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed?.items) ? parsed.items : [],
      start: typeof parsed?.start === "string" ? parsed.start : "",
      end: typeof parsed?.end === "string" ? parsed.end : "",
    };
  } catch {
    return { items: [], start: "", end: "" };
  }
}

export function writeCart(cart) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event(CART_EVENT));
  } catch {
    // storage may be unavailable (private mode) — checkout still works per-session
  }
}

export function addToCart(item) {
  const cart = readCart();
  const existing = cart.items.find((i) => i.equipmentId === item.equipmentId);
  if (existing) {
    existing.quantity = Math.min(99, Number(existing.quantity) + Number(item.quantity || 1));
  } else {
    cart.items.push({
      equipmentId: item.equipmentId,
      quantity: Math.min(99, Number(item.quantity) || 1),
      name: item.name || "",
      slug: item.slug || "",
      image: item.image || "",
      dailyRateMinor: Number(item.dailyRateMinor) || 0,
      depositMinor: Number(item.depositMinor) || 0,
    });
  }
  if (item.start) cart.start = item.start;
  if (item.end) cart.end = item.end;
  writeCart(cart);
  return cart;
}

export function updateCartItem(equipmentId, quantity) {
  const cart = readCart();
  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.equipmentId !== equipmentId);
  } else {
    const item = cart.items.find((i) => i.equipmentId === equipmentId);
    if (item) item.quantity = Math.min(99, Number(quantity));
  }
  writeCart(cart);
  return cart;
}

export function removeFromCart(equipmentId) {
  return updateCartItem(equipmentId, 0);
}

export function clearCart() {
  writeCart({ items: [], start: "", end: "" });
}

export function cartCount(cart) {
  return (cart?.items || []).reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
}

export function money(minor) {
  return `M ${(Number(minor || 0) / 100).toFixed(2)}`;
}
