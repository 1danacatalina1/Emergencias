import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeVerEquipoDeCampo } from "@/lib/permisos";
import { Tarjeta } from "@/components/ui/campos";
import EquipoMapaPanel from "./EquipoMapaPanel";

export const dynamic = "force-dynamic";

export default async function MapaEquipoPage() {
  const session = await auth();

  if (!puedeVerEquipoDeCampo(session?.user?.role)) {
    return (
      <div>
        <h1 className="text-xl font-bold">Mapa del equipo</h1>
        <Tarjeta className="mt-4 p-4">
          <p className="text-sm text-muted">
            Esta sección está restringida al Administrador y a Coordinadores.
          </p>
        </Tarjeta>
      </div>
    );
  }

  const [roster, seguidos] = await Promise.all([
    prisma.user.findMany({
      where: { active: true, estadoCuenta: "APROBADA" },
      select: {
        id: true,
        name: true,
        telefono: true,
        tipoColaborador: true,
        lugarAccionMunicipio: true,
        lugarAccionDepartamento: true,
        compartirUbicacion: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.seguimientoEquipo.findMany({
      where: { coordinadorId: session!.user.id },
      select: { voluntarioId: true },
    }),
  ]);

  return (
    <div className="flex h-full flex-col">
      <h1 className="text-xl font-bold">Mapa del equipo</h1>
      <p className="mt-1 text-sm text-muted">
        Ubicación en tiempo real de quienes activaron voluntariamente compartir su ubicación, y el
        listado completo de usuarios registrados para conformar equipos de trabajo.
      </p>
      <EquipoMapaPanel
        rosterInicial={JSON.parse(JSON.stringify(roster))}
        seguidosIniciales={seguidos.map((s) => s.voluntarioId)}
      />
    </div>
  );
}
