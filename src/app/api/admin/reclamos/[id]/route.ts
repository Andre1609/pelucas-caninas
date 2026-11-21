import { NextResponse, type NextRequest } from "next/server";
import { cambiarReclamo } from "@/db/admin";
import { esquemaReclamoCambios } from "@/lib/reclamos";
import { exigirAdminApi } from "@/lib/sesion";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denegado = await exigirAdminApi(request);
  if (denegado) return denegado;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Reclamo inválido" }, { status: 400 });

  const datos = esquemaReclamoCambios.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return NextResponse.json({ error: datos.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  try {
    const existe = await cambiarReclamo(id, datos.data.estado, datos.data.respuesta);
    if (!existe) return NextResponse.json({ error: "El reclamo no existe" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al actualizar el reclamo", error);
    return NextResponse.json({ error: "No se pudo actualizar el reclamo" }, { status: 500 });
  }
}
