import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BotonTema from "@/components/admin/BotonTema";
import FormularioAcceso from "@/components/admin/FormularioAcceso";
import { authConfigurado, sesionActual } from "@/lib/sesion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acceso",
  robots: { index: false, follow: false },
};

export default async function Login() {
  if (await sesionActual()) redirect("/admin");

  return (
    <div className="admin admin-centrado">
      <div className="login-tarjeta">
        <BotonTema className="admin-tema-flotante" />
        <img src="/img/pelucas-caninas.webp" alt="Pelucas Caninas" />
        <h1>Panel de administración</h1>
        {authConfigurado() ? (
          <FormularioAcceso />
        ) : (
          <p className="admin-error">
            El acceso aún no está configurado. Ejecuta <code>npm run admin:clave</code> y copia las 3 líneas que genera en tu archivo
            .env.local.
          </p>
        )}
      </div>
    </div>
  );
}
