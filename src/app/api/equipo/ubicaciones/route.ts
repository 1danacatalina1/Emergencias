import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeVerEquipoDeCampo } from "@/lib/permisos";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeVerEquipoDeCampo(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para ver la ubicación del equipo" }, { status: 403 });
  }

  const usuarios = await prisma.user.findMany({
    where: { compartirUbicacion: true, active: true, ubicacionLat: { not: null }, ubicacionLng: { not: null } },
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
