import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import IncidenteDetalle from "./IncidenteDetalle";

export const dynamic = "force-dynamic";

export default async function IncidenteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [incident, tipos] = await Promise.all([
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

  return <IncidenteDetalle incident={JSON.parse(JSON.stringify(incident))} tipos={tipos.map((t) => ({ id: t.id, nombre: t.nombre }))} />;
}
