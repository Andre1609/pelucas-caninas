"use client";

import { useRouter } from "next/navigation";

export default function BotonSalir() {
  const router = useRouter();

  async function salir() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button type="button" className="admin-btn" onClick={salir}>
      <i className="fa-solid fa-right-from-bracket" /> Salir
    </button>
  );
}
