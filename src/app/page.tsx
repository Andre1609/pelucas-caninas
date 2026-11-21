import type { Metadata } from "next";
import Link from "next/link";
import CarruselPortada from "@/components/CarruselPortada";
import CarruselGaleria from "@/components/CarruselGaleria";
import { wa } from "@/lib/sitio";

export const metadata: Metadata = {
  title: { absolute: "Pelucas Caninas | Grooming profesional en San Juan de Lurigancho" },
  description: "Baños, cortes de raza y estética canina personalizada. Más de 20 años cuidando la belleza y salud de tu mascota.",
};

export default function Inicio() {
  return (
    <>

    
    <section className="hero-inicio" id="inicio">
      <CarruselPortada />
      <div className="hero-texto">
        <div className="badge-hero">
          Grooming profesional con más de 20 años de experiencia
        </div>

        <h2 className="hero-bienvenida">Bienvenido a Pelucas Caninas</h2>
        <h1>Cuidamos la belleza y salud de tu mascota</h1>

        <p>
          Baños, cortes de raza y estética canina personalizada para que tu
          engreído luzca limpio, feliz y bien cuidado.
        </p>

        <div className="hero-botones">
          <Link href="/agendar" className="btn-principal">
            <i className="fa-solid fa-calendar-check"></i> Agendar Cita
          </Link>
          <Link href="/servicios"  className="btn-secundario">Ver Servicios</Link>
        </div>

        <div className="hero-datos">
          <div>
            <strong>20+</strong>
            <span>Años de experiencia</span>
          </div>
          <div>
            <strong>500+</strong>
            <span>Mascotas felices</span>
          </div>
          <div>
            <strong>SJL</strong>
            <span>Atención personalizada</span>
          </div>
        </div>
      </div>
    </section>

    
    <section className="galeria">
      <h2 className="titulo-seccion">Nuestros engreídos</h2>
      <p className="descripcion-seccion">
        Algunos clientes atendidos con cariño, paciencia y cuidado profesional
      </p>

      <div className="galeria-carrusel">
        <CarruselGaleria />
      </div>
    </section>

    
    <section className="recomendaciones" id="recomendaciones">
      <h2 className="titulo-seccion">Recomendaciones para tu mascota</h2>
      <p className="descripcion-seccion">
        Cuidados básicos para mantener a tu engreído limpio, sano y feliz.
      </p>

      <div className="cards-recomendaciones">
        <div className="card-reco">
          <i className="fa-solid fa-shower"></i>
          <h3>Baño adecuado</h3>
          <p>
            Baña a tu mascota con productos especiales para perros y evita usar
            shampoo de personas, ya que puede irritar su piel.
          </p>
        </div>
        <div className="card-reco">
          <i className="fa-solid fa-paw"></i>
          <h3>Cuidado de uñas</h3>
          <p>
            Revisa sus uñas con frecuencia. Si están muy largas, pueden causarle
            molestias al caminar o correr.
          </p>
        </div>
        <div className="card-reco">
          <i className="fa-solid fa-brush"></i>
          <h3>Cepillado frecuente</h3>
          <p>
            Cepilla su pelaje para evitar nudos, retirar pelo muerto y
            mantenerlo limpio por más tiempo.
          </p>
        </div>
        <div className="card-reco">
          <i className="fa-solid fa-heart-pulse"></i>
          <h3>Visitas periódicas</h3>
          <p>
            Agenda baños, cortes y revisiones de limpieza para prevenir malos
            olores, pulgas y acumulación de suciedad.
          </p>
        </div>
      </div>
    </section>

    
    <section className="seccion-contacto" id="contactanos">
      <div className="contacto-contenido">
        <div className="contacto-info">
          <h2>Contáctanos</h2>
          <p className="contacto-subtitulo">
            ¿Tienes una consulta? Estamos para ayudarte.
          </p>

          <div className="contacto-card">
            <i className="fa-solid fa-calendar-days"></i>
            <div>
              <h3>Agenda tu cita</h3>
              <p>Reserva el baño o corte de tu mascota.</p>
              <Link href="/agendar" className="btn-contacto">Agendar Cita</Link>
            </div>
          </div>

          <div className="contacto-card">
            <i className="fa-brands fa-whatsapp"></i>
            <div>
              <h3>Telefono</h3>
              <p>+51 937 317 249</p>
            </div>
          </div>

          <div className="contacto-card">
            <i className="fa-solid fa-location-dot"></i>
            <div>
              <h3>Ubicación</h3>
              <p>
                Mz S3 Lote 7 José Carlos Mariátegui, San Juan de Lurigancho
                15449, Perú
              </p>
              <p><br />Atencion: Lunes a Sábado de 9:00 a.m. a 6:00 p.m.</p>
            </div>
          </div>
        </div>
        <div className="contacto-mapa">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3903.5775850362816!2d-76.99019042118103!3d-11.934457835306008!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105db5e62725871%3A0x1715d2ecc03bbdcf!2sPelucas%20Caninas!5e0!3m2!1ses-419!2spe!4v1779052191958!5m2!1ses-419!2spe"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
           title="Ubicación de Pelucas Caninas en Google Maps">
          </iframe>
        </div>
      </div>
    </section>

    
    </>
  );
}
