"use client";

import type { ProductoView } from "@/lib/tipos";
import { useCarrito } from "./ProveedorCarrito";

export default function BotonAgregarCarrito({ producto }: { producto: ProductoView }) {
  const { add } = useCarrito();
  return (
    <button
      type="button"
      className="btn-add-detail"
      onClick={() => add({ slug: producto.slug, nombre: producto.nombre, precio: producto.precio, imagen: producto.imagen })}
    >
      <i className="fa-solid fa-cart-plus" /> Agregar al carrito
    </button>
  );
}
