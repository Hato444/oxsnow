import { Pool } from "pg";

let pool;
let schemaPromise = null;

export function getPool() {
  if (!process.env.POSTGRES_URL) {
    throw new Error(
      "POSTGRES_URL is not set. Create a Neon/Postgres store and add the connection string."
    );
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      max: 2,
    });
  }
  return pool;
}

export async function query(text, params) {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  text TEXT DEFAULT '',
  author TEXT DEFAULT 'Oxsnow Studio',
  role TEXT DEFAULT 'Official Studio Channel',
  pinned BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT TRUE,
  media JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS likes (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (post_id, device_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  text TEXT NOT NULL,
  device_id TEXT DEFAULT '',
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter (
  email TEXT PRIMARY KEY,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  movie_id TEXT NOT NULL,
  user_key TEXT DEFAULT '',
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'LSL',
  status TEXT NOT NULL DEFAULT 'pending',
  phone TEXT DEFAULT '',
  provider TEXT DEFAULT 'mpesa',
  provider_ref TEXT DEFAULT '',
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS entitlements (
  user_key TEXT NOT NULL,
  movie_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  paid_at BIGINT NOT NULL,
  PRIMARY KEY (user_key, movie_id)
);

CREATE TABLE IF NOT EXISTS payment_audit (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  event TEXT NOT NULL,
  detail TEXT DEFAULT '',
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS academy_applications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  district TEXT DEFAULT '',
  track TEXT DEFAULT '',
  why TEXT DEFAULT '',
  status TEXT DEFAULT 'new',
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_academy_created ON academy_applications(created_at DESC);
`;

const SEEDS = [
  {
    id: "seed-pinned",
    pinned: true,
    published: true,
    offsetHours: 20,
    text:
      "MOLAMU — the first look is here.\n\nA Basotho documentary digging deeper into the importance of molamu in our culture and heritage, preserving the uses and benefits of Lebetlela from our ancient forefathers to our modern elders.\n\nTrailer now playing. Full film coming soon.",
    media: [{ type: "video", url: "/trailers/molamu-teaser.mp4" }],
  },
  {
    id: "seed-set",
    pinned: false,
    published: true,
    offsetHours: 52,
    text:
      "From the slate: LEHLABA-PHIEO and HO LEKANE.\n\nTwo stories, one mission — industrialising Basotho storytelling. Swipe through the stills and tell us which one you're waiting for.",
    media: [
      { type: "image", url: "/posters/lehlaba-phieo.jpg" },
      { type: "image", url: "/posters/ho-lekane.jpg" },
    ],
  },
  {
    id: "seed-announce",
    pinned: false,
    published: true,
    offsetHours: 96,
    text:
      "The Academy is taking shape.\n\nTraining, mentorship and real production credits for Basotho storytellers. Applications open soon — watch this channel for dates.",
    media: [],
  },
];

async function doEnsureSchema() {
  await query(SCHEMA);

  const { rows } = await query("SELECT value FROM meta WHERE key = 'seeded'");
  if (rows.length === 0) {
    const now = Date.now();
    for (const s of SEEDS) {
      const createdAt = now - s.offsetHours * 60 * 60 * 1000;
      await query(
        `INSERT INTO posts (id, text, author, role, pinned, published, media, created_at, updated_at)
         VALUES ($1, $2, 'Oxsnow Studio', 'Official Studio Channel', $3, $4, $5, $6, $6)
         ON CONFLICT (id) DO NOTHING`,
        [s.id, s.text, s.pinned, s.published, JSON.stringify(s.media), createdAt]
      );
    }
    await query(
      "INSERT INTO meta (key, value) VALUES ('seeded', '1') ON CONFLICT (key) DO NOTHING"
    );
  }
}

export function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = doEnsureSchema().catch((err) => {
      schemaPromise = null;
      throw err;
    });
  }
  return schemaPromise;
}

export function isBlobUrl(url) {
  return typeof url === "string" && url.includes(".blob.vercel-storage.com");
}
