"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "pelucasTema";

export default function BotonTema({ className = "" }: { className?: string }) {
  const [oscuro, setOscuro] = useState(false);

  useEffect(() => setOscuro(document.body.classList.contains("dark-mode")), []);

  function cambiar() {
    const nuevo = !oscuro;
    document.body.classList.toggle("dark-mode", nuevo);
    try {
      localStorage.setItem(THEME_KEY, nuevo ? "oscuro" : "claro");
    } catch {}
    setOscuro(nuevo);
  }

  return (
    <button
      type="button"
      className={`admin-tema ${className}`.trim()}
      aria-label={oscuro ? "Activar modo claro" : "Activar modo oscuro"}
      title={oscuro ? "Modo claro" : "Modo oscuro"}
      onClick={cambiar}
    >
      <i className={`fa-solid ${oscuro ? "fa-sun" : "fa-moon"}`} />
    </button>
  );
}
