import { wa } from "@/lib/sitio";

export default function BotonWhatsApp() {
  return (
    <a
      href={wa("Hola, quiero información sobre Pelucas Caninas.")}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-flotante"
      aria-label="Escríbenos por WhatsApp"
    >
      <i className="fab fa-whatsapp" />
    </a>
  );
}
