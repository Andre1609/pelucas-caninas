import { eq } from "drizzle-orm";
import { db } from "./index";
import { imagenes } from "./esquema";

export async function guardarImagen(datos: Buffer): Promise<number> {
  const [fila] = await db.insert(imagenes).values({ tipo: "image/webp", datos }).returning({ id: imagenes.id });
  return fila.id;
}

export async function obtenerImagen(id: number) {
  const [fila] = await db.select({ tipo: imagenes.tipo, datos: imagenes.datos }).from(imagenes).where(eq(imagenes.id, id)).limit(1);
  return fila ?? null;
}
