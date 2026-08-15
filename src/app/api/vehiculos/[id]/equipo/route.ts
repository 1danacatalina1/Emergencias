import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { vehiculoEquipoSchema } from "@/lib/validations";
import { puedeGestionarUsuarios } from "@/lib/permisos";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const INCLUYE = {
  registradoPor: { select: { id: true, name: true } },
  conductores: { include: { usuario: { select: { id: true, name: true, telefono: true } } } },
  pasajeros: { include: { usuario: { select: { id: true, name: true, telefono: true } } } },
  necesidades: { orderBy: { createdAt: "desc" as const } },
} as const;

/** Reemplaza por completo la lista de conductores autorizados y el grupo de pasajeros del vehículo. */
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
    return NextResponse.json({ error: "Solo quien registró el vehículo, un Coordinador o el Administrador pueden editar el equipo" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = vehiculoEquipoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }
  const { conductoresIds, pasajerosIds } = parsed.data;

  const usuariosValidos = await prisma.user.count({
    where: { id: { in: [...new Set([...conductoresIds, ...pasajerosIds])] } },
  });
  const idsUnicos = new Set([...conductoresIds, ...pasajerosIds]);
  if (usuariosValidos !== idsUnicos.size) {
    return NextResponse.json({ error: "Alguno de los usuarios seleccionados no existe" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.vehiculoConductor.deleteMany({ where: { vehiculoId: id } }),
    prisma.vehiculoConductor.createMany({
      data: conductoresIds.map((usuarioId) => ({ vehiculoId: id, usuarioId })),
      skipDuplicates: true,
    }),
    prisma.vehiculoPasajero.deleteMany({ where: { vehiculoId: id } }),
    prisma.vehiculoPasajero.createMany({
      data: pasajerosIds.map((usuarioId) => ({ vehiculoId: id, usuarioId })),
      skipDuplicates: true,
    }),
  ]);

  const vehiculo = await prisma.vehiculo.findUnique({ where: { id }, include: INCLUYE });

  await registrarAuditoria({
    entidad: "Vehiculo",
    entidadId: id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { accion: "actualizar_equipo", conductores: conductoresIds.length, pasajeros: pasajerosIds.length },
    ip: obtenerIp(request),
  });

  return NextResponse.json(vehiculo);
}
