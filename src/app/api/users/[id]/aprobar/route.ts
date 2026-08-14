import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { userAprobarSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeGestionarUsuarios, esAdministrador } from "@/lib/permisos";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeGestionarUsuarios(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para aprobar usuarios" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = userAprobarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.role === "ADMIN" && !esAdministrador(session.user.role)) {
    return NextResponse.json({ error: "Solo el Administrador puede aprobar cuentas como Administrador" }, { status: 403 });
  }

  const existente = await prisma.user.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }
  if (existente.estadoCuenta !== "PENDIENTE") {
    return NextResponse.json({ error: "Esta solicitud ya fue procesada" }, { status: 400 });
  }

  const usuario = await prisma.user.update({
    where: { id },
    data: {
      role: parsed.data.role,
      active: true,
      estadoCuenta: "APROBADA",
      aprobadoPorId: session.user.id,
      aprobadoEn: new Date(),
    },
  });

  await registrarAuditoria({
    entidad: "User",
    entidadId: usuario.id,
    accion: "APROBAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { nombre: usuario.name, email: usuario.email, role: usuario.role },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ id: usuario.id, name: usuario.name, email: usuario.email, role: usuario.role, active: usuario.active, estadoCuenta: usuario.estadoCuenta });
}
