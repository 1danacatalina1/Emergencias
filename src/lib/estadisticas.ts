import { prisma } from "@/lib/prisma";

export async function obtenerEstadisticas() {
  const [
    totalIncidentes,
    incidentesAbiertos,
    incidentesCriticos,
    totalPersonas,
    personasDesaparecidas,
    personasFallecidas,
    totalTraslados,
    trasladosEnRuta,
    totalAyudas,
    ayudasPendientes,
    porEstado,
    porTipo,
  ] = await prisma.$transaction([
    prisma.incident.count(),
    prisma.incident.count({ where: { estado: { in: ["REPORTADO", "EN_ATENCION", "EN_PROCESO"] } } }),
    prisma.incident.count({ where: { nivelPrioridad: "CRITICA", estado: { notIn: ["RESUELTO", "CERRADO"] } } }),
    prisma.person.count(),
    prisma.person.count({ where: { estadoPersona: { in: ["DESAPARECIDA", "BUSQUEDA"] } } }),
    prisma.person.count({ where: { estadoPersona: "FALLECIDA" } }),
    prisma.transfer.count(),
    prisma.transfer.count({ where: { estadoTraslado: "EN_RUTA" } }),
    prisma.aidRequest.count(),
    prisma.aidRequest.count({ where: { estado: { in: ["SOLICITADA", "EN_PROCESO"] } } }),
    prisma.incident.groupBy({ by: ["estado"], _count: true, orderBy: { estado: "asc" } }),
    prisma.incident.groupBy({ by: ["incidentTypeId"], _count: true, orderBy: { incidentTypeId: "asc" } }),
  ]);

  const tipos = await prisma.incidentType.findMany();
  const porTipoConNombre = porTipo.map((t) => ({
    tipo: tipos.find((ti) => ti.id === t.incidentTypeId)?.nombre ?? "Desconocido",
    total: t._count,
  }));

  return {
    totalIncidentes,
    incidentesAbiertos,
    incidentesCriticos,
    totalPersonas,
    personasDesaparecidas,
    personasFallecidas,
    totalTraslados,
    trasladosEnRuta,
    totalAyudas,
    ayudasPendientes,
    porEstado: porEstado.map((e) => ({ estado: e.estado, total: e._count })),
    porTipo: porTipoConNombre,
  };
}
