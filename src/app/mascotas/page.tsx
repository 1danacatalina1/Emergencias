"use client";

import { useState } from "react";
import { EncabezadoPagina } from "@/components/EncabezadoPagina";
import FormularioMascota from "./FormularioMascota";
import ListaMascotas from "./ListaMascotas";

type Pestana = "perdida" | "encontrada" | "ver";

export default function MascotasPage() {
  const [pestana, setPestana] = useState<Pestana>("perdida");
  const [recargar, setRecargar] = useState(0);

  const pestanas: { id: Pestana; label: string }[] = [
    { id: "perdida", label: "😢 Perdí mi mascota" },
    { id: "encontrada", label: "🐾 Encontré una" },
    { id: "ver", label: "👀 Ver reportes" },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background pb-12">
      <EncabezadoPagina
        titulo="🐾 Mascotas"
        subtitulo="Reporta una mascota perdida o avisa que encontraste una"
        claseColor="bg-teal-700"
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

        {pestana === "perdida" && <FormularioMascota tipo="PERDIDA" onCreado={() => setRecargar((n) => n + 1)} />}
        {pestana === "encontrada" && <FormularioMascota tipo="ENCONTRADA" onCreado={() => setRecargar((n) => n + 1)} />}
        {pestana === "ver" && <ListaMascotas recargar={recargar} />}
      </main>
    </div>
  );
}
