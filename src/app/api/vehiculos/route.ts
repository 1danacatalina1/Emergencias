import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { vehiculoCreateSchema } from "@/lib/validations";
import { puedeVerMapaYProfesionales } from "@/lib/permisos";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

const INCLUYE = {
  registradoPor: { select: { id: true, name: true } },
  conductores: { include: { usuario: { select: { id: true, name: true, telefono: true } } } },
  pasajeros: { include: { usuario: { select: { id: true, name: true, telefono: true } } } },
  necesidades: { orderBy: { createdAt: "desc" as const } },
} as const;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeVerMapaYProfesionales(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene acceso a esta sección" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado");
  const tipo = searchParams.get("tipo");

  const vehiculos = await prisma.vehiculo.findMany({
    where: {
      estado: estado ? (estado as never) : undefined,
      tipo: tipo ? (tipo as never) : undefined,
    },
    include: INCLUYE,
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json(vehiculos);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeVerMapaYProfesionales(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene acceso a esta sección" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = vehiculoCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const yaExiste = await prisma.vehiculo.findUnique({ where: { placa: data.placa.toUpperCase() } });
  if (yaExiste) {
    return NextResponse.json({ error: "Ya existe un vehículo registrado con esa placa" }, { status: 409 });
  }

  const vehiculo = await prisma.vehiculo.create({
    data: {
      placa: data.placa.toUpperCase(),
      tipo: data.tipo,
      marcaModelo: data.marcaModelo ?? null,
      capacidadPersonas: data.capacidadPersonas ?? null,
      capacidadCargaDescripcion: data.capacidadCargaDescripcion ?? null,
      paraPersonas: data.paraPersonas,
      paraInsumos: data.paraInsumos,
      cubreRutaNacional: data.cubreRutaNacional,
      cubreRutaUrbana: data.cubreRutaUrbana,
      rutasCubiertas: data.rutasCubiertas ?? null,
      municipioBase: data.municipioBase ?? null,
      departamentoBase: data.departamentoBase ?? null,
      observaciones: data.observaciones ?? null,
      registradoPorId: session.user.id,
    },
    include: INCLUYE,
  });

  await registrarAuditoria({
    entidad: "Vehiculo",
    entidadId: vehiculo.id,
    accion: "CREAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { placa: vehiculo.placa, tipo: vehiculo.tipo },
    ip: obtenerIp(request),
  });

  return NextResponse.json(vehiculo, { status: 201 });
}
