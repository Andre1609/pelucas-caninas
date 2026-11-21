import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const COOKIE_SESION = "pc_admin";
export const DURACION_SESION_SEG = 60 * 60 * 8;

type Carga = { u: string; exp: number };

const base64url = (datos: Buffer | string) => Buffer.from(datos).toString("base64url");

const firmar = (datos: string, secreto: string) => createHmac("sha256", secreto).update(datos).digest("base64url");

export function igualSeguro(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function crearToken(usuario: string, secreto: string, ahora = Date.now()) {
  const carga: Carga = { u: usuario, exp: Math.floor(ahora / 1000) + DURACION_SESION_SEG };
  const cuerpo = base64url(JSON.stringify(carga));
  return `${cuerpo}.${firmar(cuerpo, secreto)}`;
}

export function leerToken(token: string | undefined, secreto: string, ahora = Date.now()): string | null {
  if (!token || !secreto) return null;
  const [cuerpo, firma] = token.split(".");
  if (!cuerpo || !firma || !igualSeguro(firma, firmar(cuerpo, secreto))) return null;
  try {
    const carga = JSON.parse(Buffer.from(cuerpo, "base64url").toString("utf8")) as Carga;
    if (typeof carga.u !== "string" || typeof carga.exp !== "number") return null;
    return carga.exp * 1000 > ahora ? carga.u : null;
  } catch {
    return null;
  }
}

export function hashearClave(clave: string) {
  const sal = randomBytes(16).toString("hex");
  return `scrypt:${sal}:${scryptSync(clave, sal, 64).toString("hex")}`;
}

export function claveValida(clave: string, almacenado: string) {
  const [algoritmo, sal, hash] = almacenado.split(":");
  if (algoritmo !== "scrypt" || !sal || !hash) return false;
  const calculado = scryptSync(clave, sal, 64);
  const esperado = Buffer.from(hash, "hex");
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado);
}
