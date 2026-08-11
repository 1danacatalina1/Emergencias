import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { totpDisableSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = totpDisableSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const usuario = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const valido = await bcrypt.compare(parsed.data.password, usuario.passwordHash);
  if (!valido) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: usuario.id },
    data: { totpEnabled: false, totpSecret: null, totpBackupCodes: [] },
  });

  await registrarAuditoria({
    entidad: "User",
    entidadId: usuario.id,
    accion: "MFA_DESACTIVADA",
    usuarioId: usuario.id,
    usuarioNombre: usuario.name,
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true });
}
