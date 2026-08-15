import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeEliminar } from "@/lib/permisos";
import { Campo, Seleccion } from "@/components/ui/campos";
import PersonasLista from "./PersonasLista";

export const dynamic = "force-dynamic";

const ESTADOS = ["DESAPARECIDA", "BUSQUEDA", "LOCALIZADA", "ILESA", "HERIDA", "ATRAPADA", "TRASLADADA", "FALLECIDA", "ATENDIDA"];

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ estadoPersona?: string; q?: string }>;
}) {
  const { estadoPersona, q } = await searchParams;
  const session = await auth();

  const personas = await prisma.person.findMany({
    where: {
      estadoPersona: estadoPersona ? (estadoPersona as never) : undefined,
      OR: q
        ? [
            { nombreCompleto: { contains: q, mode: "insensitive" } },
            { numeroDocumento: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: { incident: { select: { codigo: true, municipio: true, id: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Personas desaparecidas ({personas.length})</h1>
      <p className="mt-1 text-sm text-muted">
        Personas reportadas como desaparecidas por la ciudadanía. Actualiza el estado a medida que
        avance la búsqueda.
      </p>
      <form className="mt-4 flex flex-col gap-2 sm:flex-row" method="get">
        <Campo name="q" defaultValue={q} placeholder="Buscar por nombre o documento" className="sm:flex-1" />
        <Seleccion name="estadoPersona" defaultValue={estadoPersona ?? ""} className="sm:w-56">
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </Seleccion>
        <button type="submit" className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white sm:w-auto">
          Filtrar
        </button>
      </form>
      <PersonasLista personas={JSON.parse(JSON.stringify(personas))} puedeEliminar={puedeEliminar(session?.user?.role)} />
    </div>
  );
}
