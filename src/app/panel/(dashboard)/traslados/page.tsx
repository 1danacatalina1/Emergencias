import { prisma } from "@/lib/prisma";
import { Seleccion } from "@/components/ui/campos";
import TrasladosLista from "./TrasladosLista";

export const dynamic = "force-dynamic";

const ESTADOS = ["SOLICITADO", "EN_RUTA", "TRASLADADO", "ATENDIDO_EN_CENTRO", "CANCELADO"];

export default async function TrasladosPage({
  searchParams,
}: {
  searchParams: Promise<{ estadoTraslado?: string }>;
}) {
  const { estadoTraslado } = await searchParams;

  const traslados = await prisma.transfer.findMany({
    where: { estadoTraslado: estadoTraslado ? (estadoTraslado as never) : undefined },
    include: { person: true, incident: { select: { id: true, codigo: true, municipio: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Traslados ({traslados.length})</h1>
      <form className="mt-4 flex flex-col gap-2 sm:flex-row" method="get">
        <Seleccion name="estadoTraslado" defaultValue={estadoTraslado ?? ""} className="sm:flex-1">
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </Seleccion>
        <button type="submit" className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white sm:w-auto">
          Filtrar
        </button>
      </form>
      <TrasladosLista traslados={JSON.parse(JSON.stringify(traslados))} />
    </div>
  );
}
