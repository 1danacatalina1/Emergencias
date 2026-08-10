import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { transferCreateSchema } from "@/lib/validations";
import { generarCodigo } from "@/lib/codigo";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const estadoTraslado = searchParams.get("estadoTraslado");
  const incidentId = searchParams.get("incidentId");

  const traslados = await prisma.transfer.findMany({
    where: {
      estadoTraslado: estadoTraslado ? (estadoTraslado as never) : undefined,
      incidentId: incidentId ?? undefined,
    },
    include: { person: true, incident: { select: { codigo: true, municipio: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json(traslados);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = transferCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const session = await auth();

  let incidentId = data.incidentId ?? null;

  if (!incidentId) {
    const tipoTraslado = await prisma.incidentType.findUnique({ where: { slug: "emergencia-medica" } });
    if (!tipoTraslado) {
      return NextResponse.json({ error: "Catálogo de tipos no inicializado" }, { status: 500 });
    }
    const codigo = await generarCodigo("EMG");
    const incidenteNuevo = await prisma.incident.create({
      data: {
        codigo,
        incidentTypeId: tipoTraslado.id,
        descripcion: `Traslado: ${data.motivo}`,
        direccion: data.direccion!,
        municipio: data.municipio!,
        departamento: data.departamento!,
        latitud: data.latitud!,
        longitud: data.longitud!,
        nivelPrioridad: "ALTA",
        reporteroNombre: data.reporteroNombre ?? null,
        reporteroTelefono: data.reporteroTelefono ?? null,
        creadoPorId: session?.user?.id ?? null,
      },
    });
    incidentId = incidenteNuevo.id;
  }

  let personId = data.personId ?? null;
  if (!personId) {
    const persona = await prisma.person.create({
      data: {
        incidentId,
        nombreCompleto: data.persona!.nombreCompleto!,
        tipoDocumento: data.persona?.tipoDocumento ?? "SIN_DOCUMENTO",
        numeroDocumento: data.persona?.numeroDocumento ?? null,
        edad: data.persona?.edad ?? null,
        sexo: data.persona?.sexo ?? "NO_INFORMA",
        telefono: data.persona?.telefono ?? null,
        estadoPersona: "TRASLADADA",
        creadoPorId: session?.user?.id ?? null,
      },
    });
    personId = persona.id;
  }

  const traslado = await prisma.transfer.create({
    data: {
      personId,
      incidentId,
      centroMedico: data.centroMedico,
      tipoTraslado: data.tipoTraslado,
      motivo: data.motivo,
      vehiculoPlaca: data.vehiculoPlaca ?? null,
      responsable: data.responsable ?? null,
      observaciones: data.observaciones ?? null,
      creadoPorId: session?.user?.id ?? null,
    },
    include: { person: true, incident: true },
  });

  await registrarAuditoria({
    entidad: "Transfer",
    entidadId: traslado.id,
    accion: "CREAR",
    usuarioId: session?.user?.id,
    usuarioNombre: session?.user?.name,
    cambios: { centroMedico: traslado.centroMedico, estadoTraslado: traslado.estadoTraslado },
    ip: obtenerIp(request),
  });

  return NextResponse.json(traslado, { status: 201 });
}
