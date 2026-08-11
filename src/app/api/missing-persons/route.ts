import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { missingPersonCreateSchema } from "@/lib/validations";
import { generarCodigo } from "@/lib/codigo";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado");
  const q = searchParams.get("q");

  const personas = await prisma.person.findMany({
    where: {
      estadoPersona: estado ? (estado as never) : { in: ["DESAPARECIDA", "BUSQUEDA"] },
      OR: q
        ? [
            { nombreCompleto: { contains: q, mode: "insensitive" } },
            { incident: { municipio: { contains: q, mode: "insensitive" } } },
          ]
        : undefined,
    },
    select: {
      id: true,
      nombreCompleto: true,
      edad: true,
      sexo: true,
      descripcionFisica: true,
      estadoPersona: true,
      contactoNombre: true,
      contactoTelefono: true,
      contactoParentesco: true,
      createdAt: true,
      adjuntos: { select: { url: true }, take: 1 },
      incident: {
        select: { codigo: true, direccion: true, municipio: true, departamento: true, fechaEvento: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(
    personas.map((p) => ({
      id: p.id,
      nombreCompleto: p.nombreCompleto,
      edad: p.edad,
      sexo: p.sexo,
      descripcionFisica: p.descripcionFisica,
      estadoPersona: p.estadoPersona,
      contactoNombre: p.contactoNombre,
      contactoTelefono: p.contactoTelefono,
      contactoParentesco: p.contactoParentesco,
      createdAt: p.createdAt,
      foto: p.adjuntos[0]?.url ?? null,
      codigoIncidente: p.incident?.codigo ?? null,
      ultimaUbicacion: p.incident
        ? {
            direccion: p.incident.direccion,
            municipio: p.incident.municipio,
            departamento: p.incident.departamento,
            fecha: p.incident.fechaEvento,
          }
        : null,
    })),
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = missingPersonCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const session = await auth();

  let incidentId = data.incidentId ?? null;

  if (!incidentId) {
    const tipoDesaparecido = await prisma.incidentType.findUnique({ where: { slug: "persona-desaparecida" } });
    if (!tipoDesaparecido) {
      return NextResponse.json({ error: "Catálogo de tipos no inicializado" }, { status: 500 });
    }
    const codigo = await generarCodigo("EMG");
    const incidente = await prisma.incident.create({
      data: {
        codigo,
        incidentTypeId: tipoDesaparecido.id,
        descripcion: `Persona desaparecida: ${data.nombreCompleto}`,
        direccion: data.direccion,
        municipio: data.municipio,
        departamento: data.departamento,
        latitud: data.latitud,
        longitud: data.longitud,
        nivelPrioridad: "ALTA",
        fechaEvento: data.fechaVisto ?? new Date(),
        reporteroNombre: data.contactoNombre,
        reporteroTelefono: data.contactoTelefono,
        creadoPorId: session?.user?.id ?? null,
      },
    });
    incidentId = incidente.id;
  } else {
    const incidenteExistente = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incidenteExistente) {
      return NextResponse.json({ error: "Incidente no encontrado" }, { status: 404 });
    }
  }

  const persona = await prisma.person.create({
    data: {
      incidentId,
      nombreCompleto: data.nombreCompleto,
      tipoDocumento: data.tipoDocumento,
      numeroDocumento: data.numeroDocumento ?? null,
      edad: data.edad ?? null,
      sexo: data.sexo,
      descripcionFisica: data.descripcionFisica ?? null,
      estadoPersona: "DESAPARECIDA",
      contactoNombre: data.contactoNombre,
      contactoTelefono: data.contactoTelefono,
      contactoParentesco: data.contactoParentesco ?? null,
      creadoPorId: session?.user?.id ?? null,
      adjuntos: data.foto ? { create: { url: data.foto, incidentId } } : undefined,
    },
    include: { incident: { select: { codigo: true } } },
  });

  await registrarAuditoria({
    entidad: "Person",
    entidadId: persona.id,
    accion: "CREAR",
    usuarioId: session?.user?.id,
    usuarioNombre: session?.user?.name,
    cambios: { nombreCompleto: persona.nombreCompleto, estadoPersona: persona.estadoPersona, tipo: "persona_desaparecida" },
    ip: obtenerIp(request),
  });

  return NextResponse.json(
    { ...persona, codigoIncidente: persona.incident?.codigo },
    { status: 201 },
  );
}
