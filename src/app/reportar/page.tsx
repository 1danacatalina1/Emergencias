import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/EncabezadoPagina";
import FormularioReportar from "./FormularioReportar";

export const dynamic = "force-dynamic";

export default async function ReportarEmergenciaPage() {
  const tipos = await prisma.incidentType.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
  });

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background pb-12">
      <EncabezadoPagina
        titulo="🆘 Reportar emergencia"
        subtitulo="Registra estructuras colapsadas, personas atrapadas, desaparecidas o fallecidas"
        claseColor="bg-emergency"
      />
      <main className="mx-auto -mt-3 w-full max-w-xl flex-1 px-4">
        <FormularioReportar tipos={tipos.map((t) => ({ id: t.id, nombre: t.nombre }))} />
      </main>
    </div>
  );
}
