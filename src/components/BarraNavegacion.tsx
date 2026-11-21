"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCarrito } from "./ProveedorCarrito";

const THEME_KEY = "pelucasTema";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/productos", label: "Productos" },
  { href: "/#contactanos", label: "Contáctanos" },
  { href: "/nosotros", label: "Nosotros" },
];

export default function BarraNavegacion() {
  const pathname = usePathname();
  const { count, openCart } = useCarrito();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [oscuro, setOscuro] = useState(false);

  useEffect(() => setMenuAbierto(false), [pathname]);

  useEffect(() => {
    let guardado = false;
    try {
      guardado = localStorage.getItem(THEME_KEY) === "oscuro";
    } catch {}
    document.body.classList.toggle("dark-mode", guardado);
    setOscuro(guardado);
  }, []);

  function cambiarTema() {
    const nuevo = !oscuro;
    document.body.classList.toggle("dark-mode", nuevo);
    try {
      localStorage.setItem(THEME_KEY, nuevo ? "oscuro" : "claro");
    } catch {}
    setOscuro(nuevo);
  }

  return (
    <nav className="navbar">
      <Link href="/" className="logo">
        <img src="/img/pelucas-caninas.webp" alt="Logo Pelucas Caninas" />
      </Link>

      <input
        type="checkbox"
        id="menu-toggle"
        className="menu-toggle"
        checked={menuAbierto}
        onChange={(e) => setMenuAbierto(e.target.checked)}
      />
      <label htmlFor="menu-toggle" className="hamburguesa">
        <i className="fa-solid fa-bars" />
      </label>

      <div className="menu">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </div>

      <div className="nav-actions">
        <button type="button" className="nav-icon-btn" aria-label="Cambiar modo oscuro" onClick={cambiarTema}>
          <i className={`fa-solid ${oscuro ? "fa-sun" : "fa-moon"}`} />
        </button>
        <button type="button" className="nav-cart-btn" aria-label="Abrir carrito" onClick={openCart}>
          <i className="fa-solid fa-cart-shopping" />
          <span id="cartCount">{count}</span>
        </button>
      </div>
    </nav>
  );
}
