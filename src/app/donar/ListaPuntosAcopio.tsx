"use client";

import { useEffect, useState } from "react";
import { Tarjeta } from "@/components/ui/campos";
import MapaPuntosAcopio from "@/components/mapa/MapaPuntosAcopioDinamico";
import type { PuntoAcopioMapa } from "@/components/mapa/MapaPuntosAcopio";

export default function ListaPuntosAcopio({ recargar }: { recargar: number }) {
  const [puntos, setPuntos] = useState<PuntoAcopioMapa[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setCargando(true);
      try {
        const res = await fetch("/api/donation-points");
        const data = await res.json();
        if (!cancelado) setPuntos(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, [recargar]);

  if (cargando) {
    return <p className="mt-4 text-sm text-muted">Cargando puntos de acopio…</p>;
  }

  if (puntos.length === 0) {
    return <p className="mt-4 text-sm text-muted">Aún no hay puntos de acopio registrados. ¡Sé la primera persona en registrar uno!</p>;
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="h-56 w-full overflow-hidden rounded-xl border border-border">
        <MapaPuntosAcopio puntos={puntos} />
      </div>
      <div className="flex flex-col gap-2">
        {puntos.map((p) => (
          <Tarjeta key={p.id} className="p-3.5">
            <p className="font-mono text-xs font-bold text-primary">{p.codigo}</p>
            <p className="text-sm font-bold">{p.nombre}</p>
            <p className="text-xs text-muted">{p.direccion}, {p.municipio}</p>
            {p.horario && <p className="mt-1 text-xs text-muted">🕒 {p.horario}</p>}
            <p className="mt-1 text-xs text-muted">📞 {p.telefonoContacto}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {p.tiposAceptados.map((t) => (
                <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {t}
                </span>
              ))}
            </div>
          </Tarjeta>
        ))}
      </div>
    </div>
  );
}
