import { and, asc, eq, ne } from "drizzle-orm";
import { cache } from "react";
import type { ProductoView } from "@/lib/tipos";
import { db } from "./index";
import { productos } from "./esquema";

const toView = (p: typeof productos.$inferSelect): ProductoView => ({
  slug: p.slug,
  nombre: p.nombre,
  categoria: p.categoria,
  precio: Number(p.precio),
  resumen: p.resumen,
  descripcion: p.descripcion,
  imagen: p.imagen,
});

export const getProductos = cache(async (): Promise<ProductoView[]> => {
  const rows = await db.select().from(productos).where(eq(productos.activo, true)).orderBy(asc(productos.orden));
  return rows.map(toView);
});

export const getProductoBySlug = cache(async (slug: string): Promise<ProductoView | null> => {
  const [row] = await db
    .select()
    .from(productos)
    .where(and(eq(productos.slug, slug), eq(productos.activo, true)))
    .limit(1);
  return row ? toView(row) : null;
});

export async function getOtrosProductos(slug: string): Promise<ProductoView[]> {
  const rows = await db
    .select()
    .from(productos)
    .where(and(eq(productos.activo, true), ne(productos.slug, slug)))
    .orderBy(asc(productos.orden));
  return rows.map(toView);
}
