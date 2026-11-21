import "./cargar-entorno";
import { createInterface } from "node:readline/promises";
import { sql } from "drizzle-orm";
import { db, pool } from "./index";

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const respuesta = await rl.question("Esto BORRA todas las citas guardadas. Escribe SI para continuar: ");
  rl.close();
  if (respuesta.trim().toUpperCase() !== "SI") {
    console.log("Cancelado, no se borró nada.");
  } else {
    await db.execute(sql`drop table if exists cita_mascotas, citas cascade`);
    console.log("✔ Tablas de citas eliminadas. Ahora ejecuta: npm run db:push");
  }
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
