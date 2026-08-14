import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeVerEquipoDeCampo } from "@/lib/permisos";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeVerEquipoDeCampo(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para gestionar alertas SOS" }, { status: 403 });
  }

  const { id } = await params;
  const existente = await prisma.alertaSOS.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Alerta no encontrada" }, { status: 404 });
  }
  if (existente.estado === "ATENDIDA") {
    return NextResponse.json({ error: "Esta alerta ya fue registrada como atendida" }, { status: 400 });
  }

  const alerta = await prisma.alertaSOS.update({
    where: { id },
    data: { estado: "ATENDIDA", atendidaPorId: session.user.id, atendidaEn: new Date() },
    include: {
      autor: { select: { id: true, name: true, telefono: true, tipoColaborador: true } },
      atendidaPor: { select: { id: true, name: true } },
    },
  });

  await registrarAuditoria({
    entidad: "AlertaSOS",
    entidadId: alerta.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { estado: "ATENDIDA" },
    ip: obtenerIp(request),
  });

  return NextResponse.json(alerta);
}
