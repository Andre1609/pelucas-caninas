import Link from "next/link";
import AccionesReclamo from "@/components/admin/AccionesReclamo";
import { listarReclamos, type VistaReclamos } from "@/db/admin";
import { formatFecha } from "@/lib/agenda";
import { formatMomento, mensajeReclamo, numeroReclamo } from "@/lib/reclamos";
import { waCliente } from "@/lib/sitio";

export const dynamic = "force-dynamic";

const VISTAS: { id: VistaReclamos; nombre: string }[] = [
  { id: "pendientes", nombre: "Pendientes" },
  { id: "atendidos", nombre: "Atendidos" },
  { id: "todos", nombre: "Todos" },
];

export default async function PanelReclamos({ searchParams }: { searchParams: Promise<{ vista?: string }> }) {
  const { vista: pedida } = await searchParams;
  const vista = VISTAS.find((v) => v.id === pedida)?.id ?? "pendientes";
  const lista = await listarReclamos(vista);

  return (
    <>
      <div className="admin-titulo">
        <h1>Libro de reclamaciones</h1>
        <p>
          {vista === "pendientes"
            ? lista.length > 0
              ? `${lista.length} por atender, del más antiguo al más reciente`
              : "No hay reclamos pendientes"
            : `${lista.length} registrado${lista.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="admin-tabs">
        {VISTAS.map((v) => (
          <Link key={v.id} href={v.id === "pendientes" ? "/admin/reclamos" : `/admin/reclamos?vista=${v.id}`} className={v.id === vista ? "activa" : undefined}>
            {v.nombre}
          </Link>
        ))}
      </div>

      {lista.length === 0 && <p className="admin-vacio">No hay reclamos en esta vista.</p>}

      {lista.map((r) => (
        <article className={`admin-reclamo ${r.estado}`} key={r.id}>
          <header className="admin-reclamo-cabecera">
            <h3>N.° {numeroReclamo(r.id)}</h3>
            <span className="admin-chip">{r.tipo === "queja" ? "Queja" : "Reclamo"}</span>
            <span className="admin-chip">{r.bien === "producto" ? "Producto" : "Servicio"}</span>
            <span className={`admin-estado ${r.estado === "atendido" ? "confirmada" : "pendiente"}`}>
              {r.estado === "atendido" ? "Atendido" : "Pendiente"}
            </span>
            <small>Recibido: {formatMomento(r.creadoEn)}</small>
          </header>

          <dl className="admin-datos">
            <div><dt>Persona</dt><dd>{r.nombre} {r.apellido}</dd></div>
            <div><dt>Documento</dt><dd>{r.documento}</dd></div>
            <div><dt>Fecha indicada</dt><dd>{formatFecha(r.fecha)}</dd></div>
            <div><dt>Monto reclamado</dt><dd>S/ {r.monto.toFixed(2)}</dd></div>
            {r.telefono && <div><dt>Teléfono</dt><dd>{r.telefono}</dd></div>}
            {r.email && <div><dt>Correo</dt><dd>{r.email}</dd></div>}
            {r.direccion && <div className="admin-ancho"><dt>Dirección</dt><dd>{r.direccion}</dd></div>}
          </dl>

          <div className="admin-texto">
            <h4>Descripción del {r.bien}</h4>
            <p>{r.descripcion}</p>
            <h4>Detalle del {r.tipo}</h4>
            <p>{r.detalle}</p>
          </div>

          {(r.telefono || r.email) && (
            <div className="admin-contacto">
              {r.telefono && (
                <a href={waCliente(r.telefono, mensajeReclamo(r))} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-whatsapp" /> Escribir por WhatsApp
                </a>
              )}
              {r.email && (
                <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Tu ${r.tipo} N.° ${numeroReclamo(r.id)} - Pelucas Caninas`)}&body=${encodeURIComponent(mensajeReclamo(r))}`}>
                  <i className="fa-solid fa-envelope" /> Escribir por correo
                </a>
              )}
            </div>
          )}

          {r.atendidoEn && <p className="admin-nota-pie">Atendido el {formatMomento(r.atendidoEn)}</p>}

          <AccionesReclamo id={r.id} estado={r.estado} respuestaInicial={r.respuesta ?? ""} />
        </article>
      ))}
    </>
  );
}
