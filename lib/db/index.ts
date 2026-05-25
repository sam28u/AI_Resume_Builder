import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ [DB] DATABASE_URL is missing from environment variables");
}

// 1. Initialize the PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

// 2. Attach Event Listeners to the Pool
// These catch background events that happen outside the standard request lifecycle
pool.on("connect", () => {
  console.log("🔌 [DB] New client connected to PostgreSQL pool");
});

pool.on("error", (err) => {
  console.error("❌ [DB] Unexpected database error on an idle client", err);
});

// 3. Handle Next.js Hot-Reloading Singleton
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

let conn: Pool;

if (!globalForDb.conn) {
  console.log("🌱 [DB] Creating brand new database connection pool...");
  conn = pool;
  if (process.env.NODE_ENV !== "production") {
    globalForDb.conn = conn;
  }
} else {
  console.log("♻️ [DB] Reusing existing connection pool (Next.js Hot Reload)");
  conn = globalForDb.conn;
}

// 4. Export the Drizzle instance
export const db = drizzle(conn, { 
  schema,
  
  // NOTE: Drizzle has a built-in logger. 
  // If you want to see the exact raw SQL queries it writes in your terminal, 
  // uncomment the line below:
  
  // logger: process.env.NODE_ENV === "development" 
});