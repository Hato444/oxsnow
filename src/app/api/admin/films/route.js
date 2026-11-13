import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { ensureSchema, query } from "@/lib/db";

const fields = ["title", "synopsis", "description", "genre", "category", "year", "runtime", "director", "productionCompany", "cast", "language", "country", "rating", "price", "duration", "trailerUrl", "releaseDate"];
const prefix = "film-draft:";

export async function GET() {
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) return NextResponse.json({ ok: false, error: "Staff authentication is not configured." }, { status: 503 });
  if (!(await verifySession())) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  try {
    await ensureSchema();
    const result = await query("SELECT key, value FROM meta WHERE key LIKE $1 ORDER BY key", [`${prefix}%`]);
    return NextResponse.json({ ok: true, films: result.rows.map((row) => ({ id: row.key.slice(prefix.length), ...JSON.parse(row.value) })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[film drafts] read failed:", error);
    return NextResponse.json({ ok: false, error: "Could not load film drafts." }, { status: 500 });
  }
}

export async function POST(request) {
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) return NextResponse.json({ ok: false, error: "Staff authentication is not configured." }, { status: 503 });
  if (!(await verifySession())) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) return NextResponse.json({ ok: false, error: "Invalid request origin." }, { status: 403 });
  try {
    const body = await request.json();
    const id = body.id || randomUUID();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ ok: false, error: "Invalid draft." }, { status: 400 });
    const film = Object.fromEntries(fields.map((field) => [field, String(body[field] || "").trim().slice(0, field === "synopsis" ? 4000 : 500)]));
    if (!film.title) return NextResponse.json({ ok: false, error: "A title is required to save a draft." }, { status: 400 });
    film.collections = Array.isArray(body.collections) ? body.collections.filter((name) => ["New Releases", "Basotho History Archive", "Diaspora Favorites"].includes(name)) : [];
    film.featured = body.featured === true;
    film.status = "draft";
    await ensureSchema();
    await query("INSERT INTO meta (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [`${prefix}${id}`, JSON.stringify(film)]);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("[film drafts] save failed:", error);
    return NextResponse.json({ ok: false, error: "Could not save film draft." }, { status: 500 });
  }
}
