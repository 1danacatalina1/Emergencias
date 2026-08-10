import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const tipos = await prisma.incidentType.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
  });
  return NextResponse.json(tipos);
}
