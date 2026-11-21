import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Misión, visión y valores de Pelucas Caninas.",
};

export default function Nosotros() {
  return (
    <>
    
    <section className="nosotros pagina-nosotros" id="nosotros">
      <div className="nosotros-contenido">
        <div className="nosotros-texto">
          <h2>Misión</h2>
          <div className="linea-titulo"></div>
          <p>
            Brindar un servicio de grooming canino profesional, seguro y
            personalizado, cuidando la higiene, belleza y bienestar de cada
            mascota con paciencia, cariño y productos de calidad.
          </p>

          <h2>Visión</h2>
          <div className="linea-titulo"></div>
          <p>
            Ser una peluquería canina reconocida por la confianza, experiencia
            y trato humano hacia las mascotas, ofreciendo servicios cada vez más
            completos para las familias de San Juan de Lurigancho.
          </p>

          <h2>Valores</h2>
          <div className="linea-titulo"></div>
          <ul className="valores-lista">
            <li><i className="fa-solid fa-paw"></i> Amor por las mascotas</li>
            <li><i className="fa-solid fa-shield-heart"></i> Responsabilidad</li>
            <li><i className="fa-solid fa-handshake"></i> Confianza</li>
            <li><i className="fa-solid fa-star"></i> Calidad</li>
          </ul>
        </div>

        <div className="nosotros-imagen">
          <img src="/img/manuel-corte.jpeg" alt="Manuel cortando el pelo de una mascota" />
        </div>
      </div>
    </section>

    
    </>
  );
}
