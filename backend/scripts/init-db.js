/**
 * Run schema + seed. Usage: node scripts/init-db.js
 * Requires DATABASE_URL in env.
 */
require("dotenv").config();
const { readFileSync } = require("fs");
const { join } = require("path");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString || connectionString === "memory") {
  console.error("DATABASE_URL must be a PostgreSQL connection string (not 'memory').");
  process.exit(1);
}
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

async function main() {
  const schema = readFileSync(join(__dirname, "..", "src", "db", "schema.sql"), "utf8");
  await pool.query(schema);
  console.log("Schema applied.");

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
    await pool.query(
      "INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING",
      [name, slug]
    );
  }
  console.log("Categories seeded.");

  const circles = [
    ["SFU Students", "sfu", ["sfu.ca"]],
  ];
  for (const [name, slug, domains] of circles) {
    await pool.query(
      "INSERT INTO community_circles (name, slug, allowed_email_domains) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING",
      [name, slug, domains]
    );
  }
  console.log("Community circles seeded.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
