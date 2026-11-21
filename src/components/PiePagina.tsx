import Link from "next/link";
import { SITE } from "@/lib/sitio";
import BotonCookies from "./BotonCookies";

export default function PiePagina() {
  return (
    <footer className="footer-nuevo">
      <div className="footer-contenedor">
        <div className="footer-logo-box">
          <img src="/img/pelucas-caninas.webp" alt="Logo Pelucas Caninas" />
        </div>

        <div className="footer-col">
          <h4>Navegación</h4>
          <Link href="/">Inicio</Link>
          <Link href="/servicios">Servicios</Link>
          <Link href="/agendar">Agendar cita</Link>
          <Link href="/productos">Productos</Link>
          <Link href="/#contactanos">Contáctanos</Link>
          <Link href="/nosotros">Nosotros</Link>
        </div>

        <div className="footer-col">
          <h4>Síguenos</h4>
          <div className="footer-redes-nuevo">
            <a href={SITE.redes.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <i className="fab fa-tiktok" />
            </a>
            <a href={SITE.redes.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook-f" />
            </a>
            <a href={SITE.redes.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram" />
            </a>
          </div>

          {SITE.email && (
            <>
              <h4 className="contactame-titulo">Contáctame</h4>
              <p className="footer-correo">
                <i className="fa-solid fa-envelope" /> {SITE.email}
              </p>
            </>
          )}
        </div>

        <div className="footer-imagenes">
          <Link href="/libro">
            <img src="/img/libro-de-reclamaciones.jpg" alt="Libro de Reclamaciones" />
          </Link>
          <img src="/img/pagos.webp" alt="Medios de pago" />
        </div>
      </div>

      <p className="footer-copy-nuevo">
        © {new Date().getFullYear()} {SITE.nombre} - Todos los derechos reservados · <BotonCookies />
      </p>
    </footer>
  );
}
