import { and, count, eq, ne, sql, type SQL } from "drizzle-orm";
import { AGENDA, aMinutos, buscarServicio, horariosDisponibles, planificarGrupo, type Rango } from "@/lib/agenda";
import { claveTelefono } from "@/lib/ip";
import { db } from "./index";
import { citaMascotas, citas } from "./esquema";

export type NuevaMascota = { nombre: string; tamano: string; servicio: string };

export type NuevaCita = {
  fecha: string;
  hora: string;
  clienteNombre: string;
  telefono: string;
  notas?: string;
  mascotas: NuevaMascota[];
  ipHash?: string | null;
};

export class HorarioNoDisponible extends Error {
  constructor() {
    super("Ese horario ya no está disponible");
  }
}

export class LimiteReservas extends Error {
  constructor() {
    super("Límite de reservas alcanzado");
  }
}

type Consulta = Pick<typeof db, "select">;

const limiteActivo = () => process.env.LIMITE_RESERVAS !== "off";

async function reservasRecientes(conn: Consulta, condicion: SQL): Promise<number> {
  const [fila] = await conn
    .select({ total: count() })
    .from(citas)
    .where(and(condicion, sql`${citas.creadoEn} > now() - interval '24 hours'`));
  return Number(fila.total);
}

export async function rangosOcupados(conn: Consulta, fecha: string, excluirId?: number): Promise<Rango[]> {
  const filas = await conn
    .select({ hora: citas.hora, duracionMin: citas.duracionMin, puestos: citas.puestos })
    .from(citas)
    .where(and(eq(citas.fecha, fecha), ne(citas.estado, "cancelada"), excluirId ? ne(citas.id, excluirId) : undefined));
  return filas.map((f) => ({
    inicioMin: aMinutos(f.hora),
    finMin: aMinutos(f.hora) + f.duracionMin,
    puestos: f.puestos,
  }));
}

export async function horariosLibres(fecha: string, servicioIds: string[]): Promise<string[]> {
  const plan = planificarGrupo(servicioIds);
  if (!plan) return [];
  return horariosDisponibles({ fecha, ...plan, ocupadas: await rangosOcupados(db, fecha) });
}

export async function crearCita(datos: NuevaCita): Promise<number> {
  const plan = planificarGrupo(datos.mascotas.map((m) => m.servicio));
  if (!plan) throw new Error("Servicio inválido");

  const telefono = claveTelefono(datos.telefono);
  const controlar = limiteActivo();

  return db.transaction(async (tx) => {
    if (controlar) {
      if (datos.ipHash) await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"ip:" + datos.ipHash}))`);
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"tel:" + telefono}))`);
    }
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"citas:" + datos.fecha}))`);

    if (controlar) {
      const maximo = AGENDA.reservasMaximasPor24h;
      const porTelefono = sql`right(regexp_replace(${citas.telefono}, '\\D', '', 'g'), 9) = ${telefono}`;
      if ((await reservasRecientes(tx, porTelefono)) >= maximo) throw new LimiteReservas();
      if (datos.ipHash && (await reservasRecientes(tx, eq(citas.ipHash, datos.ipHash))) >= maximo) throw new LimiteReservas();
    }

    const libres = horariosDisponibles({ fecha: datos.fecha, ...plan, ocupadas: await rangosOcupados(tx, datos.fecha) });
    if (!libres.includes(datos.hora)) throw new HorarioNoDisponible();

    const [cita] = await tx
      .insert(citas)
      .values({
        fecha: datos.fecha,
        hora: datos.hora,
        duracionMin: plan.duracionMin,
        puestos: plan.puestos,
        clienteNombre: datos.clienteNombre,
        telefono: datos.telefono,
        notas: datos.notas || null,
        ipHash: datos.ipHash ?? null,
      })
      .returning({ id: citas.id });

    await tx.insert(citaMascotas).values(
      datos.mascotas.map((m) => ({
        citaId: cita.id,
        nombre: m.nombre,
        tamano: m.tamano,
        servicio: m.servicio,
        duracionMin: buscarServicio(m.servicio)!.duracionMin,
      })),
    );
    return cita.id;
  });
}
