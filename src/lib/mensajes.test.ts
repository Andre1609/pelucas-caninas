import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mensajeParaCliente } from "./mensajes";

const cita = {
  clienteNombre: "Alejandra",
  fecha: "2026-11-18",
  hora: "10:00",
  estado: "pendiente",
  mascotas: [{ nombre: "Luna bebe" }, { nombre: "Jair" }],
};

describe("mensajeParaCliente", () => {
  it("una cita confirmada lleva encabezado y cierre", () => {
    assert.equal(
      mensajeParaCliente({ ...cita, estado: "confirmada" }),
      "*CITA CONFIRMADA*\n\nHola Alejandra, te escribimos de Pelucas Caninas sobre tu cita del miércoles, 18 de noviembre a las 10:00 a. m. (Luna bebe, Jair).\n\n*TE ESPERAMOS*",
    );
  });

  it("una cita pendiente solo lleva el mensaje base", () => {
    assert.equal(
      mensajeParaCliente(cita),
      "Hola Alejandra, te escribimos de Pelucas Caninas sobre tu cita del miércoles, 18 de noviembre a las 10:00 a. m. (Luna bebe, Jair).",
    );
  });

  it("funciona con una sola mascota", () => {
    assert.ok(mensajeParaCliente({ ...cita, mascotas: [{ nombre: "Max" }] }).includes("(Max)."));
  });
});
