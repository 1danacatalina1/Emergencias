import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { petUpdateSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const mascota = await prisma.pet.findUnique({ where: { id } });
  if (!mascota) {
    return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
  }
  return NextResponse.json(mascota);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = petUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.pet.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
  }

  const mascota = await prisma.pet.update({
    where: { id },
    data: { ...parsed.data, actualizadoPorId: session.user.id },
  });

  await registrarAuditoria({
    entidad: "Pet",
    entidadId: mascota.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { antes: existente, despues: mascota },
    ip: obtenerIp(request),
  });

  return NextResponse.json(mascota);
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const existente = await prisma.pet.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
  }
  await prisma.pet.delete({ where: { id } });

  await registrarAuditoria({
    entidad: "Pet",
    entidadId: id,
    accion: "ELIMINAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { codigo: existente.codigo },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true });
}
