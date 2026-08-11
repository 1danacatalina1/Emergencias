import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeAuditarYExportar } from "@/lib/permisos";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeAuditarYExportar(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para ver la auditoría" }, { status: 403 });
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
