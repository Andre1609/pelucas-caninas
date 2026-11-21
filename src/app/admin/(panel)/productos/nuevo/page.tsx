import Link from "next/link";
import FormularioProducto from "@/components/admin/FormularioProducto";
import { listarCategorias } from "@/db/admin";

export const dynamic = "force-dynamic";

export default async function NuevoProducto() {
  const sugeridas = ["Accesorios", "Comida", "Salud"];
  const categorias = [...new Set([...(await listarCategorias()), ...sugeridas])].sort((a, b) => a.localeCompare(b, "es"));

  return (
    <>
      <div className="admin-titulo">
        <h1>Nuevo producto</h1>
        <p>
          <Link href="/admin/productos">← Volver a productos</Link>
        </p>
      </div>
      <FormularioProducto categorias={categorias} />
    </>
  );
}
