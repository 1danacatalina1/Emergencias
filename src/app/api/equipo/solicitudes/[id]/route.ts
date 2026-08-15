import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const respuestaSchema = z.object({ aceptar: z.boolean() });

/** El coordinador destinatario acepta o rechaza una solicitud para unirse a su equipo. */
export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = respuestaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { id } = await params;
  const solicitud = await prisma.seguimientoEquipo.findUnique({ where: { id } });
  if (!solicitud) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }
  if (solicitud.coordinadorId !== session.user.id) {
    return NextResponse.json({ error: "Esta solicitud no fue dirigida a ti" }, { status: 403 });
  }
  if (solicitud.estado !== "PENDIENTE") {
    return NextResponse.json({ error: "Esta solicitud ya fue respondida" }, { status: 400 });
  }

  const actualizada = await prisma.seguimientoEquipo.update({
    where: { id },
    data: { estado: parsed.data.aceptar ? "ACEPTADO" : "RECHAZADO" },
  });

  return NextResponse.json({ estado: actualizada.estado });
}
