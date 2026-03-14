/**
 * In-memory PostgreSQL (pg-mem) for local dev when DATABASE_URL is not set.
 * No Docker or install required.
 */
import { newDb, DataType } from "pg-mem";
import { v4 as uuidv4 } from "uuid";
import { readFileSync } from "fs";
import { join } from "path";

const schemaPath = join(__dirname, "schema.sql");

export async function createMemoryDb(): Promise<{
  query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
  pool: { query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }> };
}> {
  const db = newDb();
  db.public.registerFunction({
    name: "gen_random_uuid",
    returns: DataType.uuid,
    implementation: () => uuidv4(),
    impure: true,
  });

  const schema = readFileSync(schemaPath, "utf8");
  db.public.none(schema);

  const { Client } = db.adapters.createPg();
  const client = new Client();

  const categories = [
    ["Board games", "board-games"],
    ["Books", "books"],
    ["Clothes & accessories", "clothes-accessories"],
    ["Cleaning machines", "cleaning-machines"],
    ["Maintenance devices", "maintenance-devices"],
    ["Moving boxes", "moving-boxes"],
    ["Costumes (Halloween & more)", "costumes"],
    ["House decorations", "house-decorations"],
    ["Furniture", "furniture"],
    ["Kitchen", "kitchen"],
    ["Tools", "tools"],
    ["Electronics", "electronics"],
    ["Sports", "sports"],
    ["Other", "other"],
  ];
  for (const [name, slug] of categories) {
    await client.query(
      "INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING",
      [name, slug]
    );
  }
  await client.query(
    "INSERT INTO community_circles (name, slug, allowed_email_domains) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING",
    ["SFU Students", "sfu", ["sfu.ca"]]
  );

  // Demo: fake users and items so you can request an item in the demo
  try {
  const commitmentEnds = new Date();
  commitmentEnds.setMonth(commitmentEnds.getMonth() + 3);
  const demoUsers = [
    { firebase_uid: "demo-alex", email: "alex@example.com", domain: "example.com", display_name: "Alex" },
    { firebase_uid: "demo-jordan", email: "jordan@example.com", domain: "example.com", display_name: "Jordan" },
    { firebase_uid: "demo-sam", email: "sam@example.com", domain: "example.com", display_name: "Sam" },
  ];
  const categoryRows = await client.query("SELECT id, slug FROM categories");
  const catBySlug = Object.fromEntries((categoryRows.rows as { id: string; slug: string }[]).map((r) => [r.slug, r.id]));

  for (const u of demoUsers) {
    await client.query(
      `INSERT INTO users (firebase_uid, email, email_domain, display_name, commitment_ends_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (firebase_uid) DO NOTHING`,
      [u.firebase_uid, u.email, u.domain, u.display_name, commitmentEnds]
    );
  }
  const userRows = await client.query("SELECT id, firebase_uid FROM users WHERE firebase_uid LIKE 'demo-%'");
  const demoUserIds = (userRows.rows as { id: string; firebase_uid: string }[]).map((r) => r.id);

  // Exactly 8 demo items so Browse has content by default
  const demoItems = [
    { owner_idx: 0, category_slug: "tools", title: "Electric drill", description: "Cordless, good for small projects. Pick up near campus." },
    { owner_idx: 0, category_slug: "books", title: "Intro to Python (like new)", description: "Hardcover, barely used." },
    { owner_idx: 1, category_slug: "furniture", title: "IKEA desk lamp", description: "White, adjustable. Works great." },
    { owner_idx: 1, category_slug: "kitchen", title: "Blender", description: "Used for smoothies. Still works perfectly." },
    { owner_idx: 2, category_slug: "electronics", title: "USB-C hub (4 ports)", description: "Lightly used. No issues." },
    { owner_idx: 2, category_slug: "sports", title: "Yoga mat", description: "Non-slip, good condition." },
    { owner_idx: 0, category_slug: "board-games", title: "Catan (4th edition)", description: "Complete, good for game nights." },
    { owner_idx: 1, category_slug: "house-decorations", title: "String lights (warm white)", description: "10m, indoor/outdoor. Barely used." },
  ];

  const firstCategoryId = (categoryRows.rows[0] as { id: string } | undefined)?.id;
  for (const it of demoItems) {
    const ownerId = demoUserIds[it.owner_idx];
    const categoryId = catBySlug[it.category_slug] ?? firstCategoryId;
    if (!ownerId || !categoryId) continue;
    const itemRes = await client.query(
      `INSERT INTO items (owner_id, category_id, title, description, status) VALUES ($1, $2, $3, $4, 'live') RETURNING id`,
      [ownerId, categoryId, it.title, it.description || null]
    );
    const itemId = (itemRes.rows[0] as { id: string })?.id;
    if (itemId) {
      await client.query(
        "INSERT INTO item_holders (item_id, user_id, passed_on_at) VALUES ($1, $2, NULL)",
        [itemId, ownerId]
      );
    }
  }
  } catch (e) {
    console.error("Demo seed error (items may be missing):", e);
  }

  const poolLike = {
    query: (text: string, params?: unknown[]) => client.query(text, params),
  };
  return { query: poolLike.query, pool: poolLike };
}
