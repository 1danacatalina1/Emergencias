import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { necesidadEconomicaUpdateSchema } from "@/lib/validations";
import { puedeVerMapaYProfesionales } from "@/lib/permisos";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string; necesidadId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeVerMapaYProfesionales(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene acceso a esta sección" }, { status: 403 });
  }

  const { id, necesidadId } = await params;
  const existente = await prisma.necesidadEconomicaVehiculo.findUnique({ where: { id: necesidadId } });
  if (!existente || existente.vehiculoId !== id) {
    return NextResponse.json({ error: "Necesidad no encontrada" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = necesidadEconomicaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const necesidad = await prisma.necesidadEconomicaVehiculo.update({
    where: { id: necesidadId },
    data: parsed.data,
  });

  await registrarAuditoria({
    entidad: "NecesidadEconomicaVehiculo",
    entidadId: necesidad.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { antes: existente, despues: parsed.data },
    ip: obtenerIp(request),
  });

  return NextResponse.json(necesidad);
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeVerMapaYProfesionales(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene acceso a esta sección" }, { status: 403 });
  }

  const { id, necesidadId } = await params;
  const existente = await prisma.necesidadEconomicaVehiculo.findUnique({ where: { id: necesidadId } });
  if (!existente || existente.vehiculoId !== id) {
    return NextResponse.json({ error: "Necesidad no encontrada" }, { status: 404 });
  }

  await prisma.necesidadEconomicaVehiculo.delete({ where: { id: necesidadId } });

  await registrarAuditoria({
    entidad: "NecesidadEconomicaVehiculo",
    entidadId: necesidadId,
    accion: "ELIMINAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { concepto: existente.concepto },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true });
}
