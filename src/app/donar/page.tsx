"use client";

import { useState } from "react";
import { EncabezadoPagina } from "@/components/EncabezadoPagina";
import FormularioDonacion from "./FormularioDonacion";
import FormularioPuntoAcopio from "./FormularioPuntoAcopio";
import ListaPuntosAcopio from "./ListaPuntosAcopio";

type Pestana = "donar" | "punto" | "puntos";

export default function DonarPage() {
  const [pestana, setPestana] = useState<Pestana>("donar");
  const [recargarPuntos, setRecargarPuntos] = useState(0);

  const pestanas: { id: Pestana; label: string }[] = [
    { id: "donar", label: "🎁 Quiero donar" },
    { id: "punto", label: "📦 Registrar punto" },
    { id: "puntos", label: "📍 Ver puntos" },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background pb-12">
      <EncabezadoPagina
        titulo="🎁 Donar"
        subtitulo="Dona artículos o registra un punto de acopio para que la comunidad done"
        claseColor="bg-success"
      />
      <main className="mx-auto -mt-3 w-full max-w-xl flex-1 px-4">
        <div className="mt-4 flex gap-1 overflow-x-auto rounded-xl bg-black/[.04] p-1">
          {pestanas.map((p) => (
            <button
              key={p.id}
              onClick={() => setPestana(p.id)}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                pestana === p.id ? "bg-surface text-foreground shadow-sm" : "text-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {pestana === "donar" && <FormularioDonacion />}
        {pestana === "punto" && (
          <FormularioPuntoAcopio onCreado={() => setRecargarPuntos((n) => n + 1)} />
        )}
        {pestana === "puntos" && <ListaPuntosAcopio recargar={recargarPuntos} />}
      </main>
    </div>
  );
}
