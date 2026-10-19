"use client";

// Local-first persistence for the Community feature.
// Uses IndexedDB (posts + media blobs) so it works on the live Vercel site
// with zero external services. Swap these helpers for a real database /
// object store when one is configured.

const DB_NAME = "oxsnow-community";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("posts")) {
        db.createObjectStore("posts", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("media")) {
        db.createObjectStore("media");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore(db, store, mode, fn) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const os = tx.objectStore(store);
    let result;
    try {
      result = fn(os);
    } catch (err) {
      reject(err);
      return;
    }
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getAllPosts() {
  const db = await openDB();
  const posts = await withStore(db, "posts", "readonly", (os) => {
    const out = [];
    os.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        out.push(cursor.value);
        cursor.continue();
      }
    };
    return out;
  });
  db.close();
  return posts;
}

export async function putPost(post) {
  const db = await openDB();
  await withStore(db, "posts", "readwrite", (os) => os.put(post));
  db.close();
  return post;
}

export async function removePost(id) {
  const db = await openDB();
  await withStore(db, "posts", "readwrite", (os) => os.delete(id));
  db.close();
}

export async function putMedia(id, blob) {
  const db = await openDB();
  await withStore(db, "media", "readwrite", (os) => os.put(blob, id));
  db.close();
}

export async function getMedia(id) {
  const db = await openDB();
  const blob = await withStore(db, "media", "readonly", (os) => {
    let value = null;
    os.get(id).onsuccess = (e) => {
      value = e.target.result || null;
    };
    return value;
  });
  db.close();
  return blob;
}

export async function removeMedia(id) {
  const db = await openDB();
  await withStore(db, "media", "readwrite", (os) => os.delete(id));
  db.close();
}

const now = () => Date.now();

const SEED_KEY = "oxsnow-community-seeded";

export async function seedIfEmpty() {
  if (typeof localStorage !== "undefined" && localStorage.getItem(SEED_KEY)) {
    return;
  }
  await putPost({
    id: "seed-pinned",
    pinned: true,
    published: true,
    createdAt: now() - 1000 * 60 * 60 * 20,
    author: "Oxsnow Studio",
    role: "Official Studio Channel",
    text:
      "MOLAMU — the first look is here.\n\nA Basotho documentary digging deeper into the importance of molamu in our culture and heritage, preserving the uses and benefits of Lebetlela from our ancient forefathers to our modern elders.\n\nTrailer now playing. Full film coming soon.",
    media: [{ type: "video", url: "/trailers/molamu-teaser.mp4" }],
    likedBy: [],
    comments: [],
  });

  await putPost({
    id: "seed-set",
    pinned: false,
    published: true,
    createdAt: now() - 1000 * 60 * 60 * 52,
    author: "Oxsnow Studio",
    role: "Official Studio Channel",
    text:
      "From the slate: LEHLABA-PHIEO and HO LEKANE.\n\nTwo stories, one mission — industrialising Basotho storytelling. Swipe through the stills and tell us which one you're waiting for.",
    media: [
      { type: "image", url: "/posters/lehlaba-phieo.jpg" },
      { type: "image", url: "/posters/ho-lekane.jpg" },
    ],
    likedBy: [],
    comments: [],
  });

  await putPost({
    id: "seed-announce",
    pinned: false,
    published: true,
    createdAt: now() - 1000 * 60 * 60 * 96,
    author: "Oxsnow Studio",
    role: "Official Studio Channel",
    text:
      "The Academy is taking shape.\n\nTraining, mentorship and real production credits for Basotho storytellers. Applications open soon — watch this channel for dates.",
    media: [],
    likedBy: [],
    comments: [],
  });

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SEED_KEY, "1");
  }
}
