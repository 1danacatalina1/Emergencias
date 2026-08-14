import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { envioCreateSchema } from "@/lib/validations";
import { generarCodigo } from "@/lib/codigo";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { puedeEscribir } from "@/lib/permisos";
import { ajustarInventario } from "@/lib/inventario";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const donationPointId = new URL(request.url).searchParams.get("donationPointId");

  const envios = await prisma.envio.findMany({
    where: donationPointId ? { donationPointId } : undefined,
    include: {
      donationPoint: { select: { id: true, codigo: true, nombre: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json(envios);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeEscribir(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para registrar envíos" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = envioCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const punto = await prisma.donationPoint.findUnique({ where: { id: parsed.data.donationPointId } });
  if (!punto) {
    return NextResponse.json({ error: "Punto de acopio no encontrado" }, { status: 404 });
  }

  if (parsed.data.solicitudInsumoId) {
    const solicitud = await prisma.solicitudInsumo.findUnique({ where: { id: parsed.data.solicitudInsumoId } });
    if (!solicitud) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }
    if (solicitud.estado !== "ABIERTA") {
      return NextResponse.json({ error: "Esta solicitud ya fue resuelta o cancelada" }, { status: 400 });
    }
  }

  const codigo = await generarCodigo("ENV");

  const { envio, advertenciasInventario } = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existencias = await tx.inventarioItem.findMany({
      where: { donationPointId: parsed.data.donationPointId, insumo: { in: parsed.data.items.map((i) => i.insumo) } },
    });
    const disponiblePorInsumo = new Map(existencias.map((e) => [e.insumo, e.cantidad]));

    const advertencias: string[] = [];
    for (const item of parsed.data.items) {
      const disponible = disponiblePorInsumo.get(item.insumo) ?? 0;
      if (item.cantidad > disponible) {
        advertencias.push(
          `${item.insumo}: se enviaron ${item.cantidad}${item.unidad ? ` ${item.unidad}` : ""} pero el inventario registrado era de ${disponible}.`,
        );
      }
    }

    const nuevoEnvio = await tx.envio.create({
      data: {
        codigo,
        donationPointId: parsed.data.donationPointId,
        destinatarioNombre: parsed.data.destinatarioNombre,
        destinatarioTelefono: parsed.data.destinatarioTelefono || null,
        destinoLugar: parsed.data.destinoLugar,
        destinoMunicipio: parsed.data.destinoMunicipio || null,
        destinoDepartamento: parsed.data.destinoDepartamento || null,
        responsable: parsed.data.responsable,
        responsableTelefono: parsed.data.responsableTelefono || null,
        vehiculo: parsed.data.vehiculo || null,
        vehiculoPlaca: parsed.data.vehiculoPlaca || null,
        conductorNombre: parsed.data.conductorNombre || null,
        conductorTelefono: parsed.data.conductorTelefono || null,
        notas: parsed.data.notas || null,
        solicitudInsumoId: parsed.data.solicitudInsumoId || null,
        creadoPorId: session.user.id,
        items: {
          create: parsed.data.items.map((item) => ({
            insumo: item.insumo,
            cantidad: item.cantidad,
            unidad: item.unidad || null,
          })),
        },
      },
      include: {
        donationPoint: { select: { id: true, codigo: true, nombre: true } },
        items: true,
      },
    });

    for (const item of parsed.data.items) {
      await ajustarInventario(tx, parsed.data.donationPointId, item.insumo, -item.cantidad, item.unidad);
    }

    if (parsed.data.solicitudInsumoId) {
      await tx.solicitudInsumo.update({
        where: { id: parsed.data.solicitudInsumoId },
        data: { estado: "RESUELTA", resueltaEn: new Date() },
      });
    }

    return { envio: nuevoEnvio, advertenciasInventario: advertencias };
  });

  await registrarAuditoria({
    entidad: "Envio",
    entidadId: envio.id,
    accion: "CREAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { codigo: envio.codigo, destino: envio.destinoLugar, items: envio.items.length, advertenciasInventario },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ...envio, advertenciasInventario }, { status: 201 });
}
