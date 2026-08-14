import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeGestionarUsuarios } from "@/lib/permisos";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeGestionarUsuarios(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para rechazar usuarios" }, { status: 403 });
  }

  const { id } = await params;
  const existente = await prisma.user.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }
  if (existente.estadoCuenta !== "PENDIENTE") {
    return NextResponse.json({ error: "Esta solicitud ya fue procesada" }, { status: 400 });
  }

  const usuario = await prisma.user.update({
    where: { id },
    data: {
      estadoCuenta: "RECHAZADA",
      active: false,
      aprobadoPorId: session.user.id,
      aprobadoEn: new Date(),
    },
  });

  await registrarAuditoria({
    entidad: "User",
    entidadId: usuario.id,
    accion: "RECHAZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { nombre: usuario.name, email: usuario.email },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true });
}
