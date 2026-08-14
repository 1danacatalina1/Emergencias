import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { envioUpdateSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeEscribir, puedeEliminar } from "@/lib/permisos";
import { ajustarInventario } from "@/lib/inventario";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEscribir(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para editar envíos" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = envioUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.envio.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
  }

  const envio = await prisma.envio.update({
    where: { id },
    data: parsed.data,
    include: {
      donationPoint: { select: { id: true, codigo: true, nombre: true } },
      items: true,
    },
  });

  await registrarAuditoria({
    entidad: "Envio",
    entidadId: envio.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { antes: existente.estado, despues: envio.estado },
    ip: obtenerIp(request),
  });

  return NextResponse.json(envio);
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEliminar(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para eliminar envíos" }, { status: 403 });
  }
  const { id } = await params;
  const existente = await prisma.envio.findUnique({ where: { id }, include: { items: true } });
  if (!existente) {
    return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    for (const item of existente.items) {
      await ajustarInventario(tx, existente.donationPointId, item.insumo, item.cantidad, item.unidad);
    }
    if (existente.solicitudInsumoId) {
      await tx.solicitudInsumo.update({
        where: { id: existente.solicitudInsumoId },
        data: { estado: "ABIERTA", resueltaEn: null },
      });
    }
    await tx.envio.delete({ where: { id } });
  });

  await registrarAuditoria({
    entidad: "Envio",
    entidadId: id,
    accion: "ELIMINAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { codigo: existente.codigo },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true });
}
