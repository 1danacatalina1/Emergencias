import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { incidentCreateSchema } from "@/lib/validations";
import { generarCodigo } from "@/lib/codigo";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { serializarIncidentPublico } from "@/lib/serializers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado");
  const tipo = searchParams.get("tipo");
  const municipio = searchParams.get("municipio");
  const prioridad = searchParams.get("prioridad");
  const q = searchParams.get("q");
  const limit = Math.min(Number(searchParams.get("limit") ?? 200), 500);

  const session = await auth();
  const esAdmin = Boolean(session?.user);

  const incidents = await prisma.incident.findMany({
    where: {
      estado: estado ? (estado as never) : undefined,
      incidentTypeId: tipo ? tipo : undefined,
      municipio: municipio ? { equals: municipio, mode: "insensitive" } : undefined,
      nivelPrioridad: prioridad ? (prioridad as never) : undefined,
      OR: q
        ? [
            { codigo: { contains: q, mode: "insensitive" } },
            { descripcion: { contains: q, mode: "insensitive" } },
            { direccion: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: { incidentType: true, _count: { select: { personas: true, ayudas: true, traslados: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (!esAdmin) {
    return NextResponse.json(incidents.map(serializarIncidentPublico));
  }

  return NextResponse.json(incidents);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = incidentCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const session = await auth();

  const tipo = await prisma.incidentType.findUnique({ where: { id: data.incidentTypeId } });
  if (!tipo) {
    return NextResponse.json({ error: "Tipo de incidente inválido" }, { status: 400 });
  }

  const codigo = await generarCodigo("EMG");

  const incident = await prisma.incident.create({
    data: {
      codigo,
      incidentTypeId: data.incidentTypeId,
      subtipo: data.subtipo ?? null,
      descripcion: data.descripcion,
      direccion: data.direccion,
      municipio: data.municipio,
      departamento: data.departamento,
      latitud: data.latitud,
      longitud: data.longitud,
      precisionUbicacion: data.precisionUbicacion ?? null,
      nivelPrioridad: data.nivelPrioridad,
      fechaEvento: data.fechaEvento ?? new Date(),
      reporteroNombre: data.esAnonimo ? null : data.reporteroNombre ?? null,
      reporteroTelefono: data.esAnonimo ? null : data.reporteroTelefono ?? null,
      esAnonimo: data.esAnonimo,
      creadoPorId: session?.user?.id ?? null,
      personas: data.personas.length
        ? {
            create: data.personas.map((p) => ({
              nombreCompleto: p.nombreCompleto,
              tipoDocumento: p.tipoDocumento,
              numeroDocumento: p.numeroDocumento ?? null,
              edad: p.edad ?? null,
              sexo: p.sexo,
              telefono: p.telefono ?? null,
              estadoPersona: p.estadoPersona,
              condicionSalud: p.condicionSalud ?? null,
              observaciones: p.observaciones ?? null,
              creadoPorId: session?.user?.id ?? null,
            })),
          }
        : undefined,
      adjuntos: data.fotos.length
        ? { create: data.fotos.map((url) => ({ url })) }
        : undefined,
    },
    include: { incidentType: true, personas: true, adjuntos: true },
  });

  await registrarAuditoria({
    entidad: "Incident",
    entidadId: incident.id,
    accion: "CREAR",
    usuarioId: session?.user?.id,
    usuarioNombre: session?.user?.name,
    cambios: { codigo: incident.codigo, estado: incident.estado },
    ip: obtenerIp(request),
  });

  return NextResponse.json(incident, { status: 201 });
}
