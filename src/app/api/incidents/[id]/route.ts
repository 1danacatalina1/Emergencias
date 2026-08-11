import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { incidentUpdateSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { serializarIncidentPublico } from "@/lib/serializers";
import { puedeEscribir, puedeEliminar } from "@/lib/permisos";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      incidentType: true,
      personas: { include: { traslados: true } },
      traslados: true,
      ayudas: true,
      adjuntos: true,
    },
  });

  if (!incident) {
    return NextResponse.json({ error: "Incidente no encontrado" }, { status: 404 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(serializarIncidentPublico(incident));
  }

  return NextResponse.json(incident);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEscribir(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para editar reportes" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = incidentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.incident.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Incidente no encontrado" }, { status: 404 });
  }

  const incident = await prisma.incident.update({
    where: { id },
    data: { ...parsed.data, actualizadoPorId: session.user.id },
    include: { incidentType: true },
  });

  await registrarAuditoria({
    entidad: "Incident",
    entidadId: incident.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { antes: existente, despues: incident },
    ip: obtenerIp(request),
  });

  return NextResponse.json(incident);
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEliminar(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para eliminar reportes" }, { status: 403 });
  }

  const { id } = await params;
  const existente = await prisma.incident.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Incidente no encontrado" }, { status: 404 });
  }

  await prisma.incident.delete({ where: { id } });

  await registrarAuditoria({
    entidad: "Incident",
    entidadId: id,
    accion: "ELIMINAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { codigo: existente.codigo },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true });
}
