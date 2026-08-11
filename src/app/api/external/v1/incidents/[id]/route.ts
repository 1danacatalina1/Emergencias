import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarApiKey } from "@/lib/apikeys";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const apiKey = await verificarApiKey(request.headers.get("authorization"));
  if (!apiKey) {
    return NextResponse.json({ error: "Token de acceso inválido, expirado o revocado" }, { status: 401 });
  }

  const { id } = await params;
  const incidente = await prisma.incident.findUnique({
    where: { id },
    include: {
      incidentType: true,
      personas: { include: { traslados: true, adjuntos: true } },
      traslados: true,
      ayudas: true,
      adjuntos: true,
    },
  });

  if (!incidente) {
    return NextResponse.json({ error: "Incidente no encontrado" }, { status: 404 });
  }

  return NextResponse.json(incidente);
}
