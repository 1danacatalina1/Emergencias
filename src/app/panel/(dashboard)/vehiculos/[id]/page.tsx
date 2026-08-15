import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeVerMapaYProfesionales, puedeGestionarUsuarios, puedeEliminar } from "@/lib/permisos";
import { Tarjeta } from "@/components/ui/campos";
import VehiculoDetalle from "./VehiculoDetalle";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function VehiculoDetallePage({ params }: Params) {
  const session = await auth();

  if (!puedeVerMapaYProfesionales(session?.user?.role)) {
    return (
      <div>
        <h1 className="text-xl font-bold">Vehículo</h1>
        <Tarjeta className="mt-4 p-4">
          <p className="text-sm text-muted">Esta sección está restringida a cuentas aprobadas del panel.</p>
        </Tarjeta>
      </div>
    );
  }

  const { id } = await params;

  const [vehiculo, roster] = await Promise.all([
    prisma.vehiculo.findUnique({
      where: { id },
      include: {
        registradoPor: { select: { id: true, name: true } },
        conductores: { include: { usuario: { select: { id: true, name: true, telefono: true } } } },
        pasajeros: { include: { usuario: { select: { id: true, name: true, telefono: true } } } },
        necesidades: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.user.findMany({
      where: { active: true, estadoCuenta: "APROBADA" },
      select: { id: true, name: true, telefono: true, tipoColaborador: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!vehiculo) notFound();

  const puedeEditar = vehiculo.registradoPorId === session!.user.id || puedeGestionarUsuarios(session!.user.role);

  return (
    <VehiculoDetalle
      vehiculoInicial={JSON.parse(JSON.stringify(vehiculo))}
      roster={JSON.parse(JSON.stringify(roster))}
      puedeEditar={puedeEditar}
      puedeEliminar={puedeEliminar(session!.user.role)}
    />
  );
}
