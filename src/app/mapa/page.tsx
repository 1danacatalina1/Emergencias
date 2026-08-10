"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MapaIncidentes from "@/components/mapa/MapaIncidentesDinamico";
import type { IncidenteMapa } from "@/components/mapa/MapaIncidentes";

export default function VerMapaPage() {
  const [incidentes, setIncidentes] = useState<IncidenteMapa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function cargarIncidentes() {
      setCargando(true);
      const params = new URLSearchParams();
      if (estado) params.set("estado", estado);
      try {
        const res = await fetch(`/api/incidents?${params.toString()}`);
        const data = await res.json();
        if (!cancelado) setIncidentes(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarIncidentes();
    return () => {
      cancelado = true;
    };
  }, [estado]);

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="z-10 flex items-center gap-3 bg-primary px-4 py-3 text-white shadow-md">
        <Link href="/" className="text-lg">←</Link>
        <div className="flex-1">
          <h1 className="text-base font-bold leading-tight">📍 Mapa de emergencias</h1>
          <p className="text-xs text-white/70">{cargando ? "Cargando…" : `${incidentes.length} incidentes`}</p>
        </div>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-lg border-0 bg-white/15 px-2 py-1.5 text-xs font-medium text-white"
        >
          <option value="" className="text-black">Todos los estados</option>
          <option value="REPORTADO" className="text-black">Reportado</option>
          <option value="EN_ATENCION" className="text-black">En atención</option>
          <option value="EN_PROCESO" className="text-black">En proceso</option>
          <option value="RESUELTO" className="text-black">Resuelto</option>
          <option value="CERRADO" className="text-black">Cerrado</option>
        </select>
      </header>
      <div className="relative flex-1">
        <MapaIncidentes incidentes={incidentes} />
      </div>
      <div className="flex items-center justify-center gap-4 border-t border-border bg-surface px-3 py-2 text-xs text-muted safe-bottom">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#d92d20]" /> Crítica</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#ea580c]" /> Alta</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#dc6803]" /> Media</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#667085]" /> Baja</span>
      </div>
    </div>
  );
}
