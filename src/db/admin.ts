import { and, asc, count, desc, eq, gte, inArray, lt, max, ne, sql } from "drizzle-orm";
import { horariosDisponibles } from "@/lib/agenda";
import { slugify, slugUnico } from "@/lib/slug";
import { db } from "./index";
import { rangosOcupados } from "./citas";
import { citaMascotas, citas, productos, reclamos } from "./esquema";

export type Vista = "proximas" | "canceladas" | "pasadas";
export type Estado = "pendiente" | "confirmada" | "cancelada";

export type CitaAdmin = {
  id: number;
  fecha: string;
  hora: string;
  duracionMin: number;
  clienteNombre: string;
  telefono: string;
  notas: string | null;
  estado: string;
  mascotas: { nombre: string; tamano: string; servicio: string }[];
};

export class ConflictoHorario extends Error {
  constructor() {
    super("Ese horario ya fue ocupado por otra cita");
  }
}

export async function listarCitas(vista: Vista, hoy: string): Promise<CitaAdmin[]> {
  const filtro =
    vista === "proximas"
      ? and(gte(citas.fecha, hoy), ne(citas.estado, "cancelada"))
      : vista === "pasadas"
        ? and(lt(citas.fecha, hoy), ne(citas.estado, "cancelada"))
        : eq(citas.estado, "cancelada");
  const orden = vista === "proximas" ? [asc(citas.fecha), asc(citas.hora)] : [desc(citas.fecha), desc(citas.hora)];

  const filas = await db.select().from(citas).where(filtro).orderBy(...orden);
  if (filas.length === 0) return [];

  const mascotas = await db
    .select()
    .from(citaMascotas)
    .where(inArray(citaMascotas.citaId, filas.map((f) => f.id)))
    .orderBy(asc(citaMascotas.id));

  return filas.map((f) => ({
    id: f.id,
    fecha: f.fecha,
    hora: f.hora,
    duracionMin: f.duracionMin,
    clienteNombre: f.clienteNombre,
    telefono: f.telefono,
    notas: f.notas,
    estado: f.estado,
    mascotas: mascotas.filter((m) => m.citaId === f.id).map((m) => ({ nombre: m.nombre, tamano: m.tamano, servicio: m.servicio })),
  }));
}

export async function cambiarEstado(id: number, estado: Estado): Promise<"ok" | "no-existe"> {
  return db.transaction(async (tx) => {
    const [cita] = await tx.select().from(citas).where(eq(citas.id, id)).limit(1);
    if (!cita) return "no-existe";

    if (cita.estado === "cancelada" && estado !== "cancelada") {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"citas:" + cita.fecha}))`);
      const libres = horariosDisponibles({
        fecha: cita.fecha,
        duracionMin: cita.duracionMin,
        puestos: cita.puestos,
        ocupadas: await rangosOcupados(tx, cita.fecha, id),
      });
      if (!libres.includes(cita.hora)) throw new ConflictoHorario();
    }

    await tx.update(citas).set({ estado }).where(eq(citas.id, id));
    return "ok";
  });
}

export type ProductoAdmin = {
  slug: string;
  nombre: string;
  categoria: string;
  precio: number;
  resumen: string;
  descripcion: string;
  imagen: string;
  activo: boolean;
};

export async function listarProductosAdmin(): Promise<ProductoAdmin[]> {
  const filas = await db.select().from(productos).orderBy(asc(productos.orden));
  return filas.map((p) => ({
    slug: p.slug,
    nombre: p.nombre,
    categoria: p.categoria,
    precio: Number(p.precio),
    resumen: p.resumen,
    descripcion: p.descripcion,
    imagen: p.imagen,
    activo: p.activo,
  }));
}

export async function listarCategorias(): Promise<string[]> {
  const filas = await db.selectDistinct({ categoria: productos.categoria }).from(productos).orderBy(asc(productos.categoria));
  return filas.map((f) => f.categoria);
}

type CambiosProducto = {
  nombre?: string;
  categoria?: string;
  precio?: number;
  resumen?: string;
  descripcion?: string;
  imagen?: string;
  activo?: boolean;
};

export async function actualizarProducto(slug: string, cambios: CambiosProducto): Promise<boolean> {
  const { precio, ...resto } = cambios;
  const filas = await db
    .update(productos)
    .set({ ...resto, ...(precio !== undefined && { precio: precio.toFixed(2) }) })
    .where(eq(productos.slug, slug))
    .returning({ slug: productos.slug });
  return filas.length > 0;
}

export async function crearProducto(datos: {
  nombre: string;
  categoria: string;
  precio: number;
  resumen: string;
  descripcion: string;
  imagen: string;
}): Promise<string> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('productos:nuevo'))`);
    const existentes = await tx.select({ slug: productos.slug }).from(productos);
    const slug = slugUnico(slugify(datos.nombre), existentes.map((e) => e.slug));
    const [{ maximo }] = await tx.select({ maximo: max(productos.orden) }).from(productos);
    await tx.insert(productos).values({ ...datos, slug, precio: datos.precio.toFixed(2), orden: (maximo ?? -1) + 1 });
    return slug;
  });
}

export type VistaReclamos = "pendientes" | "atendidos" | "todos";

export type ReclamoAdmin = {
  id: number;
  creadoEn: Date;
  fecha: string;
  documento: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  bien: string;
  monto: number;
  descripcion: string;
  tipo: string;
  detalle: string;
  estado: string;
  respuesta: string | null;
  atendidoEn: Date | null;
};

export async function listarReclamos(vista: VistaReclamos): Promise<ReclamoAdmin[]> {
  const filtro = vista === "todos" ? undefined : eq(reclamos.estado, vista === "pendientes" ? "pendiente" : "atendido");
  const orden = vista === "pendientes" ? asc(reclamos.creadoEn) : desc(reclamos.creadoEn);
  const filas = await db.select().from(reclamos).where(filtro).orderBy(orden);
  return filas.map(({ ipHash: _ip, ...r }) => ({ ...r, monto: Number(r.monto) }));
}

export async function contarReclamosPendientes(): Promise<number> {
  const [fila] = await db.select({ total: count() }).from(reclamos).where(eq(reclamos.estado, "pendiente"));
  return Number(fila.total);
}

export async function cambiarReclamo(id: number, estado: "pendiente" | "atendido", respuesta?: string): Promise<boolean> {
  const filas = await db
    .update(reclamos)
    .set({
      estado,
      atendidoEn: estado === "atendido" ? sql`now()` : null,
      ...(respuesta !== undefined && { respuesta: respuesta || null }),
    })
    .where(eq(reclamos.id, id))
    .returning({ id: reclamos.id });
  return filas.length > 0;
}
