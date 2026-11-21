import { obtenerImagen } from "@/db/imagenes";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return new Response("No encontrada", { status: 404 });

  const imagen = await obtenerImagen(id);
  if (!imagen) return new Response("No encontrada", { status: 404 });

  return new Response(new Uint8Array(imagen.datos), {
    headers: {
      "Content-Type": imagen.tipo,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
