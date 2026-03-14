/**
 * Run schema + seed. Usage: node scripts/init-db.js
 * Requires DATABASE_URL in env.
 */
require("dotenv").config();
const { readFileSync } = require("fs");
const { join } = require("path");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const schema = readFileSync(join(__dirname, "..", "src", "db", "schema.sql"), "utf8");
  await pool.query(schema);
  console.log("Schema applied.");

  const categories = [
    ["Tools", "tools"],
    ["Kitchen", "kitchen"],
    ["Furniture", "furniture"],
    ["Electronics", "electronics"],
    ["Sports", "sports"],
    ["Books", "books"],
    ["Other", "other"],
  ];
  for (const [name, slug] of categories) {
    await pool.query(
      "INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING",
      [name, slug]
    );
  }
  console.log("Categories seeded.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
