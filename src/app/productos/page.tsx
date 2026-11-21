import type { Metadata } from "next";
import CuadriculaProductos from "@/components/CuadriculaProductos";
import { getProductos } from "@/db/consultas";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Productos",
  description: "Productos seleccionados para el cuidado, higiene y bienestar de tu mascota.",
};

export default async function Productos() {
  const productos = await getProductos();

  return (
    <main>
      <section className="productos" id="productos">
        <h2 className="titulo-seccion">Nuestros Productos</h2>
        <p className="descripcion-seccion">Productos seleccionados para el cuidado, higiene y bienestar de tu mascota.</p>
        <CuadriculaProductos productos={productos} />
      </section>
    </main>
  );
}
