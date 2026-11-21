import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { crearCita, HorarioNoDisponible, LimiteReservas } from "@/db/citas";
import { AGENDA, fechaReservable, SERVICIO_IDS, TAMANO_IDS } from "@/lib/agenda";
import { hashIp, ipDelCliente } from "@/lib/ip";

const mascota = z.object({
  nombre: z.string().trim().min(1, "Escribe el nombre de cada mascota").max(60),
  tamano: z.enum(TAMANO_IDS, { message: "Elige el tamaño de cada mascota" }),
  servicio: z.enum(SERVICIO_IDS, { message: "Elige un servicio válido para cada mascota" }),
});

const esquema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elige un día válido"),
  hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Elige una hora válida"),
  clienteNombre: z.string().trim().min(2, "Escribe tu nombre").max(80),
  telefono: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^\+?\d{9,15}$/, "Escribe un número de WhatsApp válido")),
  mascotas: z
    .array(mascota)
    .min(1, "Agrega al menos una mascota")
    .max(AGENDA.maxMascotas, `Máximo ${AGENDA.maxMascotas} mascotas por reserva. Para más, escríbenos por WhatsApp.`),
  notas: z.string().trim().max(300).optional(),
  web: z.string().max(0, "Solicitud inválida").optional(),
});

export async function POST(request: NextRequest) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const resultado = esquema.safeParse(cuerpo);
  if (!resultado.success) {
    const mensaje = resultado.error.issues[0]?.message ?? "Revisa los datos del formulario";
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }

  const { web: _trampa, ...datos } = resultado.data;
  if (!fechaReservable(datos.fecha)) {
    return NextResponse.json({ error: "Ese día no está disponible para reservar. Elige otro, por favor." }, { status: 400 });
  }
  try {
    const ip = ipDelCliente(request.headers);
    const id = await crearCita({ ...datos, ipHash: ip ? hashIp(ip, process.env.AUTH_SECRET ?? "") : null });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof LimiteReservas) {
      return NextResponse.json(
        { error: `Alcanzaste el máximo de ${AGENDA.reservasMaximasPor24h} reservas en 24 horas. Si necesitas más, escríbenos por WhatsApp.` },
        { status: 429 },
      );
    }
    if (error instanceof HorarioNoDisponible) {
      return NextResponse.json({ error: "Ese horario se acaba de ocupar. Elige otro, por favor." }, { status: 409 });
    }
    console.error("Error al crear la cita", error);
    return NextResponse.json({ error: "No pudimos guardar tu cita. Inténtalo otra vez." }, { status: 500 });
  }
}
