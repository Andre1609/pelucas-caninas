"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import SubirFoto from "./SubirFoto";

export default function FormularioProducto({ categorias }: { categorias: string[] }) {
  const router = useRouter();
  const [imagen, setImagen] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!imagen) return setError("Sube una foto del producto.");
    const f = new FormData(e.currentTarget);
    setGuardando(true);
    try {
      const res = await fetch("/api/admin/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: f.get("nombre"),
          categoria: f.get("categoria"),
          precio: Number(f.get("precio")),
          resumen: f.get("resumen"),
          descripcion: f.get("descripcion"),
          imagen,
        }),
      });
      if (!res.ok) {
        if (res.status === 401) return router.replace("/admin/login");
        const datos = await res.json().catch(() => ({}));
        setError(datos.error ?? "No se pudo crear el producto");
        return;
      }
      router.push("/admin/productos");
      router.refresh();
    } catch {
      setError("Sin conexión. Inténtalo otra vez.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={enviar}>
      <div className="admin-form-foto">
        <SubirFoto actual={imagen || undefined} etiqueta={imagen ? "Cambiar foto" : "Elegir foto"} onListo={setImagen} />
        {!imagen && <small>JPG, PNG o WebP. Se reduce automáticamente.</small>}
      </div>

      <div className="admin-form-campos">
        <label>
          Nombre del producto
          <input name="nombre" required maxLength={120} />
        </label>
        <label>
          Categoría
          <input name="categoria" list="categorias-producto" required maxLength={40} placeholder="Ej. Aseo" />
          <datalist id="categorias-producto">
            {categorias.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label>
          Precio (S/)
          <input name="precio" type="number" min="0" step="0.01" inputMode="decimal" required />
        </label>
        <label className="admin-ancho">
          Resumen corto (se ve en la tarjeta)
          <input name="resumen" required maxLength={200} />
        </label>
        <label className="admin-ancho">
          Descripción completa
          <textarea name="descripcion" rows={5} required maxLength={1500} />
        </label>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <div className="admin-form-pie">
        <button type="submit" className="admin-btn admin-btn-principal" disabled={guardando}>
          {guardando ? "Guardando…" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
