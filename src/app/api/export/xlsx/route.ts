import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeAuditarYExportar } from "@/lib/permisos";
import { registrarAuditoria, obtenerIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

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
    return NextResponse.json({ error: "Tu rol no tiene permiso para exportar la base de datos" }, { status: 403 });
  }

  const [incidentes, personas, traslados, ayudas, puntosAcopio, donaciones, mascotas] = await prisma.$transaction([
    prisma.incident.findMany({ include: { incidentType: true }, orderBy: { createdAt: "desc" } }),
    prisma.person.findMany({ include: { incident: { select: { codigo: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.transfer.findMany({
      include: { person: { select: { nombreCompleto: true } }, incident: { select: { codigo: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.aidRequest.findMany({ include: { incident: { select: { codigo: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.donationPoint.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.donation.findMany({ include: { donationPoint: { select: { nombre: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.pet.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistema de Gestión de Emergencias";
  workbook.created = new Date();

  const wsIncidentes = workbook.addWorksheet("Incidentes");
  wsIncidentes.columns = [
    { header: "Código", key: "codigo", width: 18 },
    { header: "Tipo", key: "tipo", width: 20 },
    { header: "Subtipo", key: "subtipo", width: 16 },
    { header: "Descripción", key: "descripcion", width: 40 },
    { header: "Dirección", key: "direccion", width: 26 },
    { header: "Municipio", key: "municipio", width: 16 },
    { header: "Departamento", key: "departamento", width: 16 },
    { header: "Latitud", key: "latitud", width: 12 },
    { header: "Longitud", key: "longitud", width: 12 },
    { header: "Prioridad", key: "nivelPrioridad", width: 12 },
    { header: "Estado", key: "estado", width: 14 },
    { header: "Fecha evento", key: "fechaEvento", width: 18 },
    { header: "Fecha reporte", key: "fechaReporte", width: 18 },
  ];
  wsIncidentes.addRows(
    incidentes.map((i) => ({
      codigo: i.codigo,
      tipo: i.incidentType?.nombre,
      subtipo: i.subtipo,
      descripcion: i.descripcion,
      direccion: i.direccion,
      municipio: i.municipio,
      departamento: i.departamento,
      latitud: i.latitud,
      longitud: i.longitud,
      nivelPrioridad: i.nivelPrioridad,
      estado: i.estado,
      fechaEvento: i.fechaEvento,
      fechaReporte: i.fechaReporte,
    })),
  );
  estiloEncabezado(wsIncidentes);

  const wsPersonas = workbook.addWorksheet("Personas");
  wsPersonas.columns = [
    { header: "Código incidente", key: "codigoIncidente", width: 18 },
    { header: "Nombre completo", key: "nombreCompleto", width: 28 },
    { header: "Tipo documento", key: "tipoDocumento", width: 14 },
    { header: "Número documento", key: "numeroDocumento", width: 16 },
    { header: "Edad", key: "edad", width: 8 },
    { header: "Sexo", key: "sexo", width: 12 },
    { header: "Teléfono", key: "telefono", width: 14 },
    { header: "Estado", key: "estadoPersona", width: 14 },
    { header: "Condición de salud", key: "condicionSalud", width: 24 },
    { header: "Descripción física", key: "descripcionFisica", width: 30 },
    { header: "Contacto", key: "contactoNombre", width: 20 },
    { header: "Tel. contacto", key: "contactoTelefono", width: 14 },
    { header: "Parentesco contacto", key: "contactoParentesco", width: 16 },
  ];
  wsPersonas.addRows(
    personas.map((p) => ({
      codigoIncidente: p.incident?.codigo,
      nombreCompleto: p.nombreCompleto,
      tipoDocumento: p.tipoDocumento,
      numeroDocumento: p.numeroDocumento,
      edad: p.edad,
      sexo: p.sexo,
      telefono: p.telefono,
      estadoPersona: p.estadoPersona,
      condicionSalud: p.condicionSalud,
      descripcionFisica: p.descripcionFisica,
      contactoNombre: p.contactoNombre,
      contactoTelefono: p.contactoTelefono,
      contactoParentesco: p.contactoParentesco,
    })),
  );
  estiloEncabezado(wsPersonas);

  const wsTraslados = workbook.addWorksheet("Traslados");
  wsTraslados.columns = [
    { header: "Código incidente", key: "codigoIncidente", width: 18 },
    { header: "Persona", key: "persona", width: 26 },
    { header: "Centro médico", key: "centroMedico", width: 24 },
    { header: "Tipo traslado", key: "tipoTraslado", width: 18 },
    { header: "Motivo", key: "motivo", width: 30 },
    { header: "Estado", key: "estadoTraslado", width: 18 },
    { header: "Fecha traslado", key: "fechaTraslado", width: 18 },
    { header: "Vehículo/Placa", key: "vehiculoPlaca", width: 14 },
    { header: "Responsable", key: "responsable", width: 20 },
  ];
  wsTraslados.addRows(
    traslados.map((t) => ({
      codigoIncidente: t.incident?.codigo,
      persona: t.person?.nombreCompleto,
      centroMedico: t.centroMedico,
      tipoTraslado: t.tipoTraslado,
      motivo: t.motivo,
      estadoTraslado: t.estadoTraslado,
      fechaTraslado: t.fechaTraslado,
      vehiculoPlaca: t.vehiculoPlaca,
      responsable: t.responsable,
    })),
  );
  estiloEncabezado(wsTraslados);

  const wsAyudas = workbook.addWorksheet("Ayudas humanitarias");
  wsAyudas.columns = [
    { header: "Código", key: "codigo", width: 16 },
    { header: "Código incidente", key: "codigoIncidente", width: 18 },
    { header: "Solicitante", key: "nombreSolicitante", width: 24 },
    { header: "Teléfono", key: "telefonoSolicitante", width: 14 },
    { header: "Tipo de ayuda", key: "tipoAyuda", width: 20 },
    { header: "Descripción", key: "descripcion", width: 34 },
    { header: "Personas", key: "cantidadPersonas", width: 10 },
    { header: "Municipio", key: "municipio", width: 16 },
    { header: "Departamento", key: "departamento", width: 16 },
    { header: "Prioridad", key: "prioridad", width: 12 },
    { header: "Estado", key: "estado", width: 14 },
  ];
  wsAyudas.addRows(
    ayudas.map((a) => ({
      codigo: a.codigo,
      codigoIncidente: a.incident?.codigo,
      nombreSolicitante: a.nombreSolicitante,
      telefonoSolicitante: a.telefonoSolicitante,
      tipoAyuda: a.tipoAyuda,
      descripcion: a.descripcion,
      cantidadPersonas: a.cantidadPersonas,
      municipio: a.municipio,
      departamento: a.departamento,
      prioridad: a.prioridad,
      estado: a.estado,
    })),
  );
  estiloEncabezado(wsAyudas);

  const wsPuntos = workbook.addWorksheet("Puntos de acopio");
  wsPuntos.columns = [
    { header: "Código", key: "codigo", width: 16 },
    { header: "Nombre", key: "nombre", width: 26 },
    { header: "Tipos aceptados", key: "tiposAceptados", width: 34 },
    { header: "Dirección", key: "direccion", width: 26 },
    { header: "Municipio", key: "municipio", width: 16 },
    { header: "Departamento", key: "departamento", width: 16 },
    { header: "Responsable", key: "responsable", width: 20 },
    { header: "Teléfono", key: "telefonoContacto", width: 14 },
    { header: "Horario", key: "horario", width: 18 },
    { header: "Estado", key: "estado", width: 12 },
  ];
  wsPuntos.addRows(
    puntosAcopio.map((p) => ({
      codigo: p.codigo,
      nombre: p.nombre,
      tiposAceptados: p.tiposAceptados.join(", "),
      direccion: p.direccion,
      municipio: p.municipio,
      departamento: p.departamento,
      responsable: p.responsable,
      telefonoContacto: p.telefonoContacto,
      horario: p.horario,
      estado: p.estado,
    })),
  );
  estiloEncabezado(wsPuntos);

  const wsDonaciones = workbook.addWorksheet("Donaciones");
  wsDonaciones.columns = [
    { header: "Código", key: "codigo", width: 16 },
    { header: "Donante", key: "nombreDonante", width: 24 },
    { header: "Teléfono", key: "telefonoDonante", width: 14 },
    { header: "Tipo de ayuda", key: "tipoAyuda", width: 20 },
    { header: "Descripción", key: "descripcion", width: 34 },
    { header: "Punto de acopio", key: "puntoAcopio", width: 24 },
    { header: "Municipio", key: "municipio", width: 16 },
    { header: "Departamento", key: "departamento", width: 16 },
    { header: "Estado", key: "estado", width: 14 },
  ];
  wsDonaciones.addRows(
    donaciones.map((d) => ({
      codigo: d.codigo,
      nombreDonante: d.nombreDonante,
      telefonoDonante: d.telefonoDonante,
      tipoAyuda: d.tipoAyuda,
      descripcion: d.descripcion,
      puntoAcopio: d.donationPoint?.nombre,
      municipio: d.municipio,
      departamento: d.departamento,
      estado: d.estado,
    })),
  );
  estiloEncabezado(wsDonaciones);

  const wsMascotas = workbook.addWorksheet("Mascotas");
  wsMascotas.columns = [
    { header: "Código", key: "codigo", width: 16 },
    { header: "Tipo", key: "tipo", width: 12 },
    { header: "Especie", key: "especie", width: 10 },
    { header: "Nombre", key: "nombre", width: 16 },
    { header: "Raza", key: "raza", width: 16 },
    { header: "Descripción", key: "descripcion", width: 34 },
    { header: "Dirección", key: "direccion", width: 24 },
    { header: "Municipio", key: "municipio", width: 16 },
    { header: "Departamento", key: "departamento", width: 16 },
    { header: "Contacto", key: "contactoNombre", width: 20 },
    { header: "Tel. contacto", key: "contactoTelefono", width: 14 },
    { header: "Estado", key: "estado", width: 14 },
  ];
  wsMascotas.addRows(
    mascotas.map((m) => ({
      codigo: m.codigo,
      tipo: m.tipo,
      especie: m.especie,
      nombre: m.nombre,
      raza: m.raza,
      descripcion: m.descripcion,
      direccion: m.direccion,
      municipio: m.municipio,
      departamento: m.departamento,
      contactoNombre: m.contactoNombre,
      contactoTelefono: m.contactoTelefono,
      estado: m.estado,
    })),
  );
  estiloEncabezado(wsMascotas);

  const buffer = await workbook.xlsx.writeBuffer();
  const fecha = new Date().toISOString().slice(0, 10);

  await registrarAuditoria({
    entidad: "Export",
    entidadId: fecha,
    accion: "EXPORTAR",
    usuarioId: session.user.id,
    usuarioNombre: session.user.name,
    cambios: {
      registros: {
        incidentes: incidentes.length,
        personas: personas.length,
        traslados: traslados.length,
        ayudas: ayudas.length,
        puntosAcopio: puntosAcopio.length,
        donaciones: donaciones.length,
        mascotas: mascotas.length,
      },
    },
    ip: obtenerIp(request),
  });

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="emergencias-${fecha}.xlsx"`,
    },
  });
}
