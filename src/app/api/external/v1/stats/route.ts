import { NextResponse } from "next/server";
import { verificarApiKey } from "@/lib/apikeys";
import { obtenerEstadisticas } from "@/lib/estadisticas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const apiKey = await verificarApiKey(request.headers.get("authorization"));
  if (!apiKey) {
    return NextResponse.json({ error: "Token de acceso inválido, expirado o revocado" }, { status: 401 });
  }

  return NextResponse.json(await obtenerEstadisticas());
}
