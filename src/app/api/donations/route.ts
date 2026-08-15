import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { donationCreateSchema } from "@/lib/validations";
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

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado");
  const tipoAyuda = searchParams.get("tipoAyuda");

  const donaciones = await prisma.donation.findMany({
    where: {
      estado: estado ? (estado as never) : undefined,
      tipoAyuda: tipoAyuda ? (tipoAyuda as never) : undefined,
    },
    include: { donationPoint: { select: { id: true, codigo: true, nombre: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json(donaciones);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = donationCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const session = await auth();

  if (data.donationPointId) {
    const punto = await prisma.donationPoint.findUnique({ where: { id: data.donationPointId } });
    if (!punto) {
      return NextResponse.json({ error: "Punto de acopio no encontrado" }, { status: 404 });
    }
  }

  // El estado inicial solo lo puede fijar el equipo interno (ej. al registrar en el panel una
  // donación que ya se recogió en sitio); una donación pública siempre entra como "OFRECIDA".
  const puedeFijarEstado = puedeEscribir(session?.user?.role);
  const estadoInicial = puedeFijarEstado ? data.estado : undefined;

  const codigo = await generarCodigo("DON");

  const donacion = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const creada = await tx.donation.create({
      data: {
        codigo,
        donationPointId: data.donationPointId ?? null,
        nombreDonante: data.nombreDonante,
        telefonoDonante: data.telefonoDonante,
        tipoAyuda: data.tipoAyuda,
        descripcion: data.descripcion,
        insumo: data.insumo ?? null,
        cantidad: data.cantidad ?? null,
        unidad: data.unidad ?? null,
        direccion: data.direccion ?? null,
        municipio: data.municipio,
        departamento: data.departamento,
        latitud: data.latitud ?? null,
        longitud: data.longitud ?? null,
        ...(estadoInicial ? { estado: estadoInicial } : {}),
        creadoPorId: session?.user?.id ?? null,
      },
      include: { donationPoint: { select: { id: true, codigo: true, nombre: true } } },
    });

    if (estadoInicial === "RECIBIDA" && creada.donationPointId && creada.insumo && creada.cantidad) {
      await ajustarInventario(tx, creada.donationPointId, creada.insumo, creada.cantidad, creada.unidad);
    }

    return creada;
  });

  await registrarAuditoria({
    entidad: "Donation",
    entidadId: donacion.id,
    accion: "CREAR",
    usuarioId: session?.user?.id,
    usuarioNombre: session?.user?.name,
    cambios: { codigo: donacion.codigo, tipoAyuda: donacion.tipoAyuda },
    ip: obtenerIp(request),
  });

  return NextResponse.json(donacion, { status: 201 });
}
