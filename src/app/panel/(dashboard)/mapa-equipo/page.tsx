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

  return (
    <div className="flex h-full flex-col">
      <h1 className="text-xl font-bold">Mapa del equipo</h1>
      <p className="mt-1 text-sm text-muted">
        Ubicación en tiempo real de quienes activaron voluntariamente compartir su ubicación. Se
        actualiza automáticamente mientras esta página permanece abierta.
      </p>
      <EquipoMapaPanel />
    </div>
  );
}
