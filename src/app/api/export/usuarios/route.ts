import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeGestionarUsuarios } from "@/lib/permisos";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { TIPOS_COLABORADOR } from "@/lib/catalogos";

export const dynamic = "force-dynamic";

function etiquetaColaborador(tipo: string | null) {
  return TIPOS_COLABORADOR.find((t) => t.value === tipo)?.label ?? tipo ?? "";
}

const ETIQUETAS_ROL: Record<string, string> = {
  ADMIN: "Administrador",
  COORDINADOR: "Coordinador",
  OPERADOR: "Voluntario",
  CONSULTA: "Consulta",
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeGestionarUsuarios(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para exportar usuarios" }, { status: 403 });
  }

  const coordinadorId = new URL(request.url).searchParams.get("coordinadorId");

  let idsPermitidos: string[] | undefined;
  let nombreCoordinador: string | null = null;
  if (coordinadorId) {
    const [seguidos, coordinador] = await Promise.all([
      prisma.seguimientoEquipo.findMany({ where: { coordinadorId }, select: { voluntarioId: true } }),
      prisma.user.findUnique({ where: { id: coordinadorId }, select: { name: true } }),
    ]);
    idsPermitidos = seguidos.map((s) => s.voluntarioId);
    nombreCoordinador = coordinador?.name ?? null;
  }

  const usuarios = await prisma.user.findMany({
    where: idsPermitidos ? { id: { in: idsPermitidos } } : undefined,
    orderBy: { name: "asc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistema de Gestión de Emergencias";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Usuarios");
  ws.columns = [
    { header: "Nombre", key: "name", width: 28 },
    { header: "Correo", key: "email", width: 28 },
    { header: "Teléfono", key: "telefono", width: 16 },
    { header: "Rol", key: "role", width: 16 },
    { header: "Tipo de colaborador", key: "tipoColaborador", width: 28 },
    { header: "Estado de la cuenta", key: "estadoCuenta", width: 16 },
    { header: "Activa", key: "active", width: 10 },
    { header: "Dirección física", key: "direccionFisica", width: 30 },
    { header: "Contacto de emergencia", key: "contactoEmergenciaNombre", width: 24 },
    { header: "Teléfono contacto emergencia", key: "contactoEmergenciaTelefono", width: 20 },
    { header: "Lugar de acción - dirección", key: "lugarAccionDireccion", width: 28 },
    { header: "Lugar de acción - municipio", key: "lugarAccionMunicipio", width: 20 },
    { header: "Lugar de acción - departamento", key: "lugarAccionDepartamento", width: 20 },
    { header: "Disponibilidad de tiempo", key: "disponibilidadTiempo", width: 26 },
    { header: "¿Puede desplazarse?", key: "disponibilidadDesplazamiento", width: 16 },
    { header: "Zonas de desplazamiento", key: "zonasDesplazamiento", width: 30 },
    { header: "Experticia", key: "experticia", width: 34 },
    { header: "Cómo puede ayudar", key: "comoPuedeAyudar", width: 34 },
    { header: "Compartiendo ubicación", key: "compartirUbicacion", width: 16 },
    { header: "Registrado", key: "createdAt", width: 18 },
  ];
  ws.addRows(
    usuarios.map((u) => ({
      name: u.name,
      email: u.email,
      telefono: u.telefono ?? "",
      role: ETIQUETAS_ROL[u.role] ?? u.role,
      tipoColaborador: etiquetaColaborador(u.tipoColaborador),
      estadoCuenta: u.estadoCuenta,
      active: u.active ? "Sí" : "No",
      direccionFisica: u.direccionFisica ?? "",
      contactoEmergenciaNombre: u.contactoEmergenciaNombre ?? "",
      contactoEmergenciaTelefono: u.contactoEmergenciaTelefono ?? "",
      lugarAccionDireccion: u.lugarAccionDireccion ?? "",
      lugarAccionMunicipio: u.lugarAccionMunicipio ?? "",
      lugarAccionDepartamento: u.lugarAccionDepartamento ?? "",
      disponibilidadTiempo: u.disponibilidadTiempo ?? "",
      disponibilidadDesplazamiento: u.disponibilidadDesplazamiento == null ? "" : u.disponibilidadDesplazamiento ? "Sí" : "No",
      zonasDesplazamiento: u.zonasDesplazamiento ?? "",
      experticia: u.experticia ?? "",
      comoPuedeAyudar: u.comoPuedeAyudar ?? "",
      compartirUbicacion: u.compartirUbicacion ? "Sí" : "No",
      createdAt: u.createdAt,
    })),
  );
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
  ws.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const fecha = new Date().toISOString().slice(0, 10);

  await registrarAuditoria({
    entidad: "Export",
    entidadId: `usuarios-${fecha}`,
    accion: "EXPORTAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { registros: usuarios.length, filtroCoordinador: nombreCoordinador },
    ip: obtenerIp(request),
  });

  const sufijo = nombreCoordinador ? `-equipo-${nombreCoordinador.replace(/\s+/g, "_")}` : "";
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="usuarios${sufijo}-${fecha}.xlsx"`,
    },
  });
}
