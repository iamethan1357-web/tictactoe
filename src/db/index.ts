import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

function createDb() {
  // If the URL contains "neon.tech" use the serverless Neon driver
  // Otherwise fall back to the standard pg Pool (local dev / sandbox)
  if (databaseUrl!.includes("neon.tech") || databaseUrl!.includes("neon.")) {
    const sql = neon(databaseUrl!);
    return drizzleNeon(sql);
  }

  const globalForDb = globalThis as typeof globalThis & {
    __arenaNextJsPostgresqlPool?: Pool;
  };

  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({ connectionString: databaseUrl });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  return drizzlePg(pool);
}

export const db = createDb();
