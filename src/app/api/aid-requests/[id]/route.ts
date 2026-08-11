import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { aidRequestUpdateSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeEscribir } from "@/lib/permisos";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const ayuda = await prisma.aidRequest.findUnique({ where: { id }, include: { incident: true } });
  if (!ayuda) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }
  return NextResponse.json(ayuda);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEscribir(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para editar solicitudes de ayuda" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = aidRequestUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.aidRequest.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  const ayuda = await prisma.aidRequest.update({
    where: { id },
    data: { ...parsed.data, actualizadoPorId: session.user.id },
  });

  await registrarAuditoria({
    entidad: "AidRequest",
    entidadId: ayuda.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { antes: existente, despues: ayuda },
    ip: obtenerIp(request),
  });

  return NextResponse.json(ayuda);
}
