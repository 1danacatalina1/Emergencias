import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeGestionarUsuarios } from "@/lib/permisos";

export const dynamic = "force-dynamic";

const seguidoSchema = z.object({ usuarioId: z.string().min(1) });

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const seguidos = await prisma.seguimientoEquipo.findMany({
    where: { coordinadorId: session.user.id, estado: "ACEPTADO" },
    select: { voluntarioId: true },
  });

  return NextResponse.json(seguidos.map((s) => s.voluntarioId));
}

/**
 * Alterna (agrega o quita) a un voluntario de "mi equipo" para el usuario actual.
 * Si el voluntario ya había enviado una solicitud (PENDIENTE) o se le había
 * rechazado antes, marcar la estrella la deja en ACEPTADO en vez de crear una
 * fila duplicada.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeGestionarUsuarios(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para gestionar el equipo" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = seguidoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const existente = await prisma.seguimientoEquipo.findUnique({
    where: { coordinadorId_voluntarioId: { coordinadorId: session.user.id, voluntarioId: parsed.data.usuarioId } },
  });

  if (existente?.estado === "ACEPTADO") {
    await prisma.seguimientoEquipo.delete({ where: { id: existente.id } });
    return NextResponse.json({ siguiendo: false });
  }

  if (existente) {
    await prisma.seguimientoEquipo.update({ where: { id: existente.id }, data: { estado: "ACEPTADO" } });
  } else {
    await prisma.seguimientoEquipo.create({
      data: { coordinadorId: session.user.id, voluntarioId: parsed.data.usuarioId, estado: "ACEPTADO" },
    });
  }
  return NextResponse.json({ siguiendo: true });
}
