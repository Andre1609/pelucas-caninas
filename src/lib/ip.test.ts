import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { claveTelefono, hashIp, ipDelCliente } from "./ip";

const cabeceras = (datos: Record<string, string>) => ({ get: (nombre: string) => datos[nombre] ?? null });

describe("ipDelCliente", () => {
  it("toma la primera IP de x-forwarded-for", () => {
    assert.equal(ipDelCliente(cabeceras({ "x-forwarded-for": "190.1.2.3, 10.0.0.1" })), "190.1.2.3");
  });
  it("usa x-real-ip si no hay x-forwarded-for", () => {
    assert.equal(ipDelCliente(cabeceras({ "x-real-ip": "181.5.6.7" })), "181.5.6.7");
  });
  it("devuelve null si no hay datos", () => {
    assert.equal(ipDelCliente(cabeceras({})), null);
  });
});

describe("hashIp", () => {
  it("es estable, no contiene la IP y cambia con la IP o el secreto", () => {
    const base = hashIp("190.1.2.3", "secreto");
    assert.equal(base, hashIp("190.1.2.3", "secreto"));
    assert.ok(!base.includes("190"));
    assert.notEqual(base, hashIp("190.1.2.4", "secreto"));
    assert.notEqual(base, hashIp("190.1.2.3", "otro"));
    assert.equal(base.length, 32);
  });
});

describe("claveTelefono", () => {
  it("trata igual al mismo celular escrito de distintas formas", () => {
    assert.equal(claveTelefono("936364474"), "936364474");
    assert.equal(claveTelefono("+51936364474"), "936364474");
    assert.equal(claveTelefono("936 364 474"), "936364474");
    assert.equal(claveTelefono("(51) 936-364-474"), "936364474");
  });
});
