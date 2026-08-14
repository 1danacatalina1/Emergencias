"use client";

import { useMemo, useState } from "react";
import { Seleccion, Tarjeta } from "@/components/ui/campos";

interface InventarioItem {
  id: string;
  insumo: string;
  cantidad: number;
  unidad: string | null;
  donationPointId: string;
}

interface PuntoOpcion {
  id: string;
  nombre: string;
  municipio: string;
}

export default function InventarioPanel({
  inventarioInicial,
  puntos,
}: {
  inventarioInicial: InventarioItem[];
  puntos: PuntoOpcion[];
}) {
  const [puntoId, setPuntoId] = useState(puntos[0]?.id ?? "");

  const items = useMemo(
    () => inventarioInicial.filter((i) => i.donationPointId === puntoId).sort((a, b) => a.insumo.localeCompare(b.insumo)),
    [inventarioInicial, puntoId],
  );

  if (puntos.length === 0) {
    return <Tarjeta className="p-4 text-sm text-muted">Registra un punto de acopio para ver su inventario.</Tarjeta>;
  }

  return (
    <div>
      <Seleccion value={puntoId} onChange={(e) => setPuntoId(e.target.value)} className="w-auto">
        {puntos.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre} — {p.municipio}</option>
        ))}
      </Seleccion>

      <div className="mt-3 flex flex-col gap-2">
        {items.length === 0 && (
          <Tarjeta className="p-4 text-sm text-muted">
            Sin existencias registradas todavía. El inventario sube automáticamente cuando marcas una
            donación como &ldquo;Recibida&rdquo; con su insumo y cantidad.
          </Tarjeta>
        )}
        {items.map((item) => (
          <Tarjeta key={item.id} className="flex items-center justify-between gap-3 p-3">
            <p className="text-sm font-semibold">{item.insumo}</p>
            <p className={`text-sm font-bold ${item.cantidad < 0 ? "text-emergency" : "text-foreground"}`}>
              {item.cantidad} {item.unidad ?? ""}
              {item.cantidad < 0 && <span className="ml-1 text-xs font-normal">⚠️ descuadre</span>}
            </p>
          </Tarjeta>
        ))}
      </div>
    </div>
  );
}
