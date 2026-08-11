import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeGestionarIntegraciones } from "@/lib/permisos";
import { Tarjeta } from "@/components/ui/campos";
import IntegracionesPanel from "./IntegracionesPanel";

export const dynamic = "force-dynamic";

export default async function IntegracionesPage() {
  const session = await auth();

  if (!puedeGestionarIntegraciones(session?.user?.role)) {
    return (
      <div>
        <h1 className="text-xl font-bold">Integraciones externas</h1>
        <Tarjeta className="mt-4 p-4">
          <p className="text-sm text-muted">
            Esta sección está restringida al Administrador de la plataforma.
          </p>
        </Tarjeta>
      </div>
    );
  }

  const llaves = await prisma.apiKey.findMany({
    select: {
      id: true,
      nombre: true,
      prefijo: true,
      activa: true,
      ultimoUsoEn: true,
      expiraEn: true,
      createdAt: true,
      creadoPor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Integraciones externas</h1>
      <p className="mt-1 text-sm text-muted">
        Genera un token de acceso para que un sistema externo (por ejemplo, la UNGRD) consulte los
        datos de esta plataforma de forma automática, sin necesitar una cuenta de usuario.
      </p>
      <IntegracionesPanel llavesIniciales={JSON.parse(JSON.stringify(llaves))} />
    </div>
  );
}
