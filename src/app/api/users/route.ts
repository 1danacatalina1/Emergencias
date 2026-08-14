import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { userCreateSchema } from "@/lib/validations";
import { generarContrasenaTemporal } from "@/lib/passwords";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeGestionarUsuarios } from "@/lib/permisos";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeGestionarUsuarios(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para ver los usuarios del panel" }, { status: 403 });
  }

  const usuarios = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      totpEnabled: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(usuarios);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeGestionarUsuarios(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para crear usuarios" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existente) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo" }, { status: 400 });
  }

  const contrasenaTemporal = generarContrasenaTemporal();
  const passwordHash = await bcrypt.hash(contrasenaTemporal, 10);

  const usuario = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      passwordHash,
    },
  });

  await registrarAuditoria({
    entidad: "User",
    entidadId: usuario.id,
    accion: "CREAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { nombre: usuario.name, email: usuario.email, role: usuario.role },
    ip: obtenerIp(request),
  });

  return NextResponse.json(
    { id: usuario.id, name: usuario.name, email: usuario.email, role: usuario.role, contrasenaTemporal },
    { status: 201 },
  );
}
