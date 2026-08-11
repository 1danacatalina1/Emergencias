import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiKeyCreateSchema } from "@/lib/validations";
import { generarApiKey } from "@/lib/apikeys";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeGestionarIntegraciones } from "@/lib/permisos";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeGestionarIntegraciones(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para ver las llaves de integración" }, { status: 403 });
  }

  const llaves = await prisma.apiKey.findMany({
    select: {
      id: true,
      nombre: true,
      prefijo: true,
      activa: true,
      ultimoUsoEn: true,
      expiraEn: true,
      createdAt: true,
      creadoPor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(llaves);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeGestionarIntegraciones(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para crear llaves de integración" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = apiKeyCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const { llave, prefijo } = generarApiKey();
  const llaveHash = await bcrypt.hash(llave, 10);

  const registro = await prisma.apiKey.create({
    data: {
      nombre: parsed.data.nombre,
      prefijo,
      llaveHash,
      expiraEn: parsed.data.expiraEn ?? null,
      creadoPorId: session.user.id,
    },
  });

  await registrarAuditoria({
    entidad: "ApiKey",
    entidadId: registro.id,
    accion: "CREAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { nombre: registro.nombre, prefijo: registro.prefijo },
    ip: obtenerIp(request),
  });

  // La llave completa solo se devuelve una vez, en este momento. No se puede
  // volver a consultar: solo queda su hash en la base de datos.
  return NextResponse.json({ id: registro.id, nombre: registro.nombre, llave }, { status: 201 });
}
