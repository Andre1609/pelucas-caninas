import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slugify, slugUnico } from "./slug";

describe("slugify", () => {
  it("quita tildes, ñ y símbolos", () => {
    assert.equal(slugify("Peine de cerdas Pethroom!"), "peine-de-cerdas-pethroom");
    assert.equal(slugify("Champú Ñandú & Co."), "champu-nandu-co");
  });
  it("recorta guiones y limita el largo", () => {
    assert.equal(slugify("  --Hola--  "), "hola");
    assert.ok(slugify("a".repeat(200)).length <= 60);
  });
  it("devuelve un valor por defecto si no queda nada", () => {
    assert.equal(slugify("¡¡¡"), "producto");
  });
});

describe("slugUnico", () => {
  it("deja el slug si está libre", () => assert.equal(slugUnico("collar", ["arnes"]), "collar"));
  it("agrega un número si ya existe", () => {
    assert.equal(slugUnico("collar", ["collar"]), "collar-2");
    assert.equal(slugUnico("collar", ["collar", "collar-2"]), "collar-3");
  });
});
