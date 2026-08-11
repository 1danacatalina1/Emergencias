import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { personCreateSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeEscribir } from "@/lib/permisos";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const incidentId = searchParams.get("incidentId");
  const estadoPersona = searchParams.get("estadoPersona");
  const q = searchParams.get("q");

  const personas = await prisma.person.findMany({
    where: {
      incidentId: incidentId ?? undefined,
      estadoPersona: estadoPersona ? (estadoPersona as never) : undefined,
      OR: q
        ? [
            { nombreCompleto: { contains: q, mode: "insensitive" } },
            { numeroDocumento: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: { incident: { select: { codigo: true, municipio: true } }, traslados: true },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json(personas);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEscribir(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para registrar personas" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = personCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const incident = await prisma.incident.findUnique({ where: { id: parsed.data.incidentId } });
  if (!incident) {
    return NextResponse.json({ error: "Incidente no encontrado" }, { status: 404 });
  }

  const persona = await prisma.person.create({
    data: { ...parsed.data, creadoPorId: session.user.id },
  });

  await registrarAuditoria({
    entidad: "Person",
    entidadId: persona.id,
    accion: "CREAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { nombreCompleto: persona.nombreCompleto, estadoPersona: persona.estadoPersona },
    ip: obtenerIp(request),
  });

  return NextResponse.json(persona, { status: 201 });
}
