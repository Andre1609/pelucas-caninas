import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { cambiarEstado, ConflictoHorario } from "@/db/admin";
import { exigirAdminApi } from "@/lib/sesion";

const esquema = z.object({ estado: z.enum(["pendiente", "confirmada", "cancelada"]) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denegado = await exigirAdminApi(request);
  if (denegado) return denegado;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Cita inválida" }, { status: 400 });

  const datos = esquema.safeParse(await request.json().catch(() => null));
  if (!datos.success) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });

  try {
    const resultado = await cambiarEstado(id, datos.data.estado);
    if (resultado === "no-existe") return NextResponse.json({ error: "La cita no existe" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ConflictoHorario) {
      return NextResponse.json({ error: "Ese horario ya fue ocupado por otra cita, no se puede reabrir." }, { status: 409 });
    }
    console.error("Error al cambiar el estado de la cita", error);
    return NextResponse.json({ error: "No se pudo actualizar la cita" }, { status: 500 });
  }
}
