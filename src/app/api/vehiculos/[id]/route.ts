import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { vehiculoUpdateSchema } from "@/lib/validations";
import { puedeVerMapaYProfesionales, puedeGestionarUsuarios, puedeEliminar } from "@/lib/permisos";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const INCLUYE = {
  registradoPor: { select: { id: true, name: true } },
  conductores: { include: { usuario: { select: { id: true, name: true, telefono: true } } } },
  pasajeros: { include: { usuario: { select: { id: true, name: true, telefono: true } } } },
  necesidades: { orderBy: { createdAt: "desc" as const } },
} as const;

export async function GET(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeVerMapaYProfesionales(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene acceso a esta sección" }, { status: 403 });
  }

  const { id } = await params;
  const vehiculo = await prisma.vehiculo.findUnique({ where: { id }, include: INCLUYE });
  if (!vehiculo) {
    return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
  }
  return NextResponse.json(vehiculo);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existente = await prisma.vehiculo.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
  }

  const puedeEditar = existente.registradoPorId === session.user.id || puedeGestionarUsuarios(session.user.role);
  if (!puedeEditar) {
    return NextResponse.json({ error: "Solo quien registró el vehículo, un Coordinador o el Administrador pueden editarlo" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = vehiculoUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (data.placa && data.placa.toUpperCase() !== existente.placa) {
    const otro = await prisma.vehiculo.findUnique({ where: { placa: data.placa.toUpperCase() } });
    if (otro) {
      return NextResponse.json({ error: "Ya existe un vehículo registrado con esa placa" }, { status: 409 });
    }
  }

  const vehiculo = await prisma.vehiculo.update({
    where: { id },
    data: { ...data, placa: data.placa ? data.placa.toUpperCase() : undefined },
    include: INCLUYE,
  });

  await registrarAuditoria({
    entidad: "Vehiculo",
    entidadId: vehiculo.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { antes: existente, despues: data },
    ip: obtenerIp(request),
  });

  return NextResponse.json(vehiculo);
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEliminar(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para eliminar vehículos" }, { status: 403 });
  }

  const { id } = await params;
  const existente = await prisma.vehiculo.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
  }

  await prisma.vehiculo.delete({ where: { id } });

  await registrarAuditoria({
    entidad: "Vehiculo",
    entidadId: id,
    accion: "ELIMINAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { placa: existente.placa },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true });
}
