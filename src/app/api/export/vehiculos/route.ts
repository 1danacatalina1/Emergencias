import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeAuditarYExportar } from "@/lib/permisos";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";
import { TIPOS_VEHICULO, ESTADOS_VEHICULO } from "@/lib/catalogos";

export const dynamic = "force-dynamic";

function etiqueta(lista: readonly { value: string; label: string }[], value: string) {
  return lista.find((o) => o.value === value)?.label ?? value;
}

function estiloEncabezado(ws: ExcelJS.Worksheet) {
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeAuditarYExportar(session.user.role)) {
    return NextResponse.json({ error: "Tu rol no tiene permiso para exportar vehículos" }, { status: 403 });
  }

  const vehiculos = await prisma.vehiculo.findMany({
    include: {
      registradoPor: { select: { name: true } },
      conductores: { include: { usuario: { select: { name: true, telefono: true } } } },
      pasajeros: { include: { usuario: { select: { name: true, telefono: true } } } },
      necesidades: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistema de Gestión de Emergencias";
  workbook.created = new Date();

  const wsVehiculos = workbook.addWorksheet("Vehículos");
  wsVehiculos.columns = [
    { header: "Placa", key: "placa", width: 14 },
    { header: "Tipo", key: "tipo", width: 18 },
    { header: "Marca / modelo", key: "marcaModelo", width: 24 },
    { header: "Estado", key: "estado", width: 16 },
    { header: "Capacidad personas", key: "capacidadPersonas", width: 16 },
    { header: "Capacidad de carga", key: "capacidadCarga", width: 24 },
    { header: "Para personas", key: "paraPersonas", width: 14 },
    { header: "Para insumos", key: "paraInsumos", width: 14 },
    { header: "Ruta nacional", key: "cubreRutaNacional", width: 14 },
    { header: "Ruta urbana", key: "cubreRutaUrbana", width: 14 },
    { header: "Rutas específicas", key: "rutasCubiertas", width: 30 },
    { header: "Municipio base", key: "municipioBase", width: 18 },
    { header: "Departamento base", key: "departamentoBase", width: 18 },
    { header: "Conductores autorizados", key: "conductores", width: 40 },
    { header: "Grupo que traslada", key: "pasajeros", width: 40 },
    { header: "Necesidades económicas pendientes", key: "necesidadesPendientes", width: 40 },
    { header: "Registrado por", key: "registradoPor", width: 22 },
    { header: "Observaciones", key: "observaciones", width: 34 },
    { header: "Registrado", key: "createdAt", width: 18 },
  ];
  wsVehiculos.addRows(
    vehiculos.map((v) => ({
      placa: v.placa,
      tipo: etiqueta(TIPOS_VEHICULO, v.tipo),
      marcaModelo: v.marcaModelo ?? "",
      estado: etiqueta(ESTADOS_VEHICULO, v.estado),
      capacidadPersonas: v.capacidadPersonas ?? "",
      capacidadCarga: v.capacidadCargaDescripcion ?? "",
      paraPersonas: v.paraPersonas ? "Sí" : "No",
      paraInsumos: v.paraInsumos ? "Sí" : "No",
      cubreRutaNacional: v.cubreRutaNacional ? "Sí" : "No",
      cubreRutaUrbana: v.cubreRutaUrbana ? "Sí" : "No",
      rutasCubiertas: v.rutasCubiertas ?? "",
      municipioBase: v.municipioBase ?? "",
      departamentoBase: v.departamentoBase ?? "",
      conductores: v.conductores.map((c) => `${c.usuario.name}${c.cedula ? ` (C.C. ${c.cedula})` : ""}`).join("; "),
      pasajeros: v.pasajeros.map((p) => `${p.usuario.name}${p.usuario.telefono ? ` (${p.usuario.telefono})` : ""}`).join("; "),
      necesidadesPendientes: v.necesidades
        .filter((n) => n.estado === "PENDIENTE")
        .map((n) => `${n.concepto}${n.montoEstimado ? ` ($${n.montoEstimado.toLocaleString("es-CO")})` : ""}`)
        .join("; "),
      registradoPor: v.registradoPor?.name ?? "",
      observaciones: v.observaciones ?? "",
      createdAt: v.createdAt,
    })),
  );
  estiloEncabezado(wsVehiculos);

  const wsConductores = workbook.addWorksheet("Conductores");
  wsConductores.columns = [
    { header: "Placa", key: "placa", width: 14 },
    { header: "Tipo de vehículo", key: "tipo", width: 18 },
    { header: "Conductor", key: "conductor", width: 28 },
    { header: "Cédula", key: "cedula", width: 18 },
    { header: "Teléfono", key: "telefono", width: 16 },
  ];
  wsConductores.addRows(
    vehiculos.flatMap((v) =>
      v.conductores.map((c) => ({
        placa: v.placa,
        tipo: etiqueta(TIPOS_VEHICULO, v.tipo),
        conductor: c.usuario.name,
        cedula: c.cedula ?? "Sin registrar",
        telefono: c.usuario.telefono ?? "",
      })),
    ),
  );
  estiloEncabezado(wsConductores);

  const wsNecesidades = workbook.addWorksheet("Necesidades económicas");
  wsNecesidades.columns = [
    { header: "Placa", key: "placa", width: 14 },
    { header: "Concepto", key: "concepto", width: 26 },
    { header: "Monto estimado", key: "montoEstimado", width: 18 },
    { header: "Descripción", key: "descripcion", width: 40 },
    { header: "Estado", key: "estado", width: 14 },
    { header: "Registrada", key: "createdAt", width: 18 },
  ];
  wsNecesidades.addRows(
    vehiculos.flatMap((v) =>
      v.necesidades.map((n) => ({
        placa: v.placa,
        concepto: n.concepto,
        montoEstimado: n.montoEstimado ?? "",
        descripcion: n.descripcion ?? "",
        estado: n.estado === "CUBIERTA" ? "Cubierta" : "Pendiente",
        createdAt: n.createdAt,
      })),
    ),
  );
  estiloEncabezado(wsNecesidades);

  const buffer = await workbook.xlsx.writeBuffer();
  const fecha = new Date().toISOString().slice(0, 10);

  await registrarAuditoria({
    entidad: "Export",
    entidadId: `vehiculos-${fecha}`,
    accion: "EXPORTAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: { registros: vehiculos.length },
    ip: obtenerIp(request),
  });

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="vehiculos-${fecha}.xlsx"`,
    },
  });
}
