import { NextResponse, type NextRequest } from "next/server";
import { LimiteReclamos, registrarReclamo } from "@/db/reclamos";
import { hashIp, ipDelCliente } from "@/lib/ip";
import { esquemaReclamo, LIMITE_RECLAMOS_24H } from "@/lib/reclamos";

export async function POST(request: NextRequest) {
  const cuerpo = await request.json().catch(() => null);
  const datos = esquemaReclamo.safeParse(cuerpo);
  if (!datos.success) {
    return NextResponse.json({ error: datos.error.issues[0]?.message ?? "Revisa los datos del formulario" }, { status: 400 });
  }

  const { web: _trampa, declaracion: _declaracion, datos: _datos, ...reclamo } = datos.data;
  const ip = ipDelCliente(request.headers);

  try {
    const id = await registrarReclamo(reclamo, ip ? hashIp(ip, process.env.AUTH_SECRET ?? "") : null);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof LimiteReclamos) {
      return NextResponse.json(
        { error: `Alcanzaste el máximo de ${LIMITE_RECLAMOS_24H} reclamos en 24 horas. Si es urgente, escríbenos por WhatsApp.` },
        { status: 429 },
      );
    }
    console.error("Error al registrar el reclamo", error);
    return NextResponse.json({ error: "No pudimos registrar tu reclamo. Inténtalo otra vez." }, { status: 500 });
  }
}
