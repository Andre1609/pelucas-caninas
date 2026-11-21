import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { claveValida, crearToken, DURACION_SESION_SEG, hashearClave, leerToken } from "./auth";
import { bloqueado, limpiarFallos, registrarFallo } from "./limite";

const SECRETO = "un-secreto-de-prueba-bastante-largo-123456";

describe("sesión firmada", () => {
  it("un token recién creado es válido y devuelve el usuario", () => {
    assert.equal(leerToken(crearToken("manuel", SECRETO), SECRETO), "manuel");
  });

  it("rechaza un token con otro secreto", () => {
    assert.equal(leerToken(crearToken("manuel", SECRETO), "otro-secreto-distinto-y-largo-9876543210"), null);
  });

  it("rechaza un token alterado", () => {
    const token = crearToken("manuel", SECRETO);
    const [cuerpo, firma] = token.split(".");
    const falso = Buffer.from(JSON.stringify({ u: "intruso", exp: 9999999999 })).toString("base64url");
    assert.equal(leerToken(`${falso}.${firma}`, SECRETO), null);
    assert.equal(leerToken(`${cuerpo}.${firma.slice(0, -2)}xx`, SECRETO), null);
  });

  it("rechaza un token vencido", () => {
    const ayer = Date.now() - (DURACION_SESION_SEG + 60) * 1000;
    assert.equal(leerToken(crearToken("manuel", SECRETO, ayer), SECRETO), null);
  });

  it("rechaza valores vacíos o malformados", () => {
    assert.equal(leerToken(undefined, SECRETO), null);
    assert.equal(leerToken("", SECRETO), null);
    assert.equal(leerToken("basura", SECRETO), null);
    assert.equal(leerToken(crearToken("manuel", SECRETO), ""), null);
  });
});

describe("contraseña", () => {
  const almacenado = hashearClave("Clave-Segura-2026");

  it("acepta la contraseña correcta", () => assert.equal(claveValida("Clave-Segura-2026", almacenado), true));
  it("rechaza una incorrecta", () => assert.equal(claveValida("clave-segura-2026", almacenado), false));
  it("no guarda la contraseña en texto plano y usa sal distinta cada vez", () => {
    assert.ok(!almacenado.includes("Clave-Segura-2026"));
    assert.notEqual(almacenado, hashearClave("Clave-Segura-2026"));
  });
  it("rechaza un hash con formato inválido", () => assert.equal(claveValida("x", "texto-cualquiera"), false));
  it("el hash no contiene el símbolo $ que rompe los archivos .env", () => assert.ok(!almacenado.includes("$")));
});

describe("límite de intentos", () => {
  it("bloquea tras 5 fallos y se libera con el tiempo", () => {
    const ip = "1.2.3.4";
    const t0 = 1_000_000;
    for (let i = 0; i < 4; i++) registrarFallo(ip, t0);
    assert.equal(bloqueado(ip, t0), false);
    registrarFallo(ip, t0);
    assert.equal(bloqueado(ip, t0), true);
    assert.equal(bloqueado(ip, t0 + 16 * 60 * 1000), false);
  });

  it("limpiar quita el bloqueo", () => {
    const ip = "5.6.7.8";
    for (let i = 0; i < 5; i++) registrarFallo(ip, 1);
    limpiarFallos(ip);
    assert.equal(bloqueado(ip, 1), false);
  });
});
