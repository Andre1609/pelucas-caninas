export type ResultadoUrl = { url: string } | { error: string };

export function prepararDatabaseUrl(crudo: string | undefined): ResultadoUrl {
  if (!crudo || !crudo.trim()) {
    return { error: "DATABASE_URL no está definida o llegó vacía a este entorno. Revisa que exista en Vercel para Production y vuelve a desplegar." };
  }

  const hallada = crudo.match(/postgres(?:ql)?:\/\/[^\s'"]+/);
  if (!hallada) {
    return {
      error: `DATABASE_URL no tiene formato de conexión: debe empezar con postgresql:// (largo ${crudo.length}, empieza con "${crudo.trim().slice(0, 3)}").`,
    };
  }

  return { url: hallada[0] };
}
