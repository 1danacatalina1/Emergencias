import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { alertaSOSCreateSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeVerEquipoDeCampo } from "@/lib/permisos";
import { enviarCorreo } from "@/lib/email";

export const dynamic = "force-dynamic";

const ETIQUETAS_TIPO: Record<string, string> = {
  PERSONAL: "Auxilio para sí mismo",
  LABOR: "Auxilio por la labor que está realizando",
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeVerEquipoDeCampo(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para ver las alertas SOS" }, { status: 403 });
  }

  const soloActivas = new URL(request.url).searchParams.get("estado") === "ACTIVA";

  const alertas = await prisma.alertaSOS.findMany({
    where: soloActivas ? { estado: "ACTIVA" } : undefined,
    include: {
      autor: { select: { id: true, name: true, telefono: true, tipoColaborador: true } },
      atendidaPor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(alertas);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = alertaSOSCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const alerta = await prisma.alertaSOS.create({
    data: {
      tipo: parsed.data.tipo,
      nota: parsed.data.nota || null,
      latitud: parsed.data.latitud ?? null,
      longitud: parsed.data.longitud ?? null,
      autorId: session.user.id,
    },
    include: {
      autor: { select: { id: true, name: true, telefono: true, tipoColaborador: true } },
      atendidaPor: { select: { id: true, name: true } },
    },
  });

  const destinatarios = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "COORDINADOR"] },
      active: true,
      id: { not: session.user.id },
    },
    select: { email: true },
  });

  const enlaceMapa =
    parsed.data.latitud != null && parsed.data.longitud != null
      ? `https://www.openstreetmap.org/?mlat=${parsed.data.latitud}&mlon=${parsed.data.longitud}#map=16/${parsed.data.latitud}/${parsed.data.longitud}`
      : null;

  const correoEnviado = await enviarCorreo({
    destinatarios: destinatarios.map((d) => d.email),
    asunto: `🆘 Alerta SOS de ${alerta.autor.name}`,
    html: `
      <h2>🆘 Alerta SOS</h2>
      <p><strong>${alerta.autor.name}</strong> activó el botón de emergencia en el panel.</p>
      <p><strong>Tipo:</strong> ${ETIQUETAS_TIPO[alerta.tipo] ?? alerta.tipo}</p>
      ${alerta.nota ? `<p><strong>Nota:</strong> ${alerta.nota}</p>` : ""}
      ${alerta.autor.telefono ? `<p><strong>Teléfono:</strong> ${alerta.autor.telefono}</p>` : ""}
      ${enlaceMapa ? `<p><a href="${enlaceMapa}">Ver ubicación en el mapa</a></p>` : "<p>No se pudo capturar su ubicación en el momento de la alerta.</p>"}
      <p>Ingresa al panel de gestión para más detalles y para marcarla como atendida.</p>
    `,
  });

  if (correoEnviado) {
    await prisma.alertaSOS.update({ where: { id: alerta.id }, data: { correoEnviado: true } });
  }

  await registrarAuditoria({
    entidad: "AlertaSOS",
    entidadId: alerta.id,
    accion: "CREAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { tipo: alerta.tipo, correoEnviado },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ...alerta, correoEnviado }, { status: 201 });
}
