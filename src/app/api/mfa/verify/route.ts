import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { totpVerifySchema } from "@/lib/validations";
import { verificarCodigoTotp, generarCodigosRespaldo } from "@/lib/totp";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = totpVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Código inválido", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const usuario = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!usuario || !usuario.totpSecret) {
    return NextResponse.json({ error: "Primero debes generar un código QR" }, { status: 400 });
  }
  if (usuario.totpEnabled) {
    return NextResponse.json({ error: "Ya tienes la verificación en dos pasos activada" }, { status: 400 });
  }

  const valido = await verificarCodigoTotp(usuario.totpSecret, parsed.data.code);
  if (!valido) {
    return NextResponse.json({ error: "El código no es correcto. Revisa la hora de tu dispositivo e inténtalo de nuevo." }, { status: 400 });
  }

  const codigosRespaldo = generarCodigosRespaldo();
  const codigosHash = await Promise.all(codigosRespaldo.map((c) => bcrypt.hash(c, 10)));

  await prisma.user.update({
    where: { id: usuario.id },
    data: { totpEnabled: true, totpBackupCodes: codigosHash },
  });

  await registrarAuditoria({
    entidad: "User",
    entidadId: usuario.id,
    accion: "MFA_ACTIVADA",
    usuarioId: usuario.id,
    usuarioNombre: usuario.name,
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true, codigosRespaldo });
}
