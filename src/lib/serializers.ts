import type { Incident, IncidentType } from "@/generated/prisma/client";

type IncidentConMarca = Incident & { incidentType?: IncidentType };

/** Vista pública para el mapa y listados sin autenticar: sin datos de contacto del reportero. */
export function serializarIncidentPublico(incident: IncidentConMarca) {
  return {
    id: incident.id,
    codigo: incident.codigo,
    tipo: incident.incidentType?.nombre ?? null,
    subtipo: incident.subtipo,
    descripcion: incident.descripcion,
    direccion: incident.direccion,
    municipio: incident.municipio,
    departamento: incident.departamento,
    latitud: incident.latitud,
    longitud: incident.longitud,
    nivelPrioridad: incident.nivelPrioridad,
    estado: incident.estado,
    fechaEvento: incident.fechaEvento,
    fechaReporte: incident.fechaReporte,
  };
}
