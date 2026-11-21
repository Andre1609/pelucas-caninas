"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { soles, wa } from "@/lib/sitio";

export type ElementoCarrito = { slug: string; nombre: string; precio: number; imagen: string; cantidad: number };

type ContextoCarrito = {
  items: ElementoCarrito[];
  count: number;
  total: number;
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (producto: Omit<ElementoCarrito, "cantidad">) => void;
  change: (slug: string, delta: number) => void;
  remove: (slug: string) => void;
  showToast: (mensaje: string) => void;
};

const STORAGE_KEY = "pc-carrito-v2";
const Ctx = createContext<ContextoCarrito | null>(null);

export function useCarrito() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <ProveedorCarrito>");
  return ctx;
}
export const useAviso = useCarrito;

export default function ProveedorCarrito({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ElementoCarrito[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ texto: string; visible: boolean }>({ texto: "", visible: false });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) setItems(JSON.parse(guardado));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const showToast = useCallback((texto: string) => {
    setToast({ texto, visible: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  }, []);

  const add: ContextoCarrito["add"] = useCallback(
    (producto) => {
      setItems((prev) =>
        prev.some((i) => i.slug === producto.slug)
          ? prev.map((i) => (i.slug === producto.slug ? { ...i, cantidad: i.cantidad + 1 } : i))
          : [...prev, { ...producto, cantidad: 1 }],
      );
      showToast(`${producto.nombre} agregado al carrito`);
    },
    [showToast],
  );

  const change = useCallback((slug: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => (i.slug === slug ? { ...i, cantidad: i.cantidad + delta } : i)).filter((i) => i.cantidad > 0),
    );
  }, []);

  const remove = useCallback((slug: string) => setItems((prev) => prev.filter((i) => i.slug !== slug)), []);

  const count = items.reduce((n, i) => n + i.cantidad, 0);
  const total = items.reduce((n, i) => n + i.precio * i.cantidad, 0);

  const value = useMemo(
    () => ({ items, count, total, open, openCart: () => setOpen(true), closeCart: () => setOpen(false), add, change, remove, showToast }),
    [items, count, total, open, add, change, remove, showToast],
  );

  const mensaje = items.length
    ? `Hola, quiero hacer un pedido:\n${items.map((i) => `- ${i.nombre} x${i.cantidad} (${soles(i.precio)})`).join("\n")}\nTotal: ${soles(total)}`
    : "Hola, quiero información sobre sus productos.";

  return (
    <Ctx.Provider value={value}>
      {children}

      <div className={`cart-overlay${open ? " activo" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`cart-panel${open ? " activo" : ""}`} aria-hidden={!open}>
        <div className="cart-header">
          <h3>Carrito de compras</h3>
          <button type="button" id="cartClose" aria-label="Cerrar carrito" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <p className="cart-empty">Tu carrito está vacío.</p>
          ) : (
            items.map((item) => (
              <div className="cart-item" key={item.slug}>
                <img src={item.imagen} alt={item.nombre} />
                <div className="cart-item-info">
                  <h4>{item.nombre}</h4>
                  <p>{soles(item.precio)}</p>
                  <div className="cart-quantity">
                    <button type="button" aria-label="Quitar uno" onClick={() => change(item.slug, -1)}>-</button>
                    <span>{item.cantidad}</span>
                    <button type="button" aria-label="Agregar uno" onClick={() => change(item.slug, 1)}>+</button>
                  </div>
                </div>
                <button type="button" className="cart-remove" aria-label={`Quitar ${item.nombre}`} onClick={() => remove(item.slug)}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total-row">
            <strong>Total:</strong>
            <strong>{soles(total)}</strong>
          </div>
          <a className="cart-whatsapp" target="_blank" rel="noopener noreferrer" href={wa(mensaje)}>
            <i className="fab fa-whatsapp" /> Pedir por WhatsApp
          </a>
        </div>
      </aside>

      <div className={`toast${toast.visible ? " activo" : ""}`} role="status">
        {toast.texto}
      </div>
    </Ctx.Provider>
  );
}
