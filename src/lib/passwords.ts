import crypto from "crypto";

// Sin caracteres ambiguos (0/O, 1/l/I) para que sea fácil de transcribir a mano
// cuando se le entrega a un rescatista por teléfono o en papel.
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function generarContrasenaTemporal(longitud = 12): string {
  const bytes = crypto.randomBytes(longitud);
  let resultado = "";
  for (let i = 0; i < longitud; i++) {
    resultado += ALFABETO[bytes[i]! % ALFABETO.length];
  }
  return resultado;
}
