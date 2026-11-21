import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { claveValida, COOKIE_SESION, crearToken, DURACION_SESION_SEG, igualSeguro } from "@/lib/auth";
import { bloqueado, limpiarFallos, registrarFallo } from "@/lib/limite";
import { authConfigurado, secretoAuth } from "@/lib/sesion";

const esquema = z.object({
  usuario: z.string().max(80),
  clave: z.string().max(200),
});

export async function POST(request: NextRequest) {
  if (!authConfigurado()) {
    return NextResponse.json({ error: "El acceso de administrador no está configurado" }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (bloqueado(ip)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo." }, { status: 429 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const datos = esquema.safeParse(cuerpo);
  if (!datos.success) return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });

  const usuarioOk = igualSeguro(datos.data.usuario, process.env.ADMIN_USER!);
  const claveOk = claveValida(datos.data.clave, process.env.ADMIN_PASSWORD_HASH!);
  if (!usuarioOk || !claveOk) {
    registrarFallo(ip);
    await new Promise((resolver) => setTimeout(resolver, 400));
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  limpiarFallos(ip);
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(COOKIE_SESION, crearToken(process.env.ADMIN_USER!, secretoAuth()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_SESION_SEG,
  });
  return respuesta;
}
