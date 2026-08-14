import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ubicacionUpdateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = ubicacionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  if (!parsed.data.compartir) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { compartirUbicacion: false, ubicacionLat: null, ubicacionLng: null, ubicacionActualizadaEn: null },
    });
    return NextResponse.json({ compartirUbicacion: false });
  }

  if (parsed.data.latitud === undefined || parsed.data.longitud === undefined) {
    return NextResponse.json({ error: "Falta la ubicación actual" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      compartirUbicacion: true,
      ubicacionLat: parsed.data.latitud,
      ubicacionLng: parsed.data.longitud,
      ubicacionActualizadaEn: new Date(),
    },
  });

  return NextResponse.json({ compartirUbicacion: true });
}
