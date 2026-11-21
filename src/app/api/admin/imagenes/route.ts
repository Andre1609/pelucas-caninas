import { NextResponse, type NextRequest } from "next/server";
import { guardarImagen } from "@/db/imagenes";
import { ImagenInvalida, MAX_BYTES, procesarImagen } from "@/lib/imagen";
import { exigirAdminApi } from "@/lib/sesion";

export async function POST(request: NextRequest) {
  const denegado = await exigirAdminApi(request);
  if (denegado) return denegado;

  const formulario = await request.formData().catch(() => null);
  const archivo = formulario?.get("archivo");
  if (!(archivo instanceof File)) return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
  if (archivo.size > MAX_BYTES) return NextResponse.json({ error: "La imagen debe pesar menos de 4 MB" }, { status: 413 });

  try {
    const optimizada = await procesarImagen(Buffer.from(await archivo.arrayBuffer()));
    const id = await guardarImagen(optimizada);
    return NextResponse.json({ url: `/api/imagenes/${id}` }, { status: 201 });
  } catch (error) {
    if (error instanceof ImagenInvalida) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Error al guardar la imagen", error);
    return NextResponse.json({ error: "No se pudo guardar la imagen" }, { status: 500 });
  }
}
