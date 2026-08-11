import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarApiKey } from "@/lib/apikeys";

export const dynamic = "force-dynamic";

const LIMITE_MAXIMO = 200;

export async function GET(request: Request) {
  const apiKey = await verificarApiKey(request.headers.get("authorization"));
  if (!apiKey) {
    return NextResponse.json({ error: "Token de acceso inválido, expirado o revocado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, LIMITE_MAXIMO);
  const pagina = Math.max(Number(searchParams.get("pagina") ?? 1) || 1, 1);
  const estado = searchParams.get("estado");
  const actualizadoDesde = searchParams.get("actualizadoDesde");

  let fechaDesde: Date | undefined;
  if (actualizadoDesde) {
    fechaDesde = new Date(actualizadoDesde);
    if (Number.isNaN(fechaDesde.getTime())) {
      return NextResponse.json({ error: "actualizadoDesde debe ser una fecha ISO 8601 válida" }, { status: 400 });
    }
  }

  const where = {
    estado: estado ? (estado as never) : undefined,
    updatedAt: fechaDesde ? { gte: fechaDesde } : undefined,
  };

  const [total, incidentes] = await prisma.$transaction([
    prisma.incident.count({ where }),
    prisma.incident.findMany({
      where,
      include: {
        incidentType: true,
        personas: true,
        traslados: true,
        ayudas: true,
        adjuntos: true,
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: (pagina - 1) * limit,
    }),
  ]);

  return NextResponse.json({
    data: incidentes,
    paginacion: {
      pagina,
      limit,
      total,
      totalPaginas: Math.ceil(total / limit),
    },
  });
}
