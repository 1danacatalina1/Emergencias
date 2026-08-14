import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { donationUpdateSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeEscribir, puedeEliminar } from "@/lib/permisos";
import { ajustarInventario } from "@/lib/inventario";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const donacion = await prisma.donation.findUnique({ where: { id }, include: { donationPoint: true } });
  if (!donacion) {
    return NextResponse.json({ error: "Donación no encontrada" }, { status: 404 });
  }
  return NextResponse.json(donacion);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEscribir(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para editar donaciones" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = donationUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.donation.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Donación no encontrada" }, { status: 404 });
  }

  const donacion = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const actualizada = await tx.donation.update({
      where: { id },
      data: { ...parsed.data, actualizadoPorId: session.user.id },
    });

    // Ajusta el inventario del punto de acopio según las transiciones hacia/desde "RECIBIDA".
    const puntoId = actualizada.donationPointId;
    if (puntoId && actualizada.insumo) {
      const eraRecibida = existente.estado === "RECIBIDA";
      const esRecibida = actualizada.estado === "RECIBIDA";

      if (!eraRecibida && esRecibida && actualizada.cantidad) {
        await ajustarInventario(tx, puntoId, actualizada.insumo, actualizada.cantidad, actualizada.unidad);
      } else if (eraRecibida && !esRecibida && existente.insumo && existente.cantidad) {
        await ajustarInventario(tx, puntoId, existente.insumo, -existente.cantidad, existente.unidad);
      } else if (
        eraRecibida &&
        esRecibida &&
        (existente.insumo !== actualizada.insumo || existente.cantidad !== actualizada.cantidad)
      ) {
        if (existente.insumo && existente.cantidad) {
          await ajustarInventario(tx, puntoId, existente.insumo, -existente.cantidad, existente.unidad);
        }
        if (actualizada.cantidad) {
          await ajustarInventario(tx, puntoId, actualizada.insumo, actualizada.cantidad, actualizada.unidad);
        }
      }
    }

    return actualizada;
  });

  await registrarAuditoria({
    entidad: "Donation",
    entidadId: donacion.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { antes: existente, despues: donacion },
    ip: obtenerIp(request),
  });

  return NextResponse.json(donacion);
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEliminar(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para eliminar donaciones" }, { status: 403 });
  }
  const { id } = await params;
  const existente = await prisma.donation.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Donación no encontrada" }, { status: 404 });
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (existente.estado === "RECIBIDA" && existente.donationPointId && existente.insumo && existente.cantidad) {
      await ajustarInventario(tx, existente.donationPointId, existente.insumo, -existente.cantidad, existente.unidad);
    }
    await tx.donation.delete({ where: { id } });
  });

  await registrarAuditoria({
    entidad: "Donation",
    entidadId: id,
    accion: "ELIMINAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { codigo: existente.codigo },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true });
}
