"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AccionesCita({ id, estado }: { id: number; estado: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function cambiar(nuevo: string, pregunta?: string) {
    if (pregunta && !window.confirm(pregunta)) return;
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/citas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevo }),
      });
      if (!res.ok) {
        if (res.status === 401) return router.replace("/admin/login");
        const datos = await res.json().catch(() => ({}));
        setError(datos.error ?? "No se pudo actualizar la cita");
        return;
      }
      router.refresh();
    } catch {
      setError("Sin conexión. Inténtalo otra vez.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="admin-acciones">
      {estado === "pendiente" && (
        <button type="button" className="admin-btn admin-btn-principal" disabled={cargando} onClick={() => cambiar("confirmada")}>
          <i className="fa-solid fa-check" /> Confirmar
        </button>
      )}
      {estado === "confirmada" && (
        <button type="button" className="admin-btn" disabled={cargando} onClick={() => cambiar("pendiente")}>
          Volver a pendiente
        </button>
      )}
      {estado === "cancelada" ? (
        <button type="button" className="admin-btn" disabled={cargando} onClick={() => cambiar("pendiente")}>
          <i className="fa-solid fa-rotate-left" /> Reabrir
        </button>
      ) : (
        <button
          type="button"
          className="admin-btn admin-btn-peligro"
          disabled={cargando}
          onClick={() => cambiar("cancelada", "¿Cancelar esta cita? El horario quedará libre para otros clientes.")}
        >
          <i className="fa-solid fa-xmark" /> Cancelar
        </button>
      )}
      {error && <p className="admin-error" role="alert">{error}</p>}
    </div>
  );
}
