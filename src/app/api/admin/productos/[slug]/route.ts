import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { actualizarProducto } from "@/db/admin";
import { esquemaProductoCambios } from "@/lib/productos";
import { exigirAdminApi } from "@/lib/sesion";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const denegado = await exigirAdminApi(request);
  if (denegado) return denegado;

  const { slug } = await params;
  const datos = esquemaProductoCambios.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return NextResponse.json({ error: datos.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  try {
    const existe = await actualizarProducto(slug, datos.data);
    if (!existe) return NextResponse.json({ error: "El producto no existe" }, { status: 404 });
    revalidatePath("/productos");
    revalidatePath(`/productos/${slug}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al actualizar el producto", error);
    return NextResponse.json({ error: "No se pudo guardar el producto" }, { status: 500 });
  }
}
