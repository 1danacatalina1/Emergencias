"use client";

import { useState } from "react";
import EnviosPanel, { type PrefillEnvio } from "./EnviosPanel";
import SolicitudesInsumoPanel from "./SolicitudesInsumoPanel";

interface PuntoOpcion {
  id: string;
  nombre: string;
  municipio: string;
}

export default function EnviosYSolicitudes({
  enviosIniciales,
  solicitudesIniciales,
  puntos,
  puedeEliminar,
}: {
  enviosIniciales: Parameters<typeof EnviosPanel>[0]["enviosIniciales"];
  solicitudesIniciales: Parameters<typeof SolicitudesInsumoPanel>[0]["solicitudesIniciales"];
  puntos: PuntoOpcion[];
  puedeEliminar: boolean;
}) {
  const [prefill, setPrefill] = useState<PrefillEnvio | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-bold">Solicitudes entre puntos de acopio ({solicitudesIniciales.length})</h2>
        <p className="mt-1 text-sm text-muted">
          Si un punto de acopio necesita un insumo que no tiene, puede publicarlo aquí para que otro
          punto le apoye enviándolo.
        </p>
        <SolicitudesInsumoPanel
          solicitudesIniciales={solicitudesIniciales}
          puntos={puntos}
          onResponder={setPrefill}
        />
      </div>

      <div>
        <h2 className="font-bold">Envíos desde puntos de acopio ({enviosIniciales.length})</h2>
        <p className="mt-1 text-sm text-muted">
          Registra hacia dónde envía cada punto de acopio, qué insumos y cuántas unidades, quién recibe la
          ayuda y quién es responsable de ella.
        </p>
        <EnviosPanel
          enviosIniciales={enviosIniciales}
          puntos={puntos}
          puedeEliminar={puedeEliminar}
          prefill={prefill}
          onPrefillConsumido={() => setPrefill(null)}
        />
      </div>
    </div>
  );
}
