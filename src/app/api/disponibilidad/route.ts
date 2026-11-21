import { NextResponse, type NextRequest } from "next/server";
import { horariosLibres } from "@/db/citas";
import { AGENDA, buscarServicio, fechaReservable } from "@/lib/agenda";

export async function GET(request: NextRequest) {
  const fecha = request.nextUrl.searchParams.get("fecha") ?? "";
  const servicios = (request.nextUrl.searchParams.get("servicios") ?? "").split(",").filter(Boolean);

  const validos =
    servicios.length >= 1 && servicios.length <= AGENDA.maxMascotas && servicios.every((s) => buscarServicio(s));
  if (!validos || !fechaReservable(fecha)) {
    return NextResponse.json({ error: "Fecha o servicios inválidos" }, { status: 400 });
  }

  try {
    const horarios = await horariosLibres(fecha, servicios);
    return NextResponse.json({ horarios }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error al consultar disponibilidad", error);
    return NextResponse.json({ error: "No pudimos consultar los horarios" }, { status: 500 });
  }
}
