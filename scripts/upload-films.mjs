// One-shot uploader: pushes the full films into Vercel Blob and writes the
// resulting URLs into .env.local as MOVIE_URL_* vars (server-only, never in git).
//
//   node scripts/upload-films.mjs
//
// Safe to re-run: overwrites the same pathnames.

import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { put } from "@vercel/blob";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC_DIR = "C:/Users/User/Documents/website/movies";

const FILMS = [
  { envKey: "MOVIE_URL_HO_LEKANE", pathname: "films/ho-lekane-full.mp4", file: "HO LEKANE - Cognito  Inc (1080p, h264).mp4" },
  { envKey: "MOVIE_URL_KONONO", pathname: "films/konono-full.mp4", file: "Konono  Mp4 Movie1 - Cognito  Inc (1080p, h264).mp4" },
  { envKey: "MOVIE_URL_LEHLABA_PHIEO", pathname: "films/lehlaba-phieo-full.mp4", file: "Lehlaba Phieo mov - Cognito  Inc (1080p, h264).mp4" },
  { envKey: "MOVIE_URL_PHIRIMANA", pathname: "films/phirimana-full.mp4", file: "PHIRIMANA - Cognito  Inc (1080p, h264).mp4" },
];

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN missing — run via `node -e` with env loaded, or export it first.");
  process.exit(1);
}

function upsertEnv(key, value) {
  const envPath = path.join(ROOT, ".env.local");
  let lines = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8").split(/\r?\n/) : [];
  lines = lines.filter((l) => !l.startsWith(`${key}=`));
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  lines.push(`${key}=${value}`, "");
  fs.writeFileSync(envPath, lines.join("\n"), "utf8");
}

for (const film of FILMS) {
  const localPath = path.join(SRC_DIR, film.file);
  if (!fs.existsSync(localPath)) {
    console.error(`MISSING  ${localPath}`);
    continue;
  }
  const sizeMb = (fs.statSync(localPath).size / 1024 / 1024).toFixed(1);
  console.log(`UPLOAD   ${film.pathname}  (${sizeMb} MB)`);
  const stream = Readable.toWeb(fs.createReadStream(localPath));
  const { url } = await put(film.pathname, stream, {
    access: "public",
    token,
    contentType: "video/mp4",
    allowOverwrite: true,
    addRandomSuffix: true,
  });
  upsertEnv(film.envKey, url);
  console.log(`DONE     ${url}`);
}

console.log("ALL FILMS UPLOADED — .env.local updated with MOVIE_URL_* vars.");
