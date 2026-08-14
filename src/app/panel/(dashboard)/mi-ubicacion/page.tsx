import MiUbicacionPanel from "./MiUbicacionPanel";

export const dynamic = "force-dynamic";

export default function MiUbicacionPage() {
  return (
    <div>
      <h1 className="text-xl font-bold">Mi ubicación</h1>
      <p className="mt-1 text-sm text-muted">
        Compartir tu ubicación es completamente voluntario. Actívala, míra dónde quedó registrada y
        apágala cuando quieras, directamente desde tu panel — nada de esto se pide durante el registro.
      </p>
      <MiUbicacionPanel />
    </div>
  );
}
