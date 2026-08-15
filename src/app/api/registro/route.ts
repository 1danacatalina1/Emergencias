import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { userSelfRegisterSchema } from "@/lib/validations";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = userSelfRegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const usuario = await prisma.user.create({
    data: {
      name: data.name,
      email,
      passwordHash,
      role: "CONSULTA",
      active: false,
      estadoCuenta: "PENDIENTE",
      tipoColaborador: data.tipoColaborador,
      telefono: data.telefono,
      direccionFisica: data.direccionFisica,
      contactoEmergenciaNombre: data.contactoEmergenciaNombre,
      contactoEmergenciaTelefono: data.contactoEmergenciaTelefono,
      lugarAccionDireccion: data.lugarAccionDireccion,
      lugarAccionMunicipio: data.lugarAccionMunicipio,
      lugarAccionDepartamento: data.lugarAccionDepartamento,
      lugarAccionLat: data.lugarAccionLat,
      lugarAccionLng: data.lugarAccionLng,
      disponibilidadTiempo: data.disponibilidadTiempo || null,
      disponibilidadDesplazamiento: data.disponibilidadDesplazamiento ?? null,
      zonasDesplazamiento: data.zonasDesplazamiento || null,
      experticia: data.experticia || null,
      comoPuedeAyudar: data.comoPuedeAyudar || null,
    },
  });

  await registrarAuditoria({
    entidad: "User",
    entidadId: usuario.id,
    accion: "CREAR",
    cambios: { nombre: usuario.name, email: usuario.email, tipoColaborador: usuario.tipoColaborador, autoregistro: true },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
