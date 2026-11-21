"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { ahoraLima } from "@/lib/agenda";
import { numeroReclamo } from "@/lib/reclamos";

export default function FormularioLibro() {
  const hoy = useMemo(() => ahoraLima().fecha, []);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [registrado, setRegistrado] = useState<number | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError("");
    if (!form.reportValidity()) return;

    const f = new FormData(form);
    setEnviando(true);
    try {
      const res = await fetch("/api/reclamos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: f.get("fecha"),
          documento: f.get("documento"),
          nombre: f.get("nombre"),
          apellido: f.get("apellido"),
          email: f.get("email"),
          telefono: f.get("telefono"),
          direccion: f.get("direccion"),
          bien: f.get("bien"),
          monto: Number(f.get("monto")),
          descripcion: f.get("descripcion"),
          tipo: f.get("tipo"),
          detalle: f.get("detalle"),
          declaracion: f.get("declaracion") === "on",
          datos: f.get("datos") === "on",
          web: f.get("web"),
        }),
      });
      const datos = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(datos.error ?? "No pudimos registrar tu reclamo. Inténtalo otra vez.");
        return;
      }
      setRegistrado(datos.id);
      form.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("No pudimos conectar. Revisa tu internet e inténtalo otra vez.");
    } finally {
      setEnviando(false);
    }
  }

  if (registrado !== null) {
    return (
      <div className="libro-exito">
        <i className="fa-solid fa-circle-check" />
        <h2>Reclamo registrado</h2>
        <p>Tu hoja de reclamación quedó registrada con el número:</p>
        <p className="libro-numero">N.° {numeroReclamo(registrado)}</p>
        <p>Guarda este número. Nos pondremos en contacto contigo por los datos que dejaste.</p>
        <Link href="/">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <form className="formulario-libro" noValidate onSubmit={onSubmit}>
      <h2>Datos de la persona que presenta el reclamo</h2>

      <label htmlFor="libro-fecha">Elegir una fecha *</label>
      <input id="libro-fecha" name="fecha" type="date" max={hoy} required />

      <label htmlFor="libro-documento">Número de documento de identidad *</label>
      <input id="libro-documento" name="documento" type="text" required maxLength={20} />

      <div className="fila">
        <div>
          <label htmlFor="libro-nombre">Nombre *</label>
          <input id="libro-nombre" name="nombre" type="text" required maxLength={80} autoComplete="given-name" />
        </div>
        <div>
          <label htmlFor="libro-apellido">Apellido *</label>
          <input id="libro-apellido" name="apellido" type="text" required maxLength={80} autoComplete="family-name" />
        </div>
      </div>

      <div className="fila">
        <div>
          <label htmlFor="libro-email">Email</label>
          <input id="libro-email" name="email" type="email" maxLength={120} autoComplete="email" />
        </div>
        <div>
          <label htmlFor="libro-telefono">Teléfono</label>
          <input id="libro-telefono" name="telefono" type="tel" placeholder="+51" maxLength={25} autoComplete="tel" />
        </div>
      </div>

      <label htmlFor="libro-direccion">Dirección</label>
      <textarea id="libro-direccion" name="direccion" rows={4} maxLength={200}></textarea>

      <h3>Información general</h3>

      <p>Identificación del bien contratado *</p>
      <label className="opcion">
        <input type="radio" name="bien" value="producto" required /> Producto
      </label>
      <label className="opcion">
        <input type="radio" name="bien" value="servicio" /> Servicio
      </label>

      <label htmlFor="libro-monto">Monto reclamado *</label>
      <input id="libro-monto" name="monto" type="number" min="0" step="0.01" required className="monto" />

      <label htmlFor="libro-descripcion">Descripción *</label>
      <textarea id="libro-descripcion" name="descripcion" rows={5} required maxLength={1000}></textarea>

      <p>Selecciona una opción *</p>
      <label className="opcion">
        <input type="radio" name="tipo" value="queja" required /> Queja
      </label>
      <label className="opcion">
        <input type="radio" name="tipo" value="reclamo" /> Reclamo
      </label>

      <label htmlFor="libro-detalle">Detalle del reclamo/queja *</label>
      <textarea id="libro-detalle" name="detalle" rows={5} required maxLength={2000}></textarea>

      <label className="check">
        <input type="checkbox" name="declaracion" required />
        Declaro que la información que he proporcionado es correcta, completa y verdadera. *
      </label>

      <label className="check">
        <input type="checkbox" name="datos" required />
        Al enviar este formulario acepto el flujo transfronterizo de mis datos personales, según la ley de Protección de Datos
        Personales. *
      </label>

      <input name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="libro-trampa" />

      {error && <p className="libro-error" role="alert">{error}</p>}

      <button type="submit" disabled={enviando}>{enviando ? "Enviando…" : "Enviar"}</button>
    </form>
  );
}
