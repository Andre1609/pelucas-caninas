"use client";

import { useRef, useState } from "react";

const LADO_MAXIMO = 1600;

async function reducir(archivo: File): Promise<Blob> {
  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  const contexto = lienzo.getContext("2d");
  if (!contexto) throw new Error("No se pudo procesar la imagen");
  contexto.fillStyle = "#ffffff";
  contexto.fillRect(0, 0, lienzo.width, lienzo.height);
  contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  return new Promise((resolver, rechazar) =>
    lienzo.toBlob((blob) => (blob ? resolver(blob) : rechazar(new Error("No se pudo procesar la imagen"))), "image/jpeg", 0.88),
  );
}

type Props = { actual?: string; etiqueta?: string; onListo: (url: string) => void };

export default function SubirFoto({ actual, etiqueta = "Elegir foto", onListo }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function elegida(archivo: File | undefined) {
    if (!archivo) return;
    setError("");
    setSubiendo(true);
    try {
      const reducida = await reducir(archivo);
      const datos = new FormData();
      datos.append("archivo", reducida, "foto.jpg");
      const res = await fetch("/api/admin/imagenes", { method: "POST", body: datos });
      const cuerpo = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(cuerpo.error ?? "No se pudo subir la foto");
        return;
      }
      onListo(cuerpo.url);
    } catch {
      setError("No se pudo leer esa imagen. Prueba con otra.");
    } finally {
      setSubiendo(false);
      if (entrada.current) entrada.current.value = "";
    }
  }

  return (
    <div className="admin-subir">
      {actual && <img src={actual} alt="Foto del producto" />}
      <input
        ref={entrada}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => elegida(e.target.files?.[0])}
      />
      <button type="button" className="admin-btn" disabled={subiendo} onClick={() => entrada.current?.click()}>
        <i className="fa-solid fa-camera" /> {subiendo ? "Subiendo…" : etiqueta}
      </button>
      {error && <p className="admin-error" role="alert">{error}</p>}
    </div>
  );
}
