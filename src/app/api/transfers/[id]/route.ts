import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { transferUpdateSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeEscribir, puedeEliminar } from "@/lib/permisos";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const traslado = await prisma.transfer.findUnique({
    where: { id },
    include: { person: true, incident: true },
  });
  if (!traslado) {
    return NextResponse.json({ error: "Traslado no encontrado" }, { status: 404 });
  }
  return NextResponse.json(traslado);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEscribir(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para editar traslados" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = transferUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.transfer.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Traslado no encontrado" }, { status: 404 });
  }

  const traslado = await prisma.transfer.update({ where: { id }, data: parsed.data });

  if (parsed.data.estadoTraslado === "ATENDIDO_EN_CENTRO") {
    await prisma.person.update({
      where: { id: traslado.personId },
      data: { estadoPersona: "ATENDIDA" },
    });
  }

  await registrarAuditoria({
    entidad: "Transfer",
    entidadId: traslado.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { antes: existente, despues: traslado },
    ip: obtenerIp(request),
  });

  return NextResponse.json(traslado);
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEliminar(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para eliminar traslados" }, { status: 403 });
  }
  const { id } = await params;
  const existente = await prisma.transfer.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Traslado no encontrado" }, { status: 404 });
  }
  await prisma.transfer.delete({ where: { id } });

  await registrarAuditoria({
    entidad: "Transfer",
    entidadId: id,
    accion: "ELIMINAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { centroMedico: existente.centroMedico },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true });
}
