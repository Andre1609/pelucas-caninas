import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ahoraLima, sumarDias } from "./agenda";
import { esquemaReclamo, mensajeReclamo, numeroReclamo } from "./reclamos";

const valido = () => ({
  fecha: ahoraLima().fecha,
  documento: "12345678",
  nombre: "Ana",
  apellido: "Pérez",
  email: "ana@correo.com",
  telefono: "987 654 321",
  direccion: "",
  bien: "servicio",
  monto: 80,
  descripcion: "Baño premium",
  tipo: "reclamo",
  detalle: "El corte no fue el acordado.",
  declaracion: true,
  datos: true,
});

const mensaje = (r: ReturnType<typeof esquemaReclamo.safeParse>) => (r.success ? "" : (r.error.issues[0]?.message ?? ""));

describe("esquemaReclamo", () => {
  it("acepta un reclamo completo y limpia los opcionales vacíos", () => {
    const r = esquemaReclamo.safeParse(valido());
    assert.ok(r.success);
    assert.equal(r.data.direccion, undefined);
  });

  it("acepta correo y teléfono vacíos", () => {
    assert.ok(esquemaReclamo.safeParse({ ...valido(), email: "", telefono: "" }).success);
  });

  it("rechaza datos obligatorios faltantes con mensajes claros", () => {
    assert.equal(mensaje(esquemaReclamo.safeParse({ ...valido(), nombre: "" })), "Escribe tu nombre");
    assert.equal(mensaje(esquemaReclamo.safeParse({ ...valido(), documento: "12" })), "Escribe tu número de documento");
    assert.equal(mensaje(esquemaReclamo.safeParse({ ...valido(), bien: null })), "Indica si es un producto o un servicio");
    assert.equal(mensaje(esquemaReclamo.safeParse({ ...valido(), tipo: "otro" })), "Indica si es una queja o un reclamo");
  });

  it("rechaza correo o teléfono mal escritos", () => {
    assert.equal(mensaje(esquemaReclamo.safeParse({ ...valido(), email: "ana@" })), "Escribe un correo válido");
    assert.equal(mensaje(esquemaReclamo.safeParse({ ...valido(), telefono: "abc" })), "Escribe un teléfono válido");
  });

  it("rechaza fechas futuras o inexistentes", () => {
    assert.equal(mensaje(esquemaReclamo.safeParse({ ...valido(), fecha: sumarDias(ahoraLima().fecha, 3) })), "La fecha no puede ser futura");
    assert.ok(!esquemaReclamo.safeParse({ ...valido(), fecha: "2026-02-31" }).success);
  });

  it("exige las dos declaraciones", () => {
    assert.ok(!esquemaReclamo.safeParse({ ...valido(), declaracion: false }).success);
    assert.ok(!esquemaReclamo.safeParse({ ...valido(), datos: false }).success);
  });

  it("rechaza el campo trampa lleno, el monto como texto y el monto negativo", () => {
    assert.ok(!esquemaReclamo.safeParse({ ...valido(), web: "spam" }).success);
    assert.ok(!esquemaReclamo.safeParse({ ...valido(), monto: "80" }).success);
    assert.ok(!esquemaReclamo.safeParse({ ...valido(), monto: -1 }).success);
  });
});

describe("numeroReclamo y mensajeReclamo", () => {
  it("numera con ceros a la izquierda", () => {
    assert.equal(numeroReclamo(7), "0007");
    assert.equal(numeroReclamo(12345), "12345");
  });

  const base = { id: 3, nombre: "Ana", tipo: "reclamo", estado: "pendiente", respuesta: null };

  it("mensaje base mientras está pendiente", () => {
    assert.equal(mensajeReclamo(base), "Hola Ana, te escribimos de Pelucas Caninas sobre tu reclamo N.° 0003.");
  });

  it("incluye la respuesta cuando ya fue atendido", () => {
    assert.equal(
      mensajeReclamo({ ...base, estado: "atendido", respuesta: "Te devolvemos el monto." }),
      "Hola Ana, te escribimos de Pelucas Caninas sobre tu reclamo N.° 0003.\n\nTe devolvemos el monto.",
    );
  });
});
