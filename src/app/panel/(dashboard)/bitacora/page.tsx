import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeVerEquipoDeCampo } from "@/lib/permisos";
import BitacoraPanel from "./BitacoraPanel";

export const dynamic = "force-dynamic";

export default async function BitacoraPage() {
  const session = await auth();
  const veTodo = puedeVerEquipoDeCampo(session?.user?.role);

  const registros = await prisma.registroBitacora.findMany({
    where: veTodo
      ? undefined
      : { OR: [{ autorId: session!.user.id }, { tipo: "NECESIDAD" }] },
    include: {
      autor: { select: { id: true, name: true, tipoColaborador: true } },
      atendidaPor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Bitácora de campo</h1>
      <p className="mt-1 text-sm text-muted">
        Registra el trabajo que realizas y las necesidades puntuales que encuentres en la zona que
        cubres. Esta información es interna: solo la ven los usuarios registrados del panel, no es
        pública.
      </p>
      <BitacoraPanel
        registrosIniciales={JSON.parse(JSON.stringify(registros))}
        usuarioActualId={session!.user.id}
        veTodo={veTodo}
      />
    </div>
  );
}
