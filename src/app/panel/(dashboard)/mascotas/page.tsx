import { prisma } from "@/lib/prisma";
import MascotasLista from "./MascotasLista";

export const dynamic = "force-dynamic";

export default async function MascotasPanelPage() {
  const mascotas = await prisma.pet.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Mascotas ({mascotas.length})</h1>
      <MascotasLista mascotas={JSON.parse(JSON.stringify(mascotas))} />
    </div>
  );
}
