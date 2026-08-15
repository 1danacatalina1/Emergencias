import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeEliminar } from "@/lib/permisos";
import { Seleccion } from "@/components/ui/campos";
import AyudasLista from "./AyudasLista";

export const dynamic = "force-dynamic";

const ESTADOS = ["SOLICITADA", "EN_PROCESO", "ENTREGADA", "CANCELADA"];

export default async function AyudasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const session = await auth();

  const ayudas = await prisma.aidRequest.findMany({
    where: { estado: estado ? (estado as never) : undefined },
    include: { incident: { select: { id: true, codigo: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Solicitudes de ayuda ({ayudas.length})</h1>
      <p className="mt-1 text-sm text-muted">
        Solicitudes de ayuda humanitaria hechas por la ciudadanía: alimentos, agua, refugio,
        medicamentos y otras necesidades.
      </p>
      <form className="mt-4 flex flex-col gap-2 sm:flex-row" method="get">
        <Seleccion name="estado" defaultValue={estado ?? ""} className="sm:flex-1">
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </Seleccion>
        <button type="submit" className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white sm:w-auto">
          Filtrar
        </button>
      </form>
      <AyudasLista ayudas={JSON.parse(JSON.stringify(ayudas))} puedeEliminar={puedeEliminar(session?.user?.role)} />
    </div>
  );
}
