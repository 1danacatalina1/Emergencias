import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { solicitudInsumoUpdateSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeEscribir } from "@/lib/permisos";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEscribir(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para editar solicitudes" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = solicitudInsumoUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.solicitudInsumo.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }
  if (existente.estado !== "ABIERTA") {
    return NextResponse.json({ error: "Esta solicitud ya fue resuelta o cancelada" }, { status: 400 });
  }

  const solicitud = await prisma.solicitudInsumo.update({
    where: { id },
    data: { estado: parsed.data.estado },
    include: {
      donationPoint: { select: { id: true, codigo: true, nombre: true, municipio: true, telefonoContacto: true } },
      envio: { select: { id: true, codigo: true } },
    },
  });

  await registrarAuditoria({
    entidad: "SolicitudInsumo",
    entidadId: solicitud.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { antes: existente.estado, despues: solicitud.estado },
    ip: obtenerIp(request),
  });

  return NextResponse.json(solicitud);
}
