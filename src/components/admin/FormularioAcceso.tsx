"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function FormularioAcceso() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: f.get("usuario"), clave: f.get("clave") }),
      });
      if (res.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      const datos = await res.json().catch(() => ({}));
      setError(datos.error ?? "No se pudo iniciar sesión");
    } catch {
      setError("No pudimos conectar. Inténtalo otra vez.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="login-form" onSubmit={enviar}>
      <label>
        Usuario
        <input name="usuario" autoComplete="username" required maxLength={80} />
      </label>
      <label>
        Contraseña
        <input name="clave" type="password" autoComplete="current-password" required maxLength={200} />
      </label>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <button type="submit" className="admin-btn admin-btn-principal" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
