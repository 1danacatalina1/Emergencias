import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const PREFIJO = "emg_live_";
const PREFIJO_LONGITUD = 19; // "emg_live_" (9) + 10 caracteres del secreto, suficiente para ubicarla sin poder reconstruirla

export function generarApiKey(): { llave: string; prefijo: string } {
  const secreto = crypto.randomBytes(32).toString("base64url");
  const llave = `${PREFIJO}${secreto}`;
  return { llave, prefijo: llave.slice(0, PREFIJO_LONGITUD) };
}

/**
 * Valida el encabezado Authorization: Bearer <llave> de una petición externa.
 * Devuelve el registro de ApiKey si es válida, activa y no expiró; null en caso contrario.
 */
export async function verificarApiKey(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const llave = authHeader.slice("Bearer ".length).trim();
  if (!llave.startsWith(PREFIJO) || llave.length < PREFIJO_LONGITUD) return null;

  const prefijo = llave.slice(0, PREFIJO_LONGITUD);
  const registro = await prisma.apiKey.findUnique({ where: { prefijo } });
  if (!registro || !registro.activa) return null;
  if (registro.expiraEn && registro.expiraEn.getTime() < Date.now()) return null;

  const valido = await bcrypt.compare(llave, registro.llaveHash);
  if (!valido) return null;

  // Mejor esfuerzo: no bloquea la respuesta si falla la actualización del último uso.
  prisma.apiKey.update({ where: { id: registro.id }, data: { ultimoUsoEn: new Date() } }).catch(() => {});

  return registro;
}
