import { formatFecha, formatHora } from "./agenda";

type CitaMensaje = {
  clienteNombre: string;
  fecha: string;
  hora: string;
  estado: string;
  mascotas: { nombre: string }[];
};

export function mensajeParaCliente(cita: CitaMensaje) {
  const nombres = cita.mascotas.map((m) => m.nombre).join(", ");
  const detalle = `Hola ${cita.clienteNombre}, te escribimos de Pelucas Caninas sobre tu cita del ${formatFecha(cita.fecha)} a las ${formatHora(cita.hora)} (${nombres}).`;
  return cita.estado === "confirmada" ? `*CITA CONFIRMADA*\n\n${detalle}\n\n*TE ESPERAMOS*` : detalle;
}
