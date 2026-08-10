import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "COORDINADOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const entidad = searchParams.get("entidad");
  const entidadId = searchParams.get("entidadId");

  const logs = await prisma.auditLog.findMany({
    where: {
      entidad: entidad ?? undefined,
      entidadId: entidadId ?? undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json(logs);
}
