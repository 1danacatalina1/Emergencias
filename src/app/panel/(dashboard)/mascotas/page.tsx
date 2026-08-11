import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeEliminar } from "@/lib/permisos";
import MascotasLista from "./MascotasLista";

export const dynamic = "force-dynamic";

export default async function MascotasPanelPage() {
  const session = await auth();
  const mascotas = await prisma.pet.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Mascotas ({mascotas.length})</h1>
      <MascotasLista mascotas={JSON.parse(JSON.stringify(mascotas))} puedeEliminar={puedeEliminar(session?.user?.role)} />
    </div>
  );
}
