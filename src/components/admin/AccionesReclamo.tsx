"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { id: number; estado: string; respuestaInicial: string };

export default function AccionesReclamo({ id, estado, respuestaInicial }: Props) {
  const router = useRouter();
  const [respuesta, setRespuesta] = useState(respuestaInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function cambiar(nuevoEstado: "pendiente" | "atendido") {
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/reclamos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado, respuesta }),
      });
      if (!res.ok) {
        if (res.status === 401) return router.replace("/admin/login");
        const datos = await res.json().catch(() => ({}));
        setError(datos.error ?? "No se pudo actualizar el reclamo");
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
    <div className="admin-respuesta">
      <label>
        Respuesta o nota interna
        <textarea
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Qué se le respondió a la persona o cómo se resolvió"
        />
      </label>
      <div className="admin-respuesta-botones">
        <button type="button" className="admin-btn admin-btn-principal" disabled={cargando} onClick={() => cambiar("atendido")}>
          <i className="fa-solid fa-check" /> {estado === "atendido" ? "Guardar respuesta" : "Guardar y marcar atendido"}
        </button>
        {estado === "atendido" && (
          <button type="button" className="admin-btn" disabled={cargando} onClick={() => cambiar("pendiente")}>
            <i className="fa-solid fa-rotate-left" /> Reabrir
          </button>
        )}
      </div>
      {error && <p className="admin-error" role="alert">{error}</p>}
    </div>
  );
}
