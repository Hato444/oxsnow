// Server-side catalog of full-film stream URLs (Vercel Blob).
// NEVER import this from client components — the URLs live only in env vars
// and are released per-request by /api/stream after an entitlement check.

export const FILM_STREAMS = {
  "Ho Lekane": process.env.MOVIE_URL_HO_LEKANE || null,
  "Konono": process.env.MOVIE_URL_KONONO || null,
  "Lehlaba-phieo": process.env.MOVIE_URL_LEHLABA_PHIEO || null,
  "Phirimana": process.env.MOVIE_URL_PHIRIMANA || null,
};

export const CULTURAL_PASS_ID = "__cultural_pass__";

export function streamUrlFor(title) {
  return FILM_STREAMS[title] || null;
}
