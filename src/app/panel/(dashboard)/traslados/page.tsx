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
      <form className="mt-4" method="get">
        <Seleccion name="estadoTraslado" defaultValue={estadoTraslado ?? ""} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </Seleccion>
      </form>
      <TrasladosLista traslados={JSON.parse(JSON.stringify(traslados))} />
    </div>
  );
}
