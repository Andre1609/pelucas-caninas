import { createHmac } from "node:crypto";

export function ipDelCliente(cabeceras: Pick<Headers, "get">): string | null {
  const reenviada = cabeceras.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = cabeceras.get("x-real-ip")?.trim();
  return reenviada || real || null;
}

export function hashIp(ip: string, secreto: string) {
  return createHmac("sha256", secreto || "sin-secreto").update(ip).digest("hex").slice(0, 32);
}

export function claveTelefono(telefono: string) {
  return telefono.replace(/\D/g, "").slice(-9);
}
