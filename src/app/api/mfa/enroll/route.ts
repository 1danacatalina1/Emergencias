import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generarSecretoTotp, generarUriTotp, generarQrDataUrl } from "@/lib/totp";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const usuario = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }
  if (usuario.totpEnabled) {
    return NextResponse.json({ error: "Ya tienes la verificación en dos pasos activada" }, { status: 400 });
  }

  const secret = generarSecretoTotp();
  await prisma.user.update({ where: { id: usuario.id }, data: { totpSecret: secret } });

  const uri = generarUriTotp(usuario.email, secret);
  const qrDataUrl = await generarQrDataUrl(uri);

  return NextResponse.json({ secret, qrDataUrl });
}
