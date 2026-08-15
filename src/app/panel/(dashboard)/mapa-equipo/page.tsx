import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeVerMapaYProfesionales } from "@/lib/permisos";
import { Tarjeta } from "@/components/ui/campos";
import EquipoMapaPanel from "./EquipoMapaPanel";

export const dynamic = "force-dynamic";

export default async function MapaEquipoPage() {
  const session = await auth();

  if (!puedeVerMapaYProfesionales(session?.user?.role)) {
    return (
      <div>
        <h1 className="text-xl font-bold">Mapa del equipo</h1>
        <Tarjeta className="mt-4 p-4">
          <p className="text-sm text-muted">
            Esta sección está restringida a cuentas aprobadas del panel.
          </p>
        </Tarjeta>
      </div>
    );
  }

  const [roster, seguidos, coordinadores, misSolicitudes] = await Promise.all([
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
      where: { coordinadorId: session!.user.id, estado: "ACEPTADO" },
      select: { voluntarioId: true },
    }),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "COORDINADOR"] }, active: true, estadoCuenta: "APROBADA" },
      select: { id: true, name: true, telefono: true, tipoColaborador: true },
      orderBy: { name: "asc" },
    }),
    prisma.seguimientoEquipo.findMany({
      where: { voluntarioId: session!.user.id },
      select: { coordinadorId: true, estado: true },
    }),
  ]);

  return (
    <div className="flex h-full flex-col">
      <h1 className="text-xl font-bold">Mapa del equipo</h1>
      <p className="mt-1 text-sm text-muted">
        Ubicación en tiempo real de quienes activaron voluntariamente compartir su ubicación, el
        listado completo de usuarios registrados, y los coordinadores a quienes puedes solicitar
        unirte.
      </p>
      <EquipoMapaPanel
        rosterInicial={JSON.parse(JSON.stringify(roster))}
        seguidosIniciales={seguidos.map((s) => s.voluntarioId)}
        coordinadores={coordinadores}
        misSolicitudesIniciales={misSolicitudes.map((s) => ({ coordinadorId: s.coordinadorId, estado: s.estado }))}
        usuarioActualId={session!.user.id}
        rolActual={session!.user.role}
      />
    </div>
  );
}
