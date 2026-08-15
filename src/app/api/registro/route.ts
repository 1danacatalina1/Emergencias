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

  let vehiculo = null;
  if (data.vehiculo) {
    const v = data.vehiculo;
    const yaExiste = await prisma.vehiculo.findUnique({ where: { placa: v.placa.toUpperCase() } });
    if (!yaExiste) {
      vehiculo = await prisma.vehiculo.create({
        data: {
          placa: v.placa.toUpperCase(),
          tipo: v.tipo,
          marcaModelo: v.marcaModelo ?? null,
          capacidadPersonas: v.capacidadPersonas ?? null,
          capacidadCargaDescripcion: v.capacidadCargaDescripcion ?? null,
          paraPersonas: v.paraPersonas,
          paraInsumos: v.paraInsumos,
          cubreRutaNacional: v.cubreRutaNacional,
          cubreRutaUrbana: v.cubreRutaUrbana,
          rutasCubiertas: v.rutasCubiertas ?? null,
          municipioBase: data.lugarAccionMunicipio,
          departamentoBase: data.lugarAccionDepartamento,
          registradoPorId: usuario.id,
          conductores: {
            create: { usuarioId: usuario.id, cedula: v.cedulaConductor },
          },
        },
      });
    }
  }

  await registrarAuditoria({
    entidad: "User",
    entidadId: usuario.id,
    accion: "CREAR",
    cambios: {
      nombre: usuario.name,
      email: usuario.email,
      tipoColaborador: usuario.tipoColaborador,
      autoregistro: true,
      vehiculo: vehiculo ? vehiculo.placa : undefined,
    },
    ip: obtenerIp(request),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
