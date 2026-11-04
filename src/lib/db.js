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

// Clearly-labelled demo inventory. Staff can edit or archive every row; the
// prices are illustrative only and are never presented as real Oxsnow stock.
const HIRE_EQUIPMENT_SEED = [
  {
    id: "demo-cam-a",
    slug: "demo-cinema-camera-a",
    name: "Cinema Camera A",
    category: "cameras",
    description:
      "Demo listing — replace with real Oxsnow inventory. Full-frame cinema body suitable for narrative and commercial work.",
    specs: [
      { label: "Sensor", value: "Demo specification" },
      { label: "Mount", value: "Interchangeable" },
      { label: "Recording", value: "Demo specification" },
    ],
    images: ["/equipment/cameras.svg", "/equipment/demo-card.svg"],
    accessories: ["Demo battery kit", "Demo charger", "Demo cage"],
    daily_rate_minor: 120000,
    deposit_minor: 200000,
    quantity_total: 2,
    ownership: "oxsnow",
  },
  {
    id: "demo-cam-b",
    slug: "demo-mirrorless-camera-b",
    name: "Mirrorless Camera B",
    category: "cameras",
    description:
      "Demo listing — replace with real Oxsnow inventory. Compact mirrorless body for documentary and run-and-gun work.",
    specs: [
      { label: "Sensor", value: "Demo specification" },
      { label: "Stabilisation", value: "Demo specification" },
    ],
    images: ["/equipment/cameras.svg", "/equipment/demo-card.svg"],
    accessories: ["Demo battery", "Demo strap"],
    daily_rate_minor: 65000,
    deposit_minor: 100000,
    quantity_total: 3,
    ownership: "partner",
  },
  {
    id: "demo-lens-2470",
    slug: "demo-24-70mm-zoom",
    name: "24–70mm Zoom Lens",
    category: "lenses",
    description:
      "Demo listing — replace with real Oxsnow inventory. Versatile standard zoom for interviews and coverage.",
    specs: [
      { label: "Focal length", value: "24–70mm" },
      { label: "Aperture", value: "Demo specification" },
    ],
    images: ["/equipment/lenses.svg", "/equipment/demo-card.svg"],
    accessories: ["Front cap", "Rear cap", "Demo hood"],
    daily_rate_minor: 35000,
    deposit_minor: 80000,
    quantity_total: 4,
    ownership: "oxsnow",
  },
  {
    id: "demo-lens-50",
    slug: "demo-50mm-prime",
    name: "50mm Prime Lens",
    category: "lenses",
    description:
      "Demo listing — replace with real Oxsnow inventory. Fast prime for low-light and portrait work.",
    specs: [
      { label: "Focal length", value: "50mm" },
      { label: "Aperture", value: "Demo specification" },
    ],
    images: ["/equipment/lenses.svg", "/equipment/demo-card.svg"],
    accessories: ["Front cap", "Rear cap"],
    daily_rate_minor: 25000,
    deposit_minor: 50000,
    quantity_total: 4,
    ownership: "oxsnow",
  },
  {
    id: "demo-light-panel",
    slug: "demo-led-panel-light",
    name: "LED Panel Light",
    category: "lighting",
    description:
      "Demo listing — replace with real Oxsnow inventory. Bi-colour panel for interviews and small sets.",
    specs: [
      { label: "Output", value: "Demo specification" },
      { label: "Colour", value: "Bi-colour" },
    ],
    images: ["/equipment/lighting.svg", "/equipment/demo-card.svg"],
    accessories: ["Demo stand", "Demo diffuser", "Power cable"],
    daily_rate_minor: 30000,
    deposit_minor: 60000,
    quantity_total: 6,
    ownership: "oxsnow",
  },
  {
    id: "demo-light-softbox",
    slug: "demo-softbox-kit",
    name: "Softbox Kit",
    category: "lighting",
    description:
      "Demo listing — replace with real Oxsnow inventory. Softbox and speedlight kit for flattering key light.",
    specs: [{ label: "Size", value: "Demo specification" }],
    images: ["/equipment/lighting.svg", "/equipment/demo-card.svg"],
    accessories: ["Softbox", "Demo speedlight", "Stand"],
    daily_rate_minor: 22000,
    deposit_minor: 40000,
    quantity_total: 4,
    ownership: "partner",
  },
  {
    id: "demo-sound-mic",
    slug: "demo-shotgun-microphone",
    name: "Shotgun Microphone",
    category: "sound",
    description:
      "Demo listing — replace with real Oxsnow inventory. Directional microphone for dialogue and field recording.",
    specs: [
      { label: "Pattern", value: "Demo specification" },
      { label: "Connector", value: "XLR" },
    ],
    images: ["/equipment/sound.svg", "/equipment/demo-card.svg"],
    accessories: ["Demo shock mount", "Demo windshield", "XLR cable"],
    daily_rate_minor: 18000,
    deposit_minor: 30000,
    quantity_total: 5,
    ownership: "oxsnow",
  },
  {
    id: "demo-sound-recorder",
    slug: "demo-field-recorder",
    name: "Field Recorder",
    category: "sound",
    description:
      "Demo listing — replace with real Oxsnow inventory. Multi-track field recorder with clean preamps.",
    specs: [
      { label: "Tracks", value: "Demo specification" },
      { label: "Media", value: "SD card" },
    ],
    images: ["/equipment/sound.svg", "/equipment/demo-card.svg"],
    accessories: ["Demo SD card", "Demo batteries", "Bag"],
    daily_rate_minor: 28000,
    deposit_minor: 50000,
    quantity_total: 3,
    ownership: "oxsnow",
  },
  {
    id: "demo-support-tripod",
    slug: "demo-fluid-head-tripod",
    name: "Fluid Head Tripod",
    category: "support",
    description:
      "Demo listing — replace with real Oxsnow inventory. Heavy-duty tripod with fluid head for smooth movement.",
    specs: [
      { label: "Payload", value: "Demo specification" },
      { label: "Head", value: "Fluid" },
    ],
    images: ["/equipment/support.svg", "/equipment/demo-card.svg"],
    accessories: ["Demo plate", "Carry bag"],
    daily_rate_minor: 20000,
    deposit_minor: 40000,
    quantity_total: 5,
    ownership: "oxsnow",
  },
  {
    id: "demo-support-gimbal",
    slug: "demo-gimbal-stabiliser",
    name: "Gimbal Stabiliser",
    category: "support",
    description:
      "Demo listing — replace with real Oxsnow inventory. Three-axis gimbal for handheld movement.",
    specs: [
      { label: "Payload", value: "Demo specification" },
      { label: "Axes", value: "3-axis" },
    ],
    images: ["/equipment/support.svg", "/equipment/demo-card.svg"],
    accessories: ["Demo batteries", "Charger", "Case"],
    daily_rate_minor: 45000,
    deposit_minor: 90000,
    quantity_total: 2,
    ownership: "partner",
  },
  {
    id: "demo-drone-kit",
    slug: "demo-aerial-drone-kit",
    name: "Aerial Drone Kit",
    category: "drones",
    description:
      "Demo listing — replace with real Oxsnow inventory. Aerial platform with controller and batteries. Operator licence required.",
    specs: [
      { label: "Camera", value: "Demo specification" },
      { label: "Flight time", value: "Demo specification" },
    ],
    images: ["/equipment/drones.svg", "/equipment/demo-card.svg"],
    accessories: ["Controller", "Demo batteries", "Carry case"],
    daily_rate_minor: 90000,
    deposit_minor: 250000,
    quantity_total: 2,
    ownership: "oxsnow",
  },
  {
    id: "demo-acc-battery",
    slug: "demo-battery-charger-kit",
    name: "Battery & Charger Kit",
    category: "accessories",
    description:
      "Demo listing — replace with real Oxsnow inventory. Spare batteries and multi-bay charger for long shoot days.",
    specs: [{ label: "Compatibility", value: "Demo specification" }],
    images: ["/equipment/accessories.svg", "/equipment/demo-card.svg"],
    accessories: ["Demo batteries", "Multi-bay charger"],
    daily_rate_minor: 12000,
    deposit_minor: 25000,
    quantity_total: 8,
    ownership: "oxsnow",
  },
  {
    id: "demo-acc-nd",
    slug: "demo-nd-filter-set",
    name: "ND Filter Set",
    category: "accessories",
    description:
      "Demo listing — replace with real Oxsnow inventory. Neutral-density filters for controlling exposure outdoors.",
    specs: [{ label: "Strengths", value: "Demo specification" }],
    images: ["/equipment/accessories.svg", "/equipment/demo-card.svg"],
    accessories: ["Demo filter case", "Cleaning cloth"],
    daily_rate_minor: 9000,
    deposit_minor: 15000,
    quantity_total: 6,
    ownership: "partner",
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
