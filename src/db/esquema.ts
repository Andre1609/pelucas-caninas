import { boolean, customType, date, index, integer, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const productos = pgTable("productos", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nombre: text("nombre").notNull(),
  categoria: text("categoria").notNull(),
  precio: numeric("precio", { precision: 10, scale: 2 }).notNull(),
  resumen: text("resumen").notNull(),
  descripcion: text("descripcion").notNull(),
  imagen: text("imagen").notNull(),
  orden: integer("orden").notNull().default(0),
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
});

export const citas = pgTable(
  "citas",
  {
    id: serial("id").primaryKey(),
    fecha: date("fecha", { mode: "string" }).notNull(),
    hora: text("hora").notNull(),
    duracionMin: integer("duracion_min").notNull(),
    puestos: integer("puestos").notNull().default(1),
    clienteNombre: text("cliente_nombre").notNull(),
    telefono: text("telefono").notNull(),
    notas: text("notas"),
    ipHash: text("ip_hash"),
    estado: text("estado").notNull().default("pendiente"),
    creadoEn: timestamp("creado_en").notNull().defaultNow(),
  },
  (t) => [index("citas_fecha_idx").on(t.fecha), index("citas_ip_creado_idx").on(t.ipHash, t.creadoEn)],
);

export const citaMascotas = pgTable(
  "cita_mascotas",
  {
    id: serial("id").primaryKey(),
    citaId: integer("cita_id")
      .notNull()
      .references(() => citas.id, { onDelete: "cascade" }),
    nombre: text("nombre").notNull(),
    tamano: text("tamano").notNull(),
    servicio: text("servicio").notNull(),
    duracionMin: integer("duracion_min").notNull(),
  },
  (t) => [index("cita_mascotas_cita_idx").on(t.citaId)],
);

export const reclamos = pgTable(
  "reclamos",
  {
    id: serial("id").primaryKey(),
    creadoEn: timestamp("creado_en").notNull().defaultNow(),
    fecha: date("fecha", { mode: "string" }).notNull(),
    documento: text("documento").notNull(),
    nombre: text("nombre").notNull(),
    apellido: text("apellido").notNull(),
    email: text("email"),
    telefono: text("telefono"),
    direccion: text("direccion"),
    bien: text("bien").notNull(),
    monto: numeric("monto", { precision: 10, scale: 2 }).notNull(),
    descripcion: text("descripcion").notNull(),
    tipo: text("tipo").notNull(),
    detalle: text("detalle").notNull(),
    estado: text("estado").notNull().default("pendiente"),
    respuesta: text("respuesta"),
    atendidoEn: timestamp("atendido_en"),
    ipHash: text("ip_hash"),
  },
  (t) => [index("reclamos_estado_idx").on(t.estado, t.creadoEn), index("reclamos_ip_idx").on(t.ipHash, t.creadoEn)],
);

export const imagenes = pgTable("imagenes", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull(),
  datos: bytea("datos").notNull(),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
});
