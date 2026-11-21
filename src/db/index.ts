import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as esquema from "./esquema";
import { prepararDatabaseUrl } from "./url";

const globalForDb = globalThis as unknown as { pool?: Pool };

function crearPool() {
  const conexion = prepararDatabaseUrl(process.env.DATABASE_URL);
  if ("error" in conexion) throw new Error(conexion.error);
  return new Pool({ connectionString: conexion.url, max: Number(process.env.DB_POOL_MAX ?? 5) });
}

export const pool = globalForDb.pool ?? crearPool();
globalForDb.pool = pool;

export const db = drizzle(pool, { schema: esquema });
