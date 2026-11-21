"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AGENDA,
  buscarServicio,
  diasReservables,
  formatDuracion,
  formatFecha,
  formatHora,
  planificarGrupo,
  SERVICIOS_AGENDA,
  TAMANOS,
  type ServicioId,
} from "@/lib/agenda";
import { wa } from "@/lib/sitio";

type Mascota = { nombre: string; tamano: string; servicio: ServicioId | "" };
type Confirmada = {
  id: number;
  fecha: string;
  hora: string;
  cliente: string;
  mascotas: { nombre: string; tamano: string; servicio: string }[];
};

const nuevaMascota = (servicio: ServicioId | "" = ""): Mascota => ({ nombre: "", tamano: "mediano", servicio });
const CANTIDADES = Array.from({ length: AGENDA.maxMascotas }, (_, i) => i + 1);

export default function FormularioCita({ servicioInicial }: { servicioInicial?: string }) {
  const [mascotas, setMascotas] = useState<Mascota[]>([
    nuevaMascota(buscarServicio(servicioInicial ?? "") ? (servicioInicial as ServicioId) : ""),
  ]);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horarios, setHorarios] = useState<string[] | null>(null);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [errorHoras, setErrorHoras] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [confirmada, setConfirmada] = useState<Confirmada | null>(null);
  const [recarga, setRecarga] = useState(0);

  const [dias, setDias] = useState<string[]>([]);
  useEffect(() => setDias(diasReservables()), []);

  function cambiarCantidad(n: number) {
    setMascotas((prev) =>
      n <= prev.length
        ? prev.slice(0, n)
        : [...prev, ...Array.from({ length: n - prev.length }, () => nuevaMascota(prev.at(-1)?.servicio ?? ""))],
    );
  }
  function editar(i: number, cambios: Partial<Mascota>) {
    setMascotas((prev) => prev.map((m, k) => (k === i ? { ...m, ...cambios } : m)));
  }

  const serviciosKey = mascotas.every((m) => m.servicio) ? mascotas.map((m) => m.servicio).join(",") : "";
  const plan = useMemo(() => (serviciosKey ? planificarGrupo(serviciosKey.split(",")) : null), [serviciosKey]);

  useEffect(() => {
    setHora("");
    setHorarios(null);
    setErrorHoras(false);
    if (!serviciosKey || !fecha) return;
    const control = new AbortController();
    setCargandoHoras(true);
    fetch(`/api/disponibilidad?fecha=${fecha}&servicios=${serviciosKey}`, { signal: control.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("http"))))
      .then((d: { horarios: string[] }) => setHorarios(d.horarios))
      .catch((e) => {
        if (e?.name !== "AbortError") setErrorHoras(true);
      })
      .finally(() => !control.signal.aborted && setCargandoHoras(false));
    return () => control.abort();
  }, [serviciosKey, fecha, recarga]);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (mascotas.some((m) => !m.servicio)) return setError("Elige el servicio de cada mascota.");
    if (mascotas.some((m) => !m.nombre.trim())) return setError("Escribe el nombre de cada mascota.");
    if (!fecha || !hora) return setError("Elige el día y la hora.");

    const f = new FormData(e.currentTarget);
    setEnviando(true);
    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha,
          hora,
          clienteNombre: f.get("clienteNombre"),
          telefono: f.get("telefono"),
          notas: f.get("notas") || undefined,
          web: f.get("web") || undefined,
          mascotas,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No pudimos guardar tu cita. Inténtalo otra vez.");
        if (res.status === 409) setRecarga((n) => n + 1);
        return;
      }
      setConfirmada({
        id: data.id,
        fecha,
        hora,
        cliente: String(f.get("clienteNombre")),
        mascotas: mascotas.map((m) => ({
          nombre: m.nombre.trim(),
          tamano: TAMANOS.find((t) => t.id === m.tamano)?.nombre ?? "",
          servicio: buscarServicio(m.servicio)?.nombre ?? "",
        })),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("No pudimos conectar. Revisa tu internet e inténtalo otra vez.");
    } finally {
      setEnviando(false);
    }
  }

  if (confirmada) {
    const lista = confirmada.mascotas.map((m) => `- ${m.nombre} (${m.tamano}): ${m.servicio}`).join("\n");
    const mensaje =
      `Hola, acabo de reservar una cita en la web (N.° ${confirmada.id}).\n` +
      `Fecha: ${formatFecha(confirmada.fecha)} a las ${formatHora(confirmada.hora)}\n` +
      `Mascotas:\n${lista}\n` +
      `A nombre de: ${confirmada.cliente}`;
    return (
      <div className="agendar-exito">
        <i className="fa-solid fa-circle-check" />
        <h2>¡Cita reservada!</h2>
        <p>
          Guardamos tu reserva N.° <strong>{confirmada.id}</strong>. Para dejarla confirmada, envíanos el resumen por
          WhatsApp.
        </p>
        <ul className="agendar-resumen">
          <li><strong>Día:</strong> {formatFecha(confirmada.fecha)}</li>
          <li><strong>Hora:</strong> {formatHora(confirmada.hora)}</li>
          {confirmada.mascotas.map((m, i) => (
            <li key={i}><strong>{m.nombre}:</strong> {m.servicio}</li>
          ))}
        </ul>
        <a className="agendar-btn-wsp" href={wa(mensaje)} target="_blank" rel="noopener noreferrer">
          <i className="fab fa-whatsapp" /> Confirmar por WhatsApp
        </a>
        <Link href="/" className="agendar-volver">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <form className="agendar-form" onSubmit={enviar} noValidate>
      <section className="agendar-paso">
        <h2><span>1</span> ¿Cuántas mascotas llevas?</h2>
        <div className="agendar-cantidad" role="group" aria-label="Cantidad de mascotas">
          {CANTIDADES.map((n) => (
            <button
              type="button"
              key={n}
              className={`agendar-num${mascotas.length === n ? " activa" : ""}`}
              aria-pressed={mascotas.length === n}
              onClick={() => cambiarCantidad(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="agendar-nota">
          ¿Más de {AGENDA.maxMascotas}?{" "}
          <a href={wa("Hola, quiero agendar una cita para varias mascotas.")} target="_blank" rel="noopener noreferrer">
            Escríbenos por WhatsApp
          </a>{" "}
          y lo coordinamos.
        </p>

        <div className="agendar-mascotas">
          {mascotas.map((m, i) => (
            <div className="agendar-mascota" key={i}>
              <h3><i className="fa-solid fa-paw" /> Mascota {i + 1}</h3>
              <div className="agendar-campos agendar-campos-3">
                <label>
                  Nombre
                  <input value={m.nombre} onChange={(e) => editar(i, { nombre: e.target.value })} maxLength={60} required />
                </label>
                <label>
                  Tamaño
                  <select value={m.tamano} onChange={(e) => editar(i, { tamano: e.target.value })}>
                    {TAMANOS.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Servicio
                  <select value={m.servicio} onChange={(e) => editar(i, { servicio: e.target.value as ServicioId | "" })}>
                    <option value="">Elige un servicio…</option>
                    {SERVICIOS_AGENDA.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre} (aprox. {formatDuracion(s.duracionMin)})</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
        {plan && (
          <p className="agendar-tiempo">
            <i className="fa-regular fa-clock" /> Tiempo estimado en total: <strong>{formatDuracion(plan.duracionMin)}</strong>
          </p>
        )}
      </section>

      <section className="agendar-paso">
        <h2><span>2</span> Elige el día</h2>
        <div className="agendar-dias" role="listbox" aria-label="Días disponibles">
          {dias.map((d) => (
            <button
              type="button"
              key={d}
              className={`agendar-dia${fecha === d ? " activa" : ""}`}
              aria-pressed={fecha === d}
              onClick={() => setFecha(d)}
            >
              {formatFecha(d, "corto")}
            </button>
          ))}
        </div>
        <p className="agendar-nota">Atendemos de lunes a sábado, de 9:00 a. m. a 6:00 p. m.</p>
      </section>

      <section className="agendar-paso">
        <h2><span>3</span> Elige la hora</h2>
        {!serviciosKey || !fecha ? (
          <p className="agendar-nota">Primero elige el servicio de cada mascota y el día.</p>
        ) : cargandoHoras ? (
          <p className="agendar-nota">Buscando horarios…</p>
        ) : errorHoras ? (
          <p className="agendar-error" role="alert">
            No pudimos consultar los horarios.{" "}
            <button type="button" className="agendar-reintentar" onClick={() => setRecarga((n) => n + 1)}>
              Reintentar
            </button>
          </p>
        ) : horarios && horarios.length === 0 ? (
          <p className="agendar-nota">
            No hay un bloque libre de {plan ? formatDuracion(plan.duracionMin) : "ese tiempo"} ese día. Prueba con otro día
            {mascotas.length > 1 && (
              <>
                {" "}o{" "}
                <a href={wa("Hola, quiero agendar una cita para varias mascotas.")} target="_blank" rel="noopener noreferrer">
                  escríbenos por WhatsApp
                </a>
              </>
            )}
            .
          </p>
        ) : (
          <div className="agendar-horas">
            {(horarios ?? []).map((h) => (
              <button
                type="button"
                key={h}
                className={`agendar-hora${hora === h ? " activa" : ""}`}
                aria-pressed={hora === h}
                onClick={() => setHora(h)}
              >
                {formatHora(h)}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="agendar-paso">
        <h2><span>4</span> Tus datos</h2>
        <div className="agendar-campos">
          <label>
            Tu nombre
            <input name="clienteNombre" autoComplete="name" required maxLength={80} />
          </label>
          <label>
            Número de celular
            <input name="telefono" type="tel" autoComplete="tel" placeholder="987 654 321" required />
          </label>
          <label className="agendar-ancho">
            Comentarios (opcional)
            <textarea name="notas" rows={3} maxLength={300} placeholder="Razas, cuidados especiales, tipo de corte…" />
          </label>
          <input name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="agendar-trampa" />
        </div>
      </section>

      {error && <p className="agendar-error" role="alert">{error}</p>}

      <button type="submit" className="agendar-enviar" disabled={enviando}>
        {enviando ? "Reservando…" : "Reservar cita"}
      </button>
    </form>
  );
}
