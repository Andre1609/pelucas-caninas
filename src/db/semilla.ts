import "./cargar-entorno";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import { db, pool } from "./index";
import { productos } from "./esquema";

type Semilla = {
  slug: string;
  nombre: string;
  categoria: string;
  precio: number;
  resumen: string;
  descripcion: string;
  imagen: string;
  orden: number;
};

async function main() {
  const data: Semilla[] = JSON.parse(readFileSync(join(process.cwd(), "data", "productos.json"), "utf8"));

  await db
    .insert(productos)
    .values(data.map((p) => ({ ...p, precio: p.precio.toFixed(2) })))
    .onConflictDoUpdate({
      target: productos.slug,
      set: {
        nombre: sql`excluded.nombre`,
        categoria: sql`excluded.categoria`,
        precio: sql`excluded.precio`,
        resumen: sql`excluded.resumen`,
        descripcion: sql`excluded.descripcion`,
        imagen: sql`excluded.imagen`,
        orden: sql`excluded.orden`,
      },
    });

  console.log(`✔ ${data.length} productos cargados`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
