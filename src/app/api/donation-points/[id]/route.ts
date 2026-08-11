import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { donationPointUpdateSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeEscribir, puedeEliminar } from "@/lib/permisos";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const punto = await prisma.donationPoint.findUnique({
    where: { id },
    include: { donaciones: true },
  });
  if (!punto) {
    return NextResponse.json({ error: "Punto de acopio no encontrado" }, { status: 404 });
  }
  return NextResponse.json(punto);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEscribir(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para editar puntos de acopio" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = donationPointUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.donationPoint.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Punto de acopio no encontrado" }, { status: 404 });
  }

  const punto = await prisma.donationPoint.update({ where: { id }, data: parsed.data });

  await registrarAuditoria({
    entidad: "DonationPoint",
    entidadId: punto.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { antes: existente, despues: punto },
    ip: obtenerIp(request),
  });

  return NextResponse.json(punto);
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEliminar(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para eliminar puntos de acopio" }, { status: 403 });
  }
  const { id } = await params;
  const existente = await prisma.donationPoint.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Punto de acopio no encontrado" }, { status: 404 });
  }
  await prisma.donationPoint.delete({ where: { id } });

  await registrarAuditoria({
    entidad: "DonationPoint",
    entidadId: id,
    accion: "ELIMINAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { nombre: existente.nombre },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true });
}
