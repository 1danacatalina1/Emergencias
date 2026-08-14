import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { userUpdateSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeGestionarUsuarios } from "@/lib/permisos";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeGestionarUsuarios(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para editar usuarios" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.user.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (id === session.user.id && parsed.data.role && parsed.data.role !== "ADMIN") {
    return NextResponse.json({ error: "No puedes quitarte a ti mismo el rol de Administrador" }, { status: 400 });
  }
  if (id === session.user.id && parsed.data.active === false) {
    return NextResponse.json({ error: "No puedes desactivar tu propia cuenta" }, { status: 400 });
  }

  const usuario = await prisma.user.update({ where: { id }, data: parsed.data });

  await registrarAuditoria({
    entidad: "User",
    entidadId: usuario.id,
    accion: "ACTUALIZAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: {
      antes: { name: existente.name, role: existente.role, active: existente.active },
      despues: { name: usuario.name, role: usuario.role, active: usuario.active },
    },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ id: usuario.id, name: usuario.name, email: usuario.email, role: usuario.role, active: usuario.active });
}
