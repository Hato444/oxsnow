import { Pool } from "pg";
import { CATALOGUE_VERSION, HIRE_EQUIPMENT_SEED, LEGACY_EQUIPMENT_IDS } from "./hire/catalogue.mjs";

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

// Run a set of statements atomically. The callback receives the client, so
// callers can use SELECT ... FOR UPDATE to serialise stock decisions.
export async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    throw err;
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
  target TEXT DEFAULT 'community',
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

/* ---------------------- Equipment hire ---------------------- */

CREATE TABLE IF NOT EXISTS hire_equipment (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  specs JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  accessories JSONB DEFAULT '[]'::jsonb,
  daily_rate_minor INTEGER NOT NULL DEFAULT 0,
  deposit_minor INTEGER NOT NULL DEFAULT 0,
  quantity_total INTEGER NOT NULL DEFAULT 0,
  ownership TEXT NOT NULL DEFAULT 'oxsnow',
  is_demo BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS hire_maintenance (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL REFERENCES hire_equipment(id) ON DELETE CASCADE,
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  reason TEXT DEFAULT '',
  created_by TEXT DEFAULT '',
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS hire_bookings (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT DEFAULT '',
  intended_use TEXT DEFAULT '',
  production_location TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  rental_days INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  rental_subtotal_minor INTEGER NOT NULL DEFAULT 0,
  deposit_total_minor INTEGER NOT NULL DEFAULT 0,
  total_minor INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'LSL',
  staff_instructions TEXT DEFAULT '',
  condition_notes TEXT DEFAULT '',
  damage_notes TEXT DEFAULT '',
  missing_accessories TEXT DEFAULT '',
  checked_out_at BIGINT,
  returned_at BIGINT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS hire_booking_items (
  id BIGSERIAL PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES hire_bookings(id) ON DELETE CASCADE,
  equipment_id TEXT NOT NULL,
  name_snapshot TEXT NOT NULL,
  category_snapshot TEXT DEFAULT '',
  daily_rate_minor INTEGER NOT NULL,
  deposit_minor INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL,
  line_rental_minor INTEGER NOT NULL,
  line_deposit_minor INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hire_payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES hire_bookings(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'rental',
  method TEXT NOT NULL DEFAULT 'bank_transfer',
  reference TEXT DEFAULT '',
  amount_minor INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'reported',
  reported_by TEXT DEFAULT '',
  verified_by TEXT DEFAULT '',
  verified_at BIGINT,
  note TEXT DEFAULT '',
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS hire_quotes (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  customer_id TEXT DEFAULT '',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT DEFAULT '',
  production_type TEXT DEFAULT '',
  starts_on TEXT DEFAULT '',
  ends_on TEXT DEFAULT '',
  requested_equipment TEXT DEFAULT '',
  budget TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS hire_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_by TEXT DEFAULT '',
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS hire_audit (
  id BIGSERIAL PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT DEFAULT '',
  actor TEXT DEFAULT '',
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hire_equipment_category ON hire_equipment(category);
CREATE INDEX IF NOT EXISTS idx_hire_bookings_customer ON hire_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_hire_bookings_status ON hire_bookings(status);
CREATE INDEX IF NOT EXISTS idx_hire_bookings_dates ON hire_bookings(starts_on, ends_on);
CREATE INDEX IF NOT EXISTS idx_hire_items_booking ON hire_booking_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_hire_payments_booking ON hire_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_hire_maintenance_equipment ON hire_maintenance(equipment_id);

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

const HIRE_SETTINGS_SEED = {
  payment_instructions: JSON.stringify({
    status: "draft",
    note:
      "Draft — pending Oxsnow confirmation. Do not send money until studio staff confirm your booking and payment details.",
    bank_transfer: "Draft — bank details to be supplied by Oxsnow Studio.",
    mpesa: "Draft — M-Pesa business number to be supplied by Oxsnow Studio.",
    ecocash: "Draft — EcoCash number to be supplied by Oxsnow Studio.",
  }),
  terms: JSON.stringify({
    status: "draft",
    note:
      "Draft policies — these require Oxsnow Studio's decision and review. They are not legal advice and are not binding until approved.",
    collection_return:
      "Draft — collection and return times/location to be confirmed by Oxsnow Studio.",
    deposits:
      "Draft — refundable deposit amounts are configured per item. Refund timing and conditions require Oxsnow approval.",
    inspection:
      "Draft — equipment is inspected at collection and return. Staff record condition, damage and missing accessories.",
    damage:
      "Draft — damage or missing accessories may affect the refundable deposit. Final policy requires Oxsnow approval.",
    cancellation:
      "Draft — cancellation windows and any charges require Oxsnow approval.",
    late_returns:
      "Draft — late-return policy and any charges require Oxsnow approval.",
  }),
};

async function seedHireData() {
  const { rows } = await query("SELECT value FROM meta WHERE key = 'hire_seeded'");
  if (rows.length > 0) return;

  const now = Date.now();
  for (const item of HIRE_EQUIPMENT_SEED) {
    await query(
      `INSERT INTO hire_equipment
        (id, slug, name, category, description, specs, images, accessories,
         daily_rate_minor, deposit_minor, quantity_total, ownership, is_demo,
         active, archived, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,TRUE,TRUE,FALSE,$13,$13)
       ON CONFLICT (id) DO NOTHING`,
      [
        item.id,
        item.slug,
        item.name,
        item.category,
        item.description,
        JSON.stringify(item.specs),
        JSON.stringify(item.images),
        JSON.stringify(item.accessories),
        item.daily_rate_minor,
        item.deposit_minor,
        item.quantity_total,
        item.ownership,
        now,
      ]
    );
  }

  for (const [key, value] of Object.entries(HIRE_SETTINGS_SEED)) {
    await query(
      `INSERT INTO hire_settings (key, value, updated_by, updated_at)
       VALUES ($1,$2,'demo-seed',$3) ON CONFLICT (key) DO NOTHING`,
      [key, value, now]
    );
  }

  await query(
    "INSERT INTO meta (key, value) VALUES ('hire_seeded', '1') ON CONFLICT (key) DO NOTHING"
  );
}

async function syncHireCatalogue() {
  const { rows } = await query("SELECT value FROM meta WHERE key = 'hire_catalogue_version'");
  if (rows[0]?.value === CATALOGUE_VERSION) return;

  const now = Date.now();
  for (const item of HIRE_EQUIPMENT_SEED) {
    await query(
      `INSERT INTO hire_equipment
        (id, slug, name, category, description, specs, images, accessories,
         daily_rate_minor, deposit_minor, quantity_total, ownership, is_demo,
         active, archived, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,TRUE,TRUE,FALSE,$13,$13)
       ON CONFLICT (id) DO UPDATE SET
         slug = EXCLUDED.slug,
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         description = EXCLUDED.description,
         specs = EXCLUDED.specs,
         images = EXCLUDED.images,
         accessories = EXCLUDED.accessories,
         daily_rate_minor = EXCLUDED.daily_rate_minor,
         deposit_minor = EXCLUDED.deposit_minor,
         quantity_total = EXCLUDED.quantity_total,
         ownership = EXCLUDED.ownership,
         is_demo = TRUE,
         active = TRUE,
         archived = FALSE,
         updated_at = EXCLUDED.updated_at`,
      [
        item.id,
        item.slug,
        item.name,
        item.category,
        item.description,
        JSON.stringify(item.specs),
        JSON.stringify(item.images),
        JSON.stringify(item.accessories),
        item.daily_rate_minor,
        item.deposit_minor,
        item.quantity_total,
        item.ownership,
        now,
      ]
    );
  }

  if (LEGACY_EQUIPMENT_IDS.length > 0) {
    await query(
      "UPDATE hire_equipment SET archived = TRUE, active = FALSE, updated_at = $1 WHERE id = ANY($2::text[])",
      [now, LEGACY_EQUIPMENT_IDS]
    );
  }

  await query(
    `INSERT INTO meta (key, value) VALUES ('hire_catalogue_version', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [CATALOGUE_VERSION]
  );
}

async function doEnsureSchema() {
  await query(SCHEMA);

  // existing deployments predate the feed-target column — add it idempotently
  await query(
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS target TEXT NOT NULL DEFAULT 'community'"
  );

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

  await seedHireData();
  await syncHireCatalogue();
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
