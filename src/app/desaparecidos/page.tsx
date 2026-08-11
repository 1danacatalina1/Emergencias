"use client";

import { useState } from "react";
import { EncabezadoPagina } from "@/components/EncabezadoPagina";
import FormularioDesaparecido from "./FormularioDesaparecido";
import ListaDesaparecidos from "./ListaDesaparecidos";

type Pestana = "reportar" | "ver";

export default function DesaparecidosPage() {
  const [pestana, setPestana] = useState<Pestana>("reportar");
  const [recargar, setRecargar] = useState(0);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background pb-12">
      <EncabezadoPagina
        titulo="🔍 Persona desaparecida"
        subtitulo="Reporta a alguien desaparecido o ayuda a identificar a las personas reportadas"
        claseColor="bg-violet-700"
      />
      <main className="mx-auto -mt-3 w-full max-w-xl flex-1 px-4">
        <div className="mt-4 flex gap-1 rounded-xl bg-black/[.04] p-1">
          <button
            onClick={() => setPestana("reportar")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              pestana === "reportar" ? "bg-surface text-foreground shadow-sm" : "text-muted"
            }`}
          >
            🆘 Reportar
          </button>
          <button
            onClick={() => setPestana("ver")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              pestana === "ver" ? "bg-surface text-foreground shadow-sm" : "text-muted"
            }`}
          >
            👥 Ver reportados
          </button>
        </div>

        {pestana === "reportar" && <FormularioDesaparecido onCreado={() => setRecargar((n) => n + 1)} />}
        {pestana === "ver" && <ListaDesaparecidos recargar={recargar} />}
      </main>
    </div>
  );
}
