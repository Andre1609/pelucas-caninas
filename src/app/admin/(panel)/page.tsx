import Link from "next/link";
import AccionesCita from "@/components/admin/AccionesCita";
import { listarCitas, type Vista } from "@/db/admin";
import { aMinutos, ahoraLima, buscarServicio, deMinutos, formatFecha, formatHora, TAMANOS } from "@/lib/agenda";
import { mensajeParaCliente } from "@/lib/mensajes";
import { waCliente } from "@/lib/sitio";

export const dynamic = "force-dynamic";

const VISTAS: { id: Vista; nombre: string }[] = [
  { id: "proximas", nombre: "Próximas" },
  { id: "pasadas", nombre: "Pasadas" },
  { id: "canceladas", nombre: "Canceladas" },
];

const ETIQUETAS: Record<string, string> = { pendiente: "Pendiente", confirmada: "Confirmada", cancelada: "Cancelada" };

export default async function PanelCitas({ searchParams }: { searchParams: Promise<{ vista?: string }> }) {
  const { vista: pedida } = await searchParams;
  const vista = VISTAS.find((v) => v.id === pedida)?.id ?? "proximas";
  const hoy = ahoraLima().fecha;
  const lista = await listarCitas(vista, hoy);
  const pendientes = lista.filter((c) => c.estado === "pendiente").length;
  const dias = [...new Set(lista.map((c) => c.fecha))];

  return (
    <>
      <div className="admin-titulo">
        <h1>Citas</h1>
        {vista === "proximas" && (
          <p>{pendientes > 0 ? `${pendientes} pendiente${pendientes > 1 ? "s" : ""} por confirmar` : "No hay citas pendientes"}</p>
        )}
      </div>

      <div className="admin-tabs">
        {VISTAS.map((v) => (
          <Link key={v.id} href={v.id === "proximas" ? "/admin" : `/admin?vista=${v.id}`} className={v.id === vista ? "activa" : undefined}>
            {v.nombre}
          </Link>
        ))}
      </div>

      {lista.length === 0 && <p className="admin-vacio">No hay citas en esta vista.</p>}

      {dias.map((fecha) => (
        <section key={fecha}>
          <h2 className="admin-dia">
            {formatFecha(fecha)}
            {fecha === hoy && <span className="admin-hoy">Hoy</span>}
          </h2>
          {lista
            .filter((c) => c.fecha === fecha)
            .map((c) => {
              const fin = deMinutos(aMinutos(c.hora) + c.duracionMin);
              const mensaje = mensajeParaCliente(c);
              return (
                <article className={`admin-cita ${c.estado}`} key={c.id}>
                  <div className="admin-cita-hora">
                    <strong>{formatHora(c.hora)}</strong>
                    <small>hasta {formatHora(fin)}</small>
                  </div>
                  <div className="admin-cita-cuerpo">
                    <div className="admin-cita-titulo">
                      <h3>{c.clienteNombre}</h3>
                      <span className={`admin-estado ${c.estado}`}>{ETIQUETAS[c.estado] ?? c.estado}</span>
                      <small>N.° {c.id}</small>
                    </div>
                    <ul className="admin-mascotas">
                      {c.mascotas.map((m, i) => (
                        <li key={i}>
                          <i className="fa-solid fa-paw" /> <strong>{m.nombre}</strong> · {buscarServicio(m.servicio)?.nombre ?? m.servicio} ·{" "}
                          {TAMANOS.find((t) => t.id === m.tamano)?.nombre ?? m.tamano}
                        </li>
                      ))}
                    </ul>
                    {c.notas && <p className="admin-notas">“{c.notas}”</p>}
                    <div className="admin-contacto">
                      <a href={`tel:${c.telefono}`}>
                        <i className="fa-solid fa-phone" /> {c.telefono}
                      </a>
                      <a href={waCliente(c.telefono, mensaje)} target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-whatsapp" /> {c.estado === "confirmada" ? "Enviar confirmación por WhatsApp" : "Escribir por WhatsApp"}
                      </a>
                    </div>
                  </div>
                  <AccionesCita id={c.id} estado={c.estado} />
                </article>
              );
            })}
        </section>
      ))}
    </>
  );
}
