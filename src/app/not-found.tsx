import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ textAlign: "center", padding: "120px 20px" }}>
      <h1 className="titulo-seccion">Página no encontrada</h1>
      <p className="descripcion-seccion">Lo que buscas no existe o fue movido.</p>
      <Link href="/productos" className="btn-servicio" style={{ display: "inline-block", marginTop: 20 }}>
        Ver productos
      </Link>
    </main>
  );
}
