import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { aidRequestCreateSchema } from "@/lib/validations";
import { generarCodigo } from "@/lib/codigo";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado");
  const tipoAyuda = searchParams.get("tipoAyuda");

  const ayudas = await prisma.aidRequest.findMany({
    where: {
      estado: estado ? (estado as never) : undefined,
      tipoAyuda: tipoAyuda ? (tipoAyuda as never) : undefined,
    },
    include: { incident: { select: { codigo: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json(ayudas);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = aidRequestCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const session = await auth();
  const codigo = await generarCodigo("AYU");

  const ayuda = await prisma.aidRequest.create({
    data: {
      codigo,
      incidentId: data.incidentId ?? null,
      nombreSolicitante: data.nombreSolicitante,
      telefonoSolicitante: data.telefonoSolicitante,
      tipoAyuda: data.tipoAyuda,
      descripcion: data.descripcion,
      cantidadPersonas: data.cantidadPersonas,
      prioridad: data.prioridad,
      direccion: data.direccion,
      municipio: data.municipio,
      departamento: data.departamento,
      latitud: data.latitud ?? null,
      longitud: data.longitud ?? null,
      creadoPorId: session?.user?.id ?? null,
    },
  });

  await registrarAuditoria({
    entidad: "AidRequest",
    entidadId: ayuda.id,
    accion: "CREAR",
    usuarioId: session?.user?.id,
    usuarioNombre: session?.user?.name,
    cambios: { codigo: ayuda.codigo, tipoAyuda: ayuda.tipoAyuda },
    ip: obtenerIp(request),
  });

  return NextResponse.json(ayuda, { status: 201 });
}
