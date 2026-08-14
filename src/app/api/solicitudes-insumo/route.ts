import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { solicitudInsumoCreateSchema } from "@/lib/validations";
import { generarCodigo } from "@/lib/codigo";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeEscribir } from "@/lib/permisos";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const estado = new URL(request.url).searchParams.get("estado");

  const solicitudes = await prisma.solicitudInsumo.findMany({
    where: estado ? { estado: estado as never } : undefined,
    include: {
      donationPoint: { select: { id: true, codigo: true, nombre: true, municipio: true, telefonoContacto: true } },
      envio: { select: { id: true, codigo: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json(solicitudes);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEscribir(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para crear solicitudes" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = solicitudInsumoCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const punto = await prisma.donationPoint.findUnique({ where: { id: parsed.data.donationPointId } });
  if (!punto) {
    return NextResponse.json({ error: "Punto de acopio no encontrado" }, { status: 404 });
  }

  const codigo = await generarCodigo("SOL");

  const solicitud = await prisma.solicitudInsumo.create({
    data: {
      codigo,
      donationPointId: parsed.data.donationPointId,
      insumo: parsed.data.insumo,
      cantidad: parsed.data.cantidad,
      unidad: parsed.data.unidad || null,
      notas: parsed.data.notas || null,
      creadoPorId: session.user.id,
    },
    include: {
      donationPoint: { select: { id: true, codigo: true, nombre: true, municipio: true, telefonoContacto: true } },
      envio: { select: { id: true, codigo: true } },
    },
  });

  await registrarAuditoria({
    entidad: "SolicitudInsumo",
    entidadId: solicitud.id,
    accion: "CREAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { codigo: solicitud.codigo, insumo: solicitud.insumo, cantidad: solicitud.cantidad },
    ip: obtenerIp(request),
  });

  return NextResponse.json(solicitud, { status: 201 });
}
