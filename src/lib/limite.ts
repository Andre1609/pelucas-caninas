const MAX_FALLOS = 5;
const VENTANA_MS = 15 * 60 * 1000;

const fallos = new Map<string, { cuenta: number; reinicio: number }>();

export function bloqueado(clave: string, ahora = Date.now()) {
  const registro = fallos.get(clave);
  if (!registro) return false;
  if (ahora > registro.reinicio) {
    fallos.delete(clave);
    return false;
  }
  return registro.cuenta >= MAX_FALLOS;
}

export function registrarFallo(clave: string, ahora = Date.now()) {
  const registro = fallos.get(clave);
  if (!registro || ahora > registro.reinicio) {
    fallos.set(clave, { cuenta: 1, reinicio: ahora + VENTANA_MS });
  } else {
    registro.cuenta += 1;
  }
}

export function limpiarFallos(clave: string) {
  fallos.delete(clave);
}
