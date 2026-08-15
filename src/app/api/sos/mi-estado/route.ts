import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const alertaPropiaActiva = await prisma.alertaSOS.findFirst({
    where: { autorId: session.user.id, estado: "ACTIVA" },
    select: { id: true },
  });

  return NextResponse.json({ activa: !!alertaPropiaActiva });
}
