import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeVerEquipoDeCampo } from "@/lib/permisos";
import { TIPOS_COLABORADOR_ORGANIZACION } from "@/lib/catalogos";
import { Tarjeta } from "@/components/ui/campos";
import ProfesionalesLista from "./ProfesionalesLista";

export const dynamic = "force-dynamic";

export default async function ProfesionalesPage() {
  const session = await auth();

  if (!puedeVerEquipoDeCampo(session?.user?.role)) {
    return (
      <div>
        <h1 className="text-xl font-bold">Red de profesionales</h1>
        <Tarjeta className="mt-4 p-4">
          <p className="text-sm text-muted">
            Esta sección está restringida al Administrador y a Coordinadores.
          </p>
        </Tarjeta>
      </div>
    );
  }

  const profesionales = await prisma.user.findMany({
    where: {
      active: true,
      estadoCuenta: "APROBADA",
      tipoColaborador: { not: null, notIn: TIPOS_COLABORADOR_ORGANIZACION as never[] },
    },
    select: {
      id: true,
      name: true,
      telefono: true,
      tipoColaborador: true,
      lugarAccionMunicipio: true,
      lugarAccionDepartamento: true,
      disponibilidadTiempo: true,
      disponibilidadDesplazamiento: true,
      zonasDesplazamiento: true,
      experticia: true,
      comoPuedeAyudar: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Red de profesionales</h1>
      <p className="mt-1 text-sm text-muted">
        Rescatistas, voluntarios y profesionales de salud, veterinaria e ingeniería/arquitectura
        registrados, con su disponibilidad y experticia — para ubicarlos rápido cuando se necesiten.
      </p>
      <ProfesionalesLista profesionales={JSON.parse(JSON.stringify(profesionales))} />
    </div>
  );
}
