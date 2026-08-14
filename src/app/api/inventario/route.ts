import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const donationPointId = new URL(request.url).searchParams.get("donationPointId");

  const inventario = await prisma.inventarioItem.findMany({
    where: donationPointId ? { donationPointId } : undefined,
    include: { donationPoint: { select: { id: true, codigo: true, nombre: true } } },
    orderBy: { insumo: "asc" },
  });

  return NextResponse.json(inventario);
}
