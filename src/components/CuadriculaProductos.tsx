"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductoView } from "@/lib/tipos";
import { soles } from "@/lib/sitio";
import { useCarrito } from "./ProveedorCarrito";

export default function CuadriculaProductos({ productos }: { productos: ProductoView[] }) {
  const { add } = useCarrito();
  const [busqueda, setBusqueda] = useState("");

  const visibles = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return productos;
    return productos.filter((p) => `${p.nombre} ${p.resumen} ${p.categoria}`.toLowerCase().includes(q));
  }, [busqueda, productos]);

  return (
    <>
      <div className="buscador-productos">
        <i className="fa-solid fa-magnifying-glass" />
        <input
          type="text"
          placeholder="Buscar producto..."
          aria-label="Buscar producto"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <p className={`sin-resultados${visibles.length === 0 ? " activo" : ""}`}>No se encontraron productos.</p>

      <div className="productos-grid">
        {visibles.map((p) => (
          <article className="tarjeta" key={p.slug}>
            <Link href={`/productos/${p.slug}`} className="tarjeta-link">
              <img src={p.imagen} alt={p.nombre} loading="lazy" />
              <h3>{p.nombre}</h3>
              <p>{p.resumen}</p>
            </Link>
            <p className="producto-precio">{soles(p.precio)}</p>
            <button
              type="button"
              className="btn-add-cart"
              onClick={() => add({ slug: p.slug, nombre: p.nombre, precio: p.precio, imagen: p.imagen })}
            >
              <i className="fa-solid fa-cart-plus" /> Agregar al carrito
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
