import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BotonAgregarCarrito from "@/components/BotonAgregarCarrito";
import ProductosRelacionados from "@/components/ProductosRelacionados";
import { getOtrosProductos, getProductoBySlug, getProductos } from "@/db/consultas";
import { soles, wa } from "@/lib/sitio";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const productos = await getProductos();
  return productos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);
  if (!producto) return { title: "Producto no encontrado" };
  return {
    title: producto.nombre,
    description: producto.resumen,
    openGraph: { images: [producto.imagen] },
  };
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);
  if (!producto) notFound();
  const relacionados = await getOtrosProductos(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion,
    image: producto.imagen,
    category: producto.categoria,
    offers: { "@type": "Offer", priceCurrency: "PEN", price: producto.precio.toFixed(2), availability: "https://schema.org/InStock" },
  };

  return (
    <>
      <main className="producto-grande">
        <div className="producto-img">
          <img src={producto.imagen} alt={producto.nombre} />
        </div>
        <div className="producto-info">
          <p className="categoria">{producto.categoria} / Mascotas</p>
          <h1>{producto.nombre}</h1>
          <h2>{soles(producto.precio)}</h2>
          <p className="descripcion">{producto.descripcion}</p>
          <div className="botones">
            <BotonAgregarCarrito producto={producto} />
            <a
              href={wa(`Hola, quiero información sobre ${producto.nombre}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-producto-wsp"
            >
              <i className="fab fa-whatsapp" /> Pedir por WhatsApp
            </a>
          </div>
        </div>
      </main>

      <ProductosRelacionados productos={relacionados} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
