import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeVerEquipoDeCampo } from "@/lib/permisos";
import { Tarjeta } from "@/components/ui/campos";
import AlertasSOSPanel from "./AlertasSOSPanel";

export const dynamic = "force-dynamic";

export default async function AlertasSOSPage() {
  const session = await auth();

  if (!puedeVerEquipoDeCampo(session?.user?.role)) {
    return (
      <div>
        <h1 className="text-xl font-bold">Alertas SOS</h1>
        <Tarjeta className="mt-4 p-4">
          <p className="text-sm text-muted">
            Esta sección está restringida al Administrador y a Coordinadores.
          </p>
        </Tarjeta>
      </div>
    );
  }

  const alertas = await prisma.alertaSOS.findMany({
    include: {
      autor: { select: { id: true, name: true, telefono: true, tipoColaborador: true } },
      atendidaPor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Alertas SOS</h1>
      <p className="mt-1 text-sm text-muted">
        Solicitudes de auxilio enviadas por usuarios del panel desde el botón SOS.
      </p>
      <AlertasSOSPanel alertasIniciales={JSON.parse(JSON.stringify(alertas))} />
    </div>
  );
}
