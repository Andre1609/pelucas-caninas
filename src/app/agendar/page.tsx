import type { Metadata } from "next";
import FormularioCita from "@/components/FormularioCita";

export const metadata: Metadata = {
  title: "Agendar cita",
  description: "Reserva en línea el baño o corte de tu mascota. Elige servicio, día y hora disponible.",
};

type Props = { searchParams: Promise<{ servicio?: string }> };

export default async function Agendar({ searchParams }: Props) {
  const { servicio } = await searchParams;

  return (
    <main className="agendar">
      <h1 className="agendar-titulo">Agenda tu cita</h1>
      <p className="agendar-intro">Elige el servicio, el día y una hora libre. Te toma menos de un minuto.</p>
      <FormularioCita servicioInicial={servicio} />
    </main>
  );
}
