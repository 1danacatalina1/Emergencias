import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeEliminar } from "@/lib/permisos";
import DonacionesLista from "./DonacionesLista";
import PuntosAcopioLista from "./PuntosAcopioLista";
import InventarioPanel from "./InventarioPanel";
import EnviosYSolicitudes from "./EnviosYSolicitudes";

export const dynamic = "force-dynamic";

export default async function DonacionesPage() {
  const session = await auth();
  const [donaciones, puntos, envios, solicitudes, inventario] = await Promise.all([
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
    prisma.solicitudInsumo.findMany({
      include: {
        donationPoint: { select: { id: true, codigo: true, nombre: true, municipio: true, telefonoContacto: true } },
        envio: { select: { id: true, codigo: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    prisma.inventarioItem.findMany({
      orderBy: { insumo: "asc" },
    }),
  ]);

  const puntosOpciones = puntos.map((p) => ({ id: p.id, nombre: p.nombre, municipio: p.municipio }));

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
        <h2 className="font-bold">Inventario por punto de acopio</h2>
        <p className="mt-1 text-sm text-muted">
          Sube automáticamente cuando marcas una donación como recibida, y baja cuando se registra un
          envío desde ese punto.
        </p>
        <InventarioPanel inventarioInicial={JSON.parse(JSON.stringify(inventario))} puntos={puntosOpciones} />
      </div>

      <div className="mt-8">
        <EnviosYSolicitudes
          enviosIniciales={JSON.parse(JSON.stringify(envios))}
          solicitudesIniciales={JSON.parse(JSON.stringify(solicitudes))}
          puntos={puntosOpciones}
          puedeEliminar={puedeEliminar(session?.user?.role)}
        />
      </div>
    </div>
  );
}
