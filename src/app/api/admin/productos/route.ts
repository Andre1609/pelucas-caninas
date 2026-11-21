import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { crearProducto } from "@/db/admin";
import { esquemaProductoNuevo } from "@/lib/productos";
import { exigirAdminApi } from "@/lib/sesion";

export async function POST(request: NextRequest) {
  const denegado = await exigirAdminApi(request);
  if (denegado) return denegado;

  const datos = esquemaProductoNuevo.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return NextResponse.json({ error: datos.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  try {
    const slug = await crearProducto(datos.data);
    revalidatePath("/productos");
    return NextResponse.json({ slug }, { status: 201 });
  } catch (error) {
    console.error("Error al crear el producto", error);
    return NextResponse.json({ error: "No se pudo crear el producto" }, { status: 500 });
  }
}
