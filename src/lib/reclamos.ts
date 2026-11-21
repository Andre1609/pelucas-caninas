import { z } from "zod";
import { ahoraLima, esFechaReal } from "./agenda";

export const BIENES = ["producto", "servicio"] as const;
export const TIPOS = ["queja", "reclamo"] as const;
export const LIMITE_RECLAMOS_24H = 5;

const vacioAIndefinido = (valor: string | undefined) => (valor ? valor : undefined);

export const esquemaReclamo = z.object({
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Elige una fecha válida")
    .refine(esFechaReal, "Elige una fecha válida")
    .refine((f) => f <= ahoraLima().fecha, "La fecha no puede ser futura"),
  documento: z.string().trim().min(5, "Escribe tu número de documento").max(20, "El documento es muy largo"),
  nombre: z.string().trim().min(1, "Escribe tu nombre").max(80),
  apellido: z.string().trim().min(1, "Escribe tu apellido").max(80),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform(vacioAIndefinido)
    .refine((v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Escribe un correo válido"),
  telefono: z
    .string()
    .trim()
    .max(25)
    .optional()
    .transform(vacioAIndefinido)
    .refine((v) => v === undefined || /^\+?[\d\s()-]{6,25}$/.test(v), "Escribe un teléfono válido"),
  direccion: z.string().trim().max(200).optional().transform(vacioAIndefinido),
  bien: z.enum(BIENES, { message: "Indica si es un producto o un servicio" }),
  monto: z.number("Escribe el monto reclamado").min(0, "El monto no puede ser negativo").max(1_000_000),
  descripcion: z.string().trim().min(3, "Describe el producto o servicio").max(1000),
  tipo: z.enum(TIPOS, { message: "Indica si es una queja o un reclamo" }),
  detalle: z.string().trim().min(3, "Cuéntanos el detalle").max(2000),
  declaracion: z.literal(true, { message: "Debes confirmar la declaración" }),
  datos: z.literal(true, { message: "Debes aceptar el tratamiento de datos" }),
  web: z.string().max(0, "Solicitud inválida").optional(),
});

export const esquemaReclamoCambios = z.object({
  estado: z.enum(["pendiente", "atendido"]),
  respuesta: z.string().trim().max(1000, "La respuesta es muy larga").optional(),
});

export const numeroReclamo = (id: number) => String(id).padStart(4, "0");

export function formatMomento(fecha: Date) {
  return fecha.toLocaleString("es-PE", { timeZone: "America/Lima", dateStyle: "medium", timeStyle: "short" });
}

type ReclamoMensaje = { id: number; nombre: string; tipo: string; estado: string; respuesta: string | null };

export function mensajeReclamo(r: ReclamoMensaje) {
  const base = `Hola ${r.nombre}, te escribimos de Pelucas Caninas sobre tu ${r.tipo} N.° ${numeroReclamo(r.id)}.`;
  return r.estado === "atendido" && r.respuesta ? `${base}\n\n${r.respuesta}` : base;
}
