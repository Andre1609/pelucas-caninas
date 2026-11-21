"use client";

import { useEffect, useState } from "react";
import { heroImagenes } from "@/data/imagenes";

export default function CarruselPortada() {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (heroImagenes.length < 2) return;
    const id = setInterval(() => setActual((i) => (i + 1) % heroImagenes.length), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero-bg-slider" aria-hidden="true">
      {heroImagenes.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={i === actual ? "activo" : undefined}
          loading="eager"
          fetchPriority={i === 0 ? "high" : undefined}
        />
      ))}
    </div>
  );
}
