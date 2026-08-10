import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { personUpdateSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const persona = await prisma.person.findUnique({
    where: { id },
    include: { incident: true, traslados: true },
  });
  if (!persona) {
    return NextResponse.json({ error: "Persona no encontrada" }, { status: 404 });
  }
  return NextResponse.json(persona);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = personUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.person.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Persona no encontrada" }, { status: 404 });
  }

  const persona = await prisma.person.update({ where: { id }, data: parsed.data });

  await registrarAuditoria({
    entidad: "Person",
    entidadId: persona.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { antes: existente, despues: persona },
    ip: obtenerIp(request),
  });

  return NextResponse.json(persona);
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const existente = await prisma.person.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Persona no encontrada" }, { status: 404 });
  }
  await prisma.person.delete({ where: { id } });

  await registrarAuditoria({
    entidad: "Person",
    entidadId: id,
    accion: "ELIMINAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { nombreCompleto: existente.nombreCompleto },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true });
}
