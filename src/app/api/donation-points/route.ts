import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { donationPointCreateSchema } from "@/lib/validations";
import { generarCodigo } from "@/lib/codigo";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const municipio = searchParams.get("municipio");
  const tipoAyuda = searchParams.get("tipoAyuda");
  const soloActivos = searchParams.get("soloActivos") !== "false";

  const puntos = await prisma.donationPoint.findMany({
    where: {
      estado: soloActivos ? "ACTIVO" : undefined,
      municipio: municipio ? { equals: municipio, mode: "insensitive" } : undefined,
      tiposAceptados: tipoAyuda ? { has: tipoAyuda as never } : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json(puntos);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = donationPointCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const session = await auth();
  const codigo = await generarCodigo("PA");

  const punto = await prisma.donationPoint.create({
    data: {
      codigo,
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      tiposAceptados: data.tiposAceptados,
      direccion: data.direccion,
      municipio: data.municipio,
      departamento: data.departamento,
      latitud: data.latitud,
      longitud: data.longitud,
      responsable: data.responsable ?? null,
      telefonoContacto: data.telefonoContacto,
      horario: data.horario ?? null,
      creadoPorId: session?.user?.id ?? null,
    },
  });

  await registrarAuditoria({
    entidad: "DonationPoint",
    entidadId: punto.id,
    accion: "CREAR",
    usuarioId: session?.user?.id,
    usuarioNombre: session?.user?.name,
    cambios: { codigo: punto.codigo, nombre: punto.nombre },
    ip: obtenerIp(request),
  });

  return NextResponse.json(punto, { status: 201 });
}
