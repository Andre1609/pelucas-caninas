export const AGENDA = {
  zonaHoraria: "America/Lima",
  diasAbiertos: [1, 2, 3, 4, 5, 6],
  apertura: "09:00",
  cierre: "18:00",
  intervaloMin: 30,
  capacidad: 3,
  reservasMaximasPor24h: 2,
  maxMascotas: 5,
  diasAdelante: 30,
  anticipacionMin: 60,
};

export const SERVICIOS_AGENDA = [
  { id: "basico", nombre: "Baño Básico", duracionMin: 60, detalle: "Baño, corte higiénico y uñas" },
  { id: "premium", nombre: "Baño Premium", duracionMin: 90, detalle: "Baño completo con tratamiento" },
  { id: "bano-corte", nombre: "Baño y Corte", duracionMin: 120, detalle: "Estética completa con corte de raza" },
] as const;

export type ServicioId = (typeof SERVICIOS_AGENDA)[number]["id"];
export const SERVICIO_IDS = SERVICIOS_AGENDA.map((s) => s.id) as [ServicioId, ...ServicioId[]];

export const TAMANOS = [
  { id: "pequeno", nombre: "Pequeño (hasta 10 kg)" },
  { id: "mediano", nombre: "Mediano (10 a 25 kg)" },
  { id: "grande", nombre: "Grande (más de 25 kg)" },
] as const;
export const TAMANO_IDS = TAMANOS.map((t) => t.id) as [string, ...string[]];

export type Rango = { inicioMin: number; finMin: number; puestos?: number };
export type Ahora = { fecha: string; minutos: number };

export const buscarServicio = (id: string) => SERVICIOS_AGENDA.find((s) => s.id === id);

export const aMinutos = (hora: string) => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};
export const deMinutos = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export function ahoraLima(date = new Date()): Ahora {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: AGENDA.zonaHoraria,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return { fecha: `${partes.year}-${partes.month}-${partes.day}`, minutos: Number(partes.hour) * 60 + Number(partes.minute) };
}

export const sumarDias = (fecha: string, dias: number) => {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

export const diaSemana = (fecha: string) => new Date(`${fecha}T12:00:00Z`).getUTCDay();

export function esFechaReal(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const real = new Date(`${fecha}T12:00:00Z`);
  return !Number.isNaN(real.getTime()) && real.toISOString().slice(0, 10) === fecha;
}

export function fechaReservable(fecha: string, ahora: Ahora = ahoraLima()): boolean {
  if (!esFechaReal(fecha)) return false;
  if (fecha < ahora.fecha || fecha > sumarDias(ahora.fecha, AGENDA.diasAdelante)) return false;
  return AGENDA.diasAbiertos.includes(diaSemana(fecha));
}

export function diasReservables(ahora: Ahora = ahoraLima()): string[] {
  const dias: string[] = [];
  for (let i = 0; i <= AGENDA.diasAdelante; i++) {
    const f = sumarDias(ahora.fecha, i);
    if (fechaReservable(f, ahora)) dias.push(f);
  }
  return dias;
}

export function planificarGrupo(servicioIds: string[]): { duracionMin: number; puestos: number } | null {
  const duraciones = servicioIds.map((id) => buscarServicio(id)?.duracionMin);
  if (duraciones.length === 0 || duraciones.some((d) => d === undefined)) return null;
  const puestos = Math.min(duraciones.length, AGENDA.capacidad);
  const carga = new Array<number>(puestos).fill(0);
  for (const d of [...(duraciones as number[])].sort((a, b) => b - a)) {
    carga[carga.indexOf(Math.min(...carga))] += d;
  }
  const bloque = Math.ceil(Math.max(...carga) / AGENDA.intervaloMin) * AGENDA.intervaloMin;
  return { duracionMin: bloque, puestos };
}

function picoOcupacion(ocupadas: Rango[], inicio: number, fin: number): number {
  const instantes = [inicio, ...ocupadas.map((o) => o.inicioMin).filter((m) => m > inicio && m < fin)];
  return Math.max(
    ...instantes.map((t) =>
      ocupadas.filter((o) => o.inicioMin <= t && o.finMin > t).reduce((suma, o) => suma + (o.puestos ?? 1), 0),
    ),
  );
}

export function horariosDisponibles(params: {
  fecha: string;
  duracionMin: number;
  puestos?: number;
  ocupadas: Rango[];
  ahora?: Ahora;
}): string[] {
  const ahora = params.ahora ?? ahoraLima();
  if (!fechaReservable(params.fecha, ahora)) return [];
  const libres: string[] = [];
  const cierre = aMinutos(AGENDA.cierre);
  for (let inicio = aMinutos(AGENDA.apertura); inicio + params.duracionMin <= cierre; inicio += AGENDA.intervaloMin) {
    const fin = inicio + params.duracionMin;
    if (params.fecha === ahora.fecha && inicio < ahora.minutos + AGENDA.anticipacionMin) continue;
    if (picoOcupacion(params.ocupadas, inicio, fin) + (params.puestos ?? 1) <= AGENDA.capacidad) libres.push(deMinutos(inicio));
  }
  return libres;
}

export function formatHora(hora: string): string {
  const [h, m] = hora.split(":").map(Number);
  const sufijo = h >= 12 ? "p. m." : "a. m.";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

export function formatFecha(fecha: string, estilo: "largo" | "corto" = "largo"): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  return estilo === "largo"
    ? d.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
    : d.toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export function formatDuracion(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h} h` : "", m ? `${m} min` : ""].filter(Boolean).join(" ");
}
