import { prisma } from "@/lib/prisma";

async function siguienteConsecutivo(prefijo: string, year: number): Promise<number> {
  const key = `${prefijo}-${year}`;
  const counter = await prisma.sequenceCounter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return counter.value;
}

/** Genera un código único con formato PREFIJO-AÑO-000001, p.ej. EMG-2026-000001 */
export async function generarCodigo(prefijo: "EMG" | "AYU" | "DON" | "PA" | "MAS" | "ENV" | "SOL"): Promise<string> {
  const year = new Date().getFullYear();
  const consecutivo = await siguienteConsecutivo(prefijo, year);
  return `${prefijo}-${year}-${String(consecutivo).padStart(6, "0")}`;
}
