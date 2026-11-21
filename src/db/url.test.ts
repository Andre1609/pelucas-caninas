import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prepararDatabaseUrl } from "./url";

const base = "postgresql://neondb_owner:clave123@ep-ejemplo-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=verify-full";

describe("prepararDatabaseUrl", () => {
  it("acepta una cadena correcta sin tocarla", () => {
    assert.deepEqual(prepararDatabaseUrl(base), { url: base });
  });

  it("corrige los errores de pegado más comunes", () => {
    for (const sucio of [`"${base}"`, `'${base}'`, ` ${base} `, `${base}\n`, `DATABASE_URL=${base}`, `DATABASE_URL="${base}"`, `psql '${base}'`, `/${base}`]) {
      assert.deepEqual(prepararDatabaseUrl(sucio), { url: base }, sucio.slice(0, 20));
    }
  });

  it("acepta el prefijo corto postgres://", () => {
    const corta = base.replace("postgresql://", "postgres://");
    assert.deepEqual(prepararDatabaseUrl(corta), { url: corta });
  });

  it("explica el problema cuando falta o está vacía", () => {
    for (const vacio of [undefined, "", "   ", "\n"]) {
      const r = prepararDatabaseUrl(vacio);
      assert.ok("error" in r && r.error.includes("no está definida"));
    }
  });

  it("explica el problema cuando no es una cadena de conexión y no filtra el contenido", () => {
    const r = prepararDatabaseUrl("ep-ejemplo-pooler.c-2.sa-east-1.aws.neon.tech");
    assert.ok("error" in r && r.error.includes("postgresql://"));
    assert.ok("error" in r && !r.error.includes("neon.tech"));
  });
});
