import { and, count, eq, sql } from "drizzle-orm";
import { LIMITE_RECLAMOS_24H } from "@/lib/reclamos";
import { db } from "./index";
import { reclamos } from "./esquema";

export class LimiteReclamos extends Error {
  constructor() {
    super("Límite de reclamos alcanzado");
  }
}

export type DatosReclamo = {
  fecha: string;
  documento: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  bien: string;
  monto: number;
  descripcion: string;
  tipo: string;
  detalle: string;
};

export async function registrarReclamo(datos: DatosReclamo, ipHash: string | null): Promise<number> {
  const controlar = process.env.LIMITE_RESERVAS !== "off" && Boolean(ipHash);

  return db.transaction(async (tx) => {
    if (controlar && ipHash) {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"rec:" + ipHash}))`);
      const [fila] = await tx
        .select({ total: count() })
        .from(reclamos)
        .where(and(eq(reclamos.ipHash, ipHash), sql`${reclamos.creadoEn} > now() - interval '24 hours'`));
      if (Number(fila.total) >= LIMITE_RECLAMOS_24H) throw new LimiteReclamos();
    }

    const [creado] = await tx
      .insert(reclamos)
      .values({ ...datos, monto: datos.monto.toFixed(2), ipHash })
      .returning({ id: reclamos.id });
    return creado.id;
  });
}
