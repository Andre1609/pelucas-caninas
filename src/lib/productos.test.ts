import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esquemaProductoCambios, esquemaProductoNuevo, RUTA_IMAGEN } from "./productos";

const nuevo = {
  nombre: "Collar reflectante",
  categoria: "Accesorios",
  precio: 25.5,
  resumen: "Collar ajustable con cinta reflectante",
  descripcion: "Collar resistente para paseos nocturnos.",
  imagen: "/api/imagenes/12",
};

describe("rutas de imagen permitidas", () => {
  it("acepta imágenes subidas y del sitio", () => {
    assert.ok(RUTA_IMAGEN.test("/api/imagenes/12"));
    assert.ok(RUTA_IMAGEN.test("/img/foto-1.webp"));
  });
  it("rechaza direcciones externas, scripts y rutas raras", () => {
    for (const mala of ["http://evil.com/a.png", "javascript:alert(1)", "//evil.com/a.png", "/img/..", "/img/a/b.png", "/api/imagenes/abc", ""]) {
      assert.equal(RUTA_IMAGEN.test(mala), false, mala);
    }
  });
});

describe("esquemaProductoNuevo", () => {
  it("acepta un producto completo", () => assert.ok(esquemaProductoNuevo.safeParse(nuevo).success));
  it("rechaza precio negativo, sin foto y nombre corto", () => {
    assert.ok(!esquemaProductoNuevo.safeParse({ ...nuevo, precio: -1 }).success);
    assert.ok(!esquemaProductoNuevo.safeParse({ ...nuevo, imagen: "" }).success);
    assert.ok(!esquemaProductoNuevo.safeParse({ ...nuevo, nombre: "A" }).success);
  });
  it("rechaza un precio escrito como texto", () => {
    assert.ok(!esquemaProductoNuevo.safeParse({ ...nuevo, precio: "25" }).success);
  });
});

describe("esquemaProductoCambios", () => {
  it("acepta cambios parciales", () => {
    assert.ok(esquemaProductoCambios.safeParse({ precio: 30 }).success);
    assert.ok(esquemaProductoCambios.safeParse({ activo: false }).success);
  });
  it("rechaza un cuerpo vacío o con una imagen inválida", () => {
    assert.ok(!esquemaProductoCambios.safeParse({}).success);
    assert.ok(!esquemaProductoCambios.safeParse({ imagen: "http://evil.com/x.png" }).success);
  });
});
