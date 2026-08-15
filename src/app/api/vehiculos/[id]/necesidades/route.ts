import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { necesidadEconomicaCreateSchema } from "@/lib/validations";
import { puedeVerMapaYProfesionales } from "@/lib/permisos";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeVerMapaYProfesionales(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene acceso a esta sección" }, { status: 403 });
  }

  const { id } = await params;
  const vehiculo = await prisma.vehiculo.findUnique({ where: { id } });
  if (!vehiculo) {
    return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = necesidadEconomicaCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const necesidad = await prisma.necesidadEconomicaVehiculo.create({
    data: {
      vehiculoId: id,
      concepto: data.concepto,
      montoEstimado: data.montoEstimado ?? null,
      descripcion: data.descripcion ?? null,
    },
  });

  await registrarAuditoria({
    entidad: "NecesidadEconomicaVehiculo",
    entidadId: necesidad.id,
    accion: "CREAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { vehiculo: vehiculo.placa, concepto: necesidad.concepto, montoEstimado: necesidad.montoEstimado },
    ip: obtenerIp(request),
  });

  return NextResponse.json(necesidad, { status: 201 });
}
