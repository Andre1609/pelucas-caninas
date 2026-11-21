import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import BotonSalir from "@/components/admin/BotonSalir";
import BotonTema from "@/components/admin/BotonTema";
import { contarReclamosPendientes } from "@/db/admin";
import { requerirAdmin } from "@/lib/sesion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: ReactNode }) {
  await requerirAdmin();
  const reclamosPendientes = await contarReclamosPendientes().catch(() => 0);

  return (
    <div className="admin">
      <header className="admin-barra">
        <strong className="admin-marca">Pelucas Caninas · Panel</strong>
        <nav>
          <Link href="/admin">Citas</Link>
          <Link href="/admin/productos">Productos</Link>
          <Link href="/admin/reclamos">
            Reclamos
            {reclamosPendientes > 0 && <span className="admin-badge">{reclamosPendientes}</span>}
          </Link>
          <Link href="/">Ver sitio</Link>
        </nav>
        <BotonTema />
        <BotonSalir />
      </header>
      <div className="admin-contenido">{children}</div>
    </div>
  );
}
