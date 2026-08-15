import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generarContrasenaTemporal } from "@/lib/passwords";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { esAdministrador } from "@/lib/permisos";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!esAdministrador(session.user.role)) {
    return NextResponse.json({ error: "Solo el Administrador puede restablecer contraseñas" }, { status: 403 });
  }

  const { id } = await params;
  const existente = await prisma.user.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const contrasenaTemporal = generarContrasenaTemporal();
  const passwordHash = await bcrypt.hash(contrasenaTemporal, 10);

  await prisma.user.update({ where: { id }, data: { passwordHash } });

  await registrarAuditoria({
    entidad: "User",
    entidadId: id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { accion: "restablecer_contrasena", usuarioAfectado: existente.email },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ contrasenaTemporal });
}
