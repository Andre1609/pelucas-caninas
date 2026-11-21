import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { hashearClave } from "../src/lib/auth";

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const usuario = (await rl.question("Usuario del administrador (ej. manuel): ")).trim();
  const clave = await rl.question("Contraseña (mínimo 10 caracteres): ");
  rl.close();

  if (!usuario || clave.length < 10) {
    console.log("\nEl usuario no puede estar vacío y la contraseña debe tener al menos 10 caracteres.");
    process.exit(1);
  }

  console.log("\nCopia estas 3 líneas en tu archivo .env.local:\n");
  console.log(`ADMIN_USER="${usuario}"`);
  console.log(`ADMIN_PASSWORD_HASH="${hashearClave(clave)}"`);
  console.log(`AUTH_SECRET="${randomBytes(48).toString("hex")}"`);
  console.log("\nLa contraseña no se guarda en ningún lado: solo queda su huella cifrada.");
}

main();
