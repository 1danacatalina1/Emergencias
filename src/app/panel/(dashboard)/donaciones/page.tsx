import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeEliminar } from "@/lib/permisos";
import DonacionesLista from "./DonacionesLista";
import PuntosAcopioLista from "./PuntosAcopioLista";
import EnviosPanel from "./EnviosPanel";

export const dynamic = "force-dynamic";

export default async function DonacionesPage() {
  const session = await auth();
  const [donaciones, puntos, envios] = await Promise.all([
    prisma.donation.findMany({
      include: { donationPoint: { select: { id: true, codigo: true, nombre: true } } },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    prisma.donationPoint.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    prisma.envio.findMany({
      include: {
        donationPoint: { select: { id: true, codigo: true, nombre: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold">Donaciones y puntos de acopio</h1>

      <div className="mt-6">
        <h2 className="font-bold">Puntos de acopio ({puntos.length})</h2>
        <PuntosAcopioLista puntos={JSON.parse(JSON.stringify(puntos))} puedeEliminar={puedeEliminar(session?.user?.role)} />
      </div>

      <div className="mt-8">
        <h2 className="font-bold">Donaciones recibidas ({donaciones.length})</h2>
        <DonacionesLista donaciones={JSON.parse(JSON.stringify(donaciones))} puedeEliminar={puedeEliminar(session?.user?.role)} />
      </div>

      <div className="mt-8">
        <h2 className="font-bold">Envíos desde puntos de acopio ({envios.length})</h2>
        <p className="mt-1 text-sm text-muted">
          Registra hacia dónde envía cada punto de acopio, qué insumos y cuántas unidades, quién recibe la
          ayuda y quién es responsable de ella.
        </p>
        <EnviosPanel
          enviosIniciales={JSON.parse(JSON.stringify(envios))}
          puntos={puntos.map((p) => ({ id: p.id, nombre: p.nombre, municipio: p.municipio }))}
          puedeEliminar={puedeEliminar(session?.user?.role)}
        />
      </div>
    </div>
  );
}
