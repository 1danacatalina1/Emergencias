import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Tarjeta, Seleccion, Campo } from "@/components/ui/campos";
import { InsigniaEstado, InsigniaPrioridad } from "@/components/ui/insignias";

export const dynamic = "force-dynamic";

const ESTADOS = ["REPORTADO", "EN_ATENCION", "EN_PROCESO", "RESUELTO", "CERRADO", "DESCARTADO"];

export default async function IncidentesListaPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>;
}) {
  const { estado, q } = await searchParams;

  const incidentes = await prisma.incident.findMany({
    where: {
      estado: estado ? (estado as never) : undefined,
      OR: q
        ? [
            { codigo: { contains: q, mode: "insensitive" } },
            { descripcion: { contains: q, mode: "insensitive" } },
            { municipio: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: { incidentType: true, _count: { select: { personas: true, traslados: true, ayudas: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Incidentes ({incidentes.length})</h1>

      <form className="mt-4 flex flex-col gap-2 sm:flex-row" method="get">
        <Campo name="q" defaultValue={q} placeholder="Buscar por código, descripción o municipio" className="sm:flex-1" />
        <Seleccion name="estado" defaultValue={estado ?? ""} className="sm:w-56">
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </Seleccion>
        <button type="submit" className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white sm:w-auto">
          Filtrar
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-2">
        {incidentes.map((inc) => (
          <Link key={inc.id} href={`/panel/incidentes/${inc.id}`}>
            <Tarjeta className="flex items-center justify-between gap-3 p-3.5 transition hover:border-primary/40">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{inc.incidentType?.nombre} · {inc.municipio}, {inc.departamento}</p>
                <p className="truncate text-xs text-muted">{inc.codigo} — {inc.descripcion}</p>
                <p className="mt-1 text-xs text-muted">
                  {inc._count.personas} personas · {inc._count.traslados} traslados · {inc._count.ayudas} ayudas
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <InsigniaPrioridad prioridad={inc.nivelPrioridad} />
                <InsigniaEstado estado={inc.estado} />
              </div>
            </Tarjeta>
          </Link>
        ))}
        {incidentes.length === 0 && <p className="mt-4 text-sm text-muted">No se encontraron incidentes.</p>}
      </div>
    </div>
  );
}
