import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { registroBitacoraCreateSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeVerEquipoDeCampo } from "@/lib/permisos";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const veTodo = puedeVerEquipoDeCampo(session.user.role);

  const registros = await prisma.registroBitacora.findMany({
    where: veTodo
      ? undefined
      : { OR: [{ autorId: session.user.id }, { tipo: "NECESIDAD" }] },
    include: {
      autor: { select: { id: true, name: true, tipoColaborador: true } },
      atendidaPor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json(registros);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = registroBitacoraCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const registro = await prisma.registroBitacora.create({
    data: {
      tipo: parsed.data.tipo,
      descripcion: parsed.data.descripcion,
      direccion: parsed.data.direccion || null,
      municipio: parsed.data.municipio || null,
      departamento: parsed.data.departamento || null,
      latitud: parsed.data.latitud ?? null,
      longitud: parsed.data.longitud ?? null,
      fotos: parsed.data.fotos,
      contactoLugarNombre: parsed.data.contactoLugarNombre || null,
      contactoLugarTelefono: parsed.data.contactoLugarTelefono || null,
      autorId: session.user.id,
    },
    include: {
      autor: { select: { id: true, name: true, tipoColaborador: true } },
      atendidaPor: { select: { id: true, name: true } },
    },
  });

  await registrarAuditoria({
    entidad: "RegistroBitacora",
    entidadId: registro.id,
    accion: "CREAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { tipo: registro.tipo, descripcion: registro.descripcion },
    ip: obtenerIp(request),
  });

  return NextResponse.json(registro, { status: 201 });
}
