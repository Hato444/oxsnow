export const PASS_ID = "__cultural_pass__";
export const FILM_PRICE = 2500;
export const PASS_PRICE = 10000;
export const PASS_DURATION = 30 * 86400000;
export const SESSION_DURATION = 24 * 3600000;
export const PENDING_DURATION = 15 * 60000;

export function simulatorAllowed(env) {
  if (env.NODE_ENV === "production" || env.VOD_SIMULATE !== "1" || !env.VOD_TEST_DATABASE_URL || env.POSTGRES_URL !== env.VOD_TEST_DATABASE_URL) return false;
  try {
    const url = new URL(env.VOD_TEST_DATABASE_URL);
    return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) && url.pathname.length > 1;
  } catch { return false; }
}

export function creditLabel(count) {
  return `${count === 0 ? "No" : count} viewing credit${count === 1 ? "" : "s"} remaining`;
}
