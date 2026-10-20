import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

const MAX_SIZE = 4 * 1024 * 1024; // 4 MB (Vercel serverless body limit)

export async function POST(request) {
  try {
    if (!(await verifySession())) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "File uploads not configured. Set BLOB_READ_WRITE_TOKEN." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ ok: false, error: "No file provided." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { ok: false, error: "File too large (max 4 MB)." },
        { status: 413 }
      );
    }

    const allowed = ["image/", "video/"];
    if (!allowed.some((p) => file.type.startsWith(p))) {
      return NextResponse.json(
        { ok: false, error: "Only images and videos are accepted." },
        { status: 415 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { put } = await import("@vercel/blob");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "upload";

    const blob = await put(safeName, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    return NextResponse.json({
      ok: true,
      media: { type: file.type.startsWith("video/") ? "video" : "image", url: blob.url },
    });
  } catch (err) {
    console.error("[upload] failed:", err);
    return NextResponse.json({ ok: false, error: "Upload failed." }, { status: 500 });
  }
}
