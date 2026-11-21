import type { Metadata } from "next";
import FormularioLibro from "@/components/FormularioLibro";

export const metadata: Metadata = {
  title: "Libro de reclamaciones",
  description: "Registra tu queja o reclamo sobre un producto o servicio de Pelucas Caninas.",
};

export default function Libro() {
  return (
    <main className="contenedor pagina-libro">
    
    
      <h1>Libro de reclamaciones</h1>

      <div className="datos-empresa">
        <p><strong>PELUCAS CANINAS S.A.C</strong></p>
        <p><strong>RUC:</strong> 20610289321</p>
        <p>
          <strong>Dirección:</strong> Mz S3 Lote 7, Jose Carlos Mariategui, SJL,
          Lima
        </p>
      </div>

      <FormularioLibro />
    </main>
  );
}
