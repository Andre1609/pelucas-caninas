"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { ProductoView } from "@/lib/tipos";
import { soles } from "@/lib/sitio";

export default function ProductosRelacionados({ productos }: { productos: ProductoView[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const pausado = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      const el = ref.current;
      if (!el || pausado.current) return;
      const limite = el.scrollWidth - el.clientWidth;
      if (limite <= 0) return;
      if (el.scrollLeft >= limite - 2) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollLeft += 1;
    }, 24);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="productos-relacionados">
      <h2>Más de nuestros productos</h2>
      <div
        className="contenedor-productos"
        ref={ref}
        onMouseEnter={() => (pausado.current = true)}
        onMouseLeave={() => (pausado.current = false)}
        onTouchStart={() => (pausado.current = true)}
      >
        {productos.map((p) => (
          <Link key={p.slug} href={`/productos/${p.slug}`} className="card-producto">
            <img src={p.imagen} alt={p.nombre} loading="lazy" />
            <h3>{p.nombre}</h3>
            <p>{soles(p.precio)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
