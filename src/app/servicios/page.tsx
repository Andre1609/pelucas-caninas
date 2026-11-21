import type { Metadata } from "next";
import Link from "next/link";
import { wa } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Baño básico, baño premium y baño con corte de raza para tu mascota.",
};

export default function Servicios() {
  return (
    <>

    
    <section className="servicios pagina-servicios" id="servicios">
      <h2 className="titulo-seccion">Nuestros Servicios</h2>
      <p className="descripcion-seccion">
        Servicio personalizado de grooming canino con amor y cuidado.
      </p>

      <div className="servicios-grid">
        <div className="servicio-card">
          <img src="/img/basico.jpg" alt="Baño básico" />
          <h3>Baño Básico</h3>
          <p className="precio">Servicio esencial</p>
          <ul>
            <li>2 lavados con shampoo hipoalergénico</li>
            <li>Corte higiénico</li>
            <li>Corte y limado de uñas</li>
            <li>Limpieza y depilación de oídos</li>
            <li>Despejado de ojos y almohadillas</li>
            <li>Perfume y lazo decorativo</li>
          </ul>
          <Link href="/agendar?servicio=basico" className="btn-servicio">Agendar</Link>
        </div>

        <div className="servicio-card destacado">
          <img src="/img/premium.webp" alt="Baño premium" />
          <h3>Baño Premium</h3>
          <p className="precio">Más completo</p>
          <ul>
            <li>2 lavados con shampoo hipoalergénico o antipulgas</li>
            <li>Aplicación de acondicionador</li>
            <li>Corte higiénico</li>
            <li>Corte y limado de uñas</li>
            <li>Limpieza e hidratación de almohadillas</li>
            <li>Retoque de carita</li>
            <li>Cepillado de dientes</li>
            <li>Limpieza de glándulas perianales</li>
            <li>Perfume y lazo decorativo</li>
          </ul>
          <Link href="/agendar?servicio=premium" className="btn-servicio">Agendar</Link>
        </div>

        <div className="servicio-card">
          <img src="/img/corte.jpg" alt="Baño y corte" />
          <h3>Baño y Corte</h3>
          <p className="precio">Estética completa</p>
          <ul>
            <li>Baño básico o baño premium</li>
            <li>Corte de raza o corte adaptado</li>
            <li>Corte según estructura física y pelaje</li>
            <li>Corte con máquina, tijera o ambas técnicas</li>
            <li>Perfume y lazo decorativo</li>
          </ul>
          <Link href="/agendar?servicio=bano-corte" className="btn-servicio">Agendar</Link>
        </div>
      </div>

      <div className="otros-servicios">
        <h3>También te ofrecemos</h3>

        <div className="otros-grid">
          <div className="otro-card">
            <img src="/img/cepillado.jpg" alt="Cepillado" />
            <h4>Cepillado de dientes</h4>
            <a
              href={wa("Hola, quiero información acerca del servicio Cepillado de dientes.")}
              target="_blank"
              className="btn-servicio"
             rel="noopener noreferrer">
              Agendar
            </a>
          </div>

          <div className="otro-card">
            <img src="/img/oidos.webp" alt="Limpieza de oídos" />
            <h4>Limpieza de oídos</h4>
            <a
              href={wa("Hola, quiero información acerca del servicio Limpieza y depilacion de oídos.")}
              target="_blank"
              className="btn-servicio"
             rel="noopener noreferrer">
              Agendar
            </a>
          </div>

          <div className="otro-card">
            <img src="/img/glandulas.webp" alt="Glándulas perianales" />
            <h4>Limpieza de glándulas perianales</h4>
            <a
              href={wa("Hola, quiero información acerca del servicio Limpieza de glándulas perianales.")}
              target="_blank"
              className="btn-servicio"
             rel="noopener noreferrer">
              Agendar
            </a>
          </div>

          <div className="otro-card">
            <img src="/img/unas.jpg" alt="Corte de uñas" />
            <h4>Corte y limado de uñas</h4>
            <a
              href={wa("Hola, quiero información acerca del servicio Corte y limado de uñas.")}
              target="_blank"
              className="btn-servicio"
             rel="noopener noreferrer">
              Agendar
            </a>
          </div>
        </div>
      </div>
    </section>

    
    </>
  );
}
