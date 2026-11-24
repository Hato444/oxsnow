import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { streamUrlFor } from "@/lib/payments/catalog";
import { getSession } from "@/lib/vod/data";
import { simulatorAllowed } from "@/lib/vod/rules.mjs";
import { createReadStream, statSync } from "node:fs";
import { Readable } from "node:stream";

function testMedia(request) {
  try {
    const path = process.env.VOD_TEST_MEDIA_PATH;
    const size = statSync(path).size;
    const range = request.headers.get("range");
    const match = range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range && !match) return new NextResponse(null, { status: 416 });
    const start = match ? Number(match[1]) : 0;
    const end = match && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if (start > end || start >= size) return new NextResponse(null, { status: 416 });
    const headers = { "Content-Type": "video/mp4", "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes", "Cache-Control": "private, no-store" };
    if (match) headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
    return new NextResponse(Readable.toWeb(createReadStream(path, { start, end })), { status: match ? 206 : 200, headers });
  } catch { return new NextResponse(null, { status: 503 }); }
}

export async function GET(request) {
  const customerId = await getCustomerSession();
  if (!customerId) return new NextResponse(null, { status: 401 });
  const session = await getSession(customerId, request.nextUrl.searchParams.get("session") || "");
  if (!session) return new NextResponse(null, { status: 403 });
  if (simulatorAllowed(process.env) && process.env.VOD_TEST_MEDIA_PATH) return testMedia(request);
  const url = streamUrlFor(session.movie_id);
  // Only private Blob stores are supported; never redirect the browser upstream.
  if (!url || !process.env.BLOB_READ_WRITE_TOKEN) return new NextResponse(null, { status: 503 });
  let parsed;
  try { parsed = new URL(url); } catch { return new NextResponse(null, { status: 503 }); }
  if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".private.blob.vercel-storage.com")) return new NextResponse(null, { status: 503 });
  try {
    const headers = { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` };
    const range = request.headers.get("range");
    if (range && /^bytes=\d+-\d*$/.test(range)) headers.Range = range;
    const upstream = await fetch(parsed, { headers, redirect: "error", cache: "no-store" });
    if (!upstream.ok && upstream.status !== 206) return new NextResponse(null, { status: 502 });
    const responseHeaders = new Headers({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
    for (const key of ["content-type", "content-length", "content-range", "accept-ranges"]) {
      const value = upstream.headers.get(key);
      if (value) responseHeaders.set(key, value);
    }
    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
