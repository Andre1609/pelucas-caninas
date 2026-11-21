"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { galeria } from "@/data/imagenes";

export default function CarruselGaleria() {
  const [ampliada, setAmpliada] = useState<{ src: string; alt: string } | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => setMontado(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAmpliada(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="galeria-track">
        {galeria.map((foto, i) => (
          <img
            key={i}
            src={foto.src}
            alt={foto.alt}
            loading="lazy"
            style={{ cursor: "zoom-in" }}
            onClick={() => setAmpliada(foto)}
          />
        ))}
      </div>

      {montado &&
        createPortal(
          <div
            className={`galeria-modal${ampliada ? " activo" : ""}`}
            onClick={(e) => e.target === e.currentTarget && setAmpliada(null)}
          >
            <button type="button" className="galeria-modal-cerrar" aria-label="Cerrar imagen" onClick={() => setAmpliada(null)}>
              <i className="fa-solid fa-xmark" />
            </button>
            {ampliada && <img src={ampliada.src} alt={ampliada.alt || "Mascota ampliada"} />}
          </div>,
          document.body,
        )}
    </>
  );
}
