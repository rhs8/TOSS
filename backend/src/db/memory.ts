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

  const poolLike = {
    query: (text: string, params?: unknown[]) => client.query(text, params),
  };
  return { query: poolLike.query, pool: poolLike };
}
