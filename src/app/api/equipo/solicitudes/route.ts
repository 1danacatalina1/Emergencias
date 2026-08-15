import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const solicitudSchema = z.object({ coordinadorId: z.string().min(1) });

/** Un voluntario solicita unirse al equipo de trabajo de un coordinador o administrador. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = solicitudSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (parsed.data.coordinadorId === session.user.id) {
    return NextResponse.json({ error: "No puedes enviarte una solicitud a ti mismo" }, { status: 400 });
  }

  const coordinador = await prisma.user.findUnique({
    where: { id: parsed.data.coordinadorId },
    select: { role: true, active: true, estadoCuenta: true },
  });
  if (!coordinador || !coordinador.active || coordinador.estadoCuenta !== "APROBADA" || (coordinador.role !== "ADMIN" && coordinador.role !== "COORDINADOR")) {
    return NextResponse.json({ error: "Ese coordinador no existe o no está disponible" }, { status: 404 });
  }

  const existente = await prisma.seguimientoEquipo.findUnique({
    where: { coordinadorId_voluntarioId: { coordinadorId: parsed.data.coordinadorId, voluntarioId: session.user.id } },
  });

  if (existente?.estado === "ACEPTADO") {
    return NextResponse.json({ estado: "ACEPTADO" });
  }
  if (existente?.estado === "PENDIENTE") {
    return NextResponse.json({ estado: "PENDIENTE" });
  }

  if (existente) {
    await prisma.seguimientoEquipo.update({ where: { id: existente.id }, data: { estado: "PENDIENTE" } });
  } else {
    await prisma.seguimientoEquipo.create({
      data: { coordinadorId: parsed.data.coordinadorId, voluntarioId: session.user.id, estado: "PENDIENTE" },
    });
  }

  return NextResponse.json({ estado: "PENDIENTE" });
}
