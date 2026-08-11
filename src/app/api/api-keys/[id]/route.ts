import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeGestionarIntegraciones } from "@/lib/permisos";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeGestionarIntegraciones(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para revocar llaves de integración" }, { status: 403 });
  }

  const { id } = await params;
  const existente = await prisma.apiKey.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Llave no encontrada" }, { status: 404 });
  }

  await prisma.apiKey.delete({ where: { id } });

  await registrarAuditoria({
    entidad: "ApiKey",
    entidadId: id,
    accion: "ELIMINAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { nombre: existente.nombre, prefijo: existente.prefijo },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true });
}
