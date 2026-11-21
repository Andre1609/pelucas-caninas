import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, leerToken } from "./auth";

export const secretoAuth = () => process.env.AUTH_SECRET ?? "";

export const authConfigurado = () =>
  secretoAuth().length >= 32 && Boolean(process.env.ADMIN_USER) && Boolean(process.env.ADMIN_PASSWORD_HASH);

export async function sesionActual() {
  const jar = await cookies();
  return leerToken(jar.get(COOKIE_SESION)?.value, secretoAuth());
}

export async function requerirAdmin() {
  const usuario = await sesionActual();
  if (!usuario) redirect("/admin/login");
  return usuario;
}

function mismoOrigen(request: NextRequest) {
  const origen = request.headers.get("origin");
  if (!origen) return true;
  try {
    return new URL(origen).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function exigirAdminApi(request: NextRequest): Promise<NextResponse | null> {
  if (!(await sesionActual())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (request.method !== "GET" && !mismoOrigen(request)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }
  return null;
}
