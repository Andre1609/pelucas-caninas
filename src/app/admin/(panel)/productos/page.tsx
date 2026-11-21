import Link from "next/link";
import FilaProducto from "@/components/admin/FilaProducto";
import { listarProductosAdmin } from "@/db/admin";

export const dynamic = "force-dynamic";

export default async function PanelProductos() {
  const productos = await listarProductosAdmin();

  return (
    <>
      <div className="admin-titulo">
        <h1>Productos</h1>
        <p>Cambia precios, nombres y fotos. Los cambios se ven en la tienda al instante.</p>
        <Link href="/admin/productos/nuevo" className="admin-btn admin-btn-principal admin-btn-inline">
          <i className="fa-solid fa-plus" /> Nuevo producto
        </Link>
      </div>
      <div className="admin-productos">
        {productos.map((p) => (
          <FilaProducto key={p.slug} producto={p} />
        ))}
      </div>
    </>
  );
}
