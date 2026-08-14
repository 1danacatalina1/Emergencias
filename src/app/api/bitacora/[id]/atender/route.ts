import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existente = await prisma.registroBitacora.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
  }
  if (existente.tipo !== "NECESIDAD") {
    return NextResponse.json({ error: "Solo las necesidades reportadas se pueden marcar como atendidas" }, { status: 400 });
  }
  if (existente.estado === "ATENDIDA") {
    return NextResponse.json({ error: "Esta necesidad ya fue registrada como atendida" }, { status: 400 });
  }

  const registro = await prisma.registroBitacora.update({
    where: { id },
    data: {
      estado: "ATENDIDA",
      atendidaPorId: session.user.id,
      atendidaEn: new Date(),
    },
    include: {
      autor: { select: { id: true, name: true, tipoColaborador: true } },
      atendidaPor: { select: { id: true, name: true } },
    },
  });

  await registrarAuditoria({
    entidad: "RegistroBitacora",
    entidadId: registro.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { estado: "ATENDIDA" },
    ip: obtenerIp(request),
  });

  return NextResponse.json(registro);
}
