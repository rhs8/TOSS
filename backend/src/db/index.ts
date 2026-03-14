import { Pool } from "pg";
import dotenv from "dotenv";
import { createMemoryDb } from "./memory";

dotenv.config();

type PoolLike = { query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }> };

let poolRef: Pool | PoolLike | null = null;

export async function initDb(): Promise<void> {
  if (poolRef) return;
  const url = process.env.DATABASE_URL?.trim();
  if (url && url !== "memory") {
    poolRef = new Pool({
      connectionString: url,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    });
  } else {
    console.log("Using in-memory database (no DATABASE_URL).");
    const mem = await createMemoryDb();
    poolRef = mem.pool;
  }
}

async function getPool(): Promise<Pool | PoolLike> {
  if (!poolRef) await initDb();
  if (!poolRef) throw new Error("Database not initialized");
  return poolRef;
}

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const pool = await getPool();
  const res = await pool.query(text, params);
  return (res.rows as T[]) || [];
}

export async function queryOne<T = unknown>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

