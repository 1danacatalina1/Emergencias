import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/audit";
import IncidenteDetalle from "./IncidenteDetalle";

export const dynamic = "force-dynamic";

export default async function IncidenteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [session, incident, tipos] = await Promise.all([
    auth(),
    prisma.incident.findUnique({
      where: { id },
      include: {
        incidentType: true,
        personas: { include: { traslados: true }, orderBy: { createdAt: "desc" } },
        traslados: { include: { person: true }, orderBy: { createdAt: "desc" } },
        ayudas: { orderBy: { createdAt: "desc" } },
        adjuntos: true,
        creadoPor: { select: { name: true } },
      },
    }),
    prisma.incidentType.findMany({ where: { activo: true }, orderBy: { orden: "asc" } }),
  ]);

  if (!incident) notFound();

  if (session?.user) {
    await registrarAuditoria({
      entidad: "Incident",
      entidadId: incident.id,
      accion: "VER",
      usuarioId: session.user.id,
      usuarioNombre: session.user.name,
      cambios: { codigo: incident.codigo },
    });
  }

  return <IncidenteDetalle incident={JSON.parse(JSON.stringify(incident))} tipos={tipos.map((t) => ({ id: t.id, nombre: t.nombre }))} />;
}
