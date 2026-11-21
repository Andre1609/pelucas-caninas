"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductoAdmin } from "@/db/admin";
import SubirFoto from "./SubirFoto";

export default function FilaProducto({ producto }: { producto: ProductoAdmin }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(producto.nombre);
  const [precio, setPrecio] = useState(producto.precio.toFixed(2));
  const [activo, setActivo] = useState(producto.activo);
  const [categoria, setCategoria] = useState(producto.categoria);
  const [resumen, setResumen] = useState(producto.resumen);
  const [descripcion, setDescripcion] = useState(producto.descripcion);
  const [imagen, setImagen] = useState(producto.imagen);
  const [estado, setEstado] = useState<"" | "guardando" | "guardado">("");
  const [error, setError] = useState("");

  const cambios = {
    ...(nombre.trim() !== producto.nombre && { nombre: nombre.trim() }),
    ...(Number(precio) !== producto.precio && { precio: Number(precio) }),
    ...(activo !== producto.activo && { activo }),
    ...(categoria.trim() !== producto.categoria && { categoria: categoria.trim() }),
    ...(resumen.trim() !== producto.resumen && { resumen: resumen.trim() }),
    ...(descripcion.trim() !== producto.descripcion && { descripcion: descripcion.trim() }),
  };
  const hayCambios = Object.keys(cambios).length > 0;

  async function enviar(cuerpo: Record<string, unknown>) {
    setError("");
    setEstado("guardando");
    try {
      const res = await fetch(`/api/admin/productos/${producto.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      if (!res.ok) {
        if (res.status === 401) return router.replace("/admin/login");
        const datos = await res.json().catch(() => ({}));
        setError(datos.error ?? "No se pudo guardar");
        setEstado("");
        return false;
      }
      setEstado("guardado");
      router.refresh();
      return true;
    } catch {
      setError("Sin conexión. Inténtalo otra vez.");
      setEstado("");
      return false;
    }
  }

  async function nuevaFoto(url: string) {
    if (await enviar({ imagen: url })) setImagen(url);
  }

  const tocar = () => setEstado("");

  return (
    <article className={`admin-producto${activo ? "" : " inactivo"}`}>
      <img src={imagen} alt="" />
      <div className="admin-producto-campos">
        <label>
          Nombre
          <input value={nombre} onChange={(e) => (setNombre(e.target.value), tocar())} maxLength={120} />
        </label>
        <label>
          Precio (S/)
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={precio}
            onChange={(e) => (setPrecio(e.target.value), tocar())}
          />
        </label>
        <label className="admin-check">
          <input type="checkbox" checked={activo} onChange={(e) => (setActivo(e.target.checked), tocar())} />
          Visible en la tienda
        </label>
      </div>
      <div className="admin-acciones">
        <SubirFoto etiqueta="Cambiar foto" onListo={nuevaFoto} />
        <button
          type="button"
          className="admin-btn admin-btn-principal"
          disabled={!hayCambios || estado === "guardando"}
          onClick={() => enviar(cambios)}
        >
          {estado === "guardando" ? "Guardando…" : "Guardar"}
        </button>
        {estado === "guardado" && !hayCambios && <span className="admin-ok"><i className="fa-solid fa-check" /> Guardado</span>}
        {error && <p className="admin-error" role="alert">{error}</p>}
      </div>

      <details className="admin-detalles">
        <summary>Más detalles (categoría, resumen y descripción)</summary>
        <div className="admin-producto-campos admin-detalles-campos">
          <label>
            Categoría
            <input value={categoria} onChange={(e) => (setCategoria(e.target.value), tocar())} maxLength={40} />
          </label>
          <label className="admin-ancho">
            Resumen corto
            <input value={resumen} onChange={(e) => (setResumen(e.target.value), tocar())} maxLength={200} />
          </label>
          <label className="admin-ancho">
            Descripción
            <textarea value={descripcion} onChange={(e) => (setDescripcion(e.target.value), tocar())} rows={4} maxLength={1500} />
          </label>
        </div>
      </details>
    </article>
  );
}
