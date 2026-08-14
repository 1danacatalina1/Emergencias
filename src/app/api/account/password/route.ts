import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { passwordChangeSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = passwordChangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const usuario = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const valido = await bcrypt.compare(parsed.data.passwordActual, usuario.passwordHash);
  if (!valido) {
    return NextResponse.json({ error: "La contraseña actual no es correcta" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.passwordNueva, 10);
  await prisma.user.update({ where: { id: usuario.id }, data: { passwordHash } });

  await registrarAuditoria({
    entidad: "User",
    entidadId: usuario.id,
    accion: "ACTUALIZAR",
    usuarioId: usuario.id,
    usuarioNombre: usuario.name,
    cambios: { accion: "cambio_de_contrasena_propia" },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true });
}
