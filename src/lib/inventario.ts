import type { Prisma } from "@/generated/prisma/client";

type Tx = Prisma.TransactionClient;

/**
 * Suma (o resta, con delta negativo) existencias de un insumo en un punto de
 * acopio. Crea el registro si aún no existe. Se permite que el resultado
 * quede en negativo — refleja un descuadre real (se envió más de lo
 * registrado como recibido) que conviene mostrar, no ocultar.
 */
export async function ajustarInventario(
  tx: Tx,
  donationPointId: string,
  insumo: string,
  delta: number,
  unidad?: string | null,
) {
  if (delta === 0) return;
  await tx.inventarioItem.upsert({
    where: { donationPointId_insumo: { donationPointId, insumo } },
    create: { donationPointId, insumo, cantidad: delta, unidad: unidad ?? null },
    update: { cantidad: { increment: delta }, ...(unidad ? { unidad } : {}) },
  });
}
