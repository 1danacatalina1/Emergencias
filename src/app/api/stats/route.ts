import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { obtenerEstadisticas } from "@/lib/estadisticas";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return NextResponse.json(await obtenerEstadisticas());
}
