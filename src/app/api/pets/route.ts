import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { petCreateSchema } from "@/lib/validations";
import { generarCodigo } from "@/lib/codigo";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");
  const especie = searchParams.get("especie");
  const municipio = searchParams.get("municipio");
  const soloActivos = searchParams.get("soloActivos") !== "false";

  const mascotas = await prisma.pet.findMany({
    where: {
      estado: soloActivos ? "ACTIVO" : undefined,
      tipo: tipo ? (tipo as never) : undefined,
      especie: especie ? (especie as never) : undefined,
      municipio: municipio ? { equals: municipio, mode: "insensitive" } : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json(mascotas);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = petCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const session = await auth();
  const codigo = await generarCodigo("MAS");

  const mascota = await prisma.pet.create({
    data: {
      codigo,
      tipo: data.tipo,
      especie: data.especie,
      nombre: data.nombre ?? null,
      raza: data.raza ?? null,
      descripcion: data.descripcion,
      fecha: data.fecha ?? new Date(),
      direccion: data.direccion,
      municipio: data.municipio,
      departamento: data.departamento,
      latitud: data.latitud,
      longitud: data.longitud,
      contactoNombre: data.contactoNombre,
      contactoTelefono: data.contactoTelefono,
      fotoUrl: data.fotoUrl ?? null,
      creadoPorId: session?.user?.id ?? null,
    },
  });

  await registrarAuditoria({
    entidad: "Pet",
    entidadId: mascota.id,
    accion: "CREAR",
    usuarioId: session?.user?.id,
    usuarioNombre: session?.user?.name,
    cambios: { codigo: mascota.codigo, tipo: mascota.tipo },
    ip: obtenerIp(request),
  });

  return NextResponse.json(mascota, { status: 201 });
}
