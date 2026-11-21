import type { Metadata } from "next";
import type { ReactNode } from "react";
import ProveedorCarrito from "@/components/ProveedorCarrito";
import EstructuraSitio from "@/components/EstructuraSitio";
import AvisoCookies from "@/components/AvisoCookies";
import PiePagina from "@/components/PiePagina";
import BarraNavegacion from "@/components/BarraNavegacion";
import BotonWhatsApp from "@/components/BotonWhatsApp";
import "@/styles/style-general.css";
import "@/styles/style-navbar.css";
import "@/styles/style-footer.css";
import "@/styles/style-inicio.css";
import "@/styles/style-servicios.css";
import "@/styles/style-productos.css";
import "@/styles/style-productos-seleccionados.css";
import "@/styles/style-nosotros.css";
import "@/styles/style-libro.css";
import "@/styles/style-agendar.css";
import "@/styles/style-admin.css";
import "@/styles/style-cookies.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Pelucas Caninas", template: "%s | Pelucas Caninas" },
  description: "Peluquería canina en San Juan de Lurigancho: baños, cortes de raza y productos para el cuidado de tu mascota.",
  openGraph: { siteName: "Pelucas Caninas", locale: "es_PE", type: "website" },
};

const temaInicial = `try{if(localStorage.getItem('pelucasTema')==='oscuro')document.body.classList.add('dark-mode')}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </head>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: temaInicial }} />
        <ProveedorCarrito>
          <EstructuraSitio
            barra={<BarraNavegacion />}
            pie={<PiePagina />}
            extras={
              <>
                <BotonWhatsApp />
                <AvisoCookies />
              </>
            }
          >
            {children}
          </EstructuraSitio>
        </ProveedorCarrito>
      </body>
    </html>
  );
}
