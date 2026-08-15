import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeVerMapaYProfesionales } from "@/lib/permisos";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeVerMapaYProfesionales(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para ver la ubicación del equipo" }, { status: 403 });
  }

  const soloMiEquipo = new URL(request.url).searchParams.get("miEquipo") === "true";

  let idsPermitidos: string[] | undefined;
  if (soloMiEquipo) {
    const seguidos = await prisma.seguimientoEquipo.findMany({
      where: { coordinadorId: session.user.id, estado: "ACEPTADO" },
      select: { voluntarioId: true },
    });
    idsPermitidos = seguidos.map((s) => s.voluntarioId);
  }

  const usuarios = await prisma.user.findMany({
    where: {
      compartirUbicacion: true,
      active: true,
      ubicacionLat: { not: null },
      ubicacionLng: { not: null },
      ...(idsPermitidos ? { id: { in: idsPermitidos } } : {}),
    },
    select: {
      id: true,
      name: true,
      tipoColaborador: true,
      telefono: true,
      ubicacionLat: true,
      ubicacionLng: true,
      ubicacionActualizadaEn: true,
    },
    orderBy: { ubicacionActualizadaEn: "desc" },
  });

  return NextResponse.json(usuarios);
}
