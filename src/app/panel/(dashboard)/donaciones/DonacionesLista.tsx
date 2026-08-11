"use client";

import { useState } from "react";
import { Tarjeta, Seleccion } from "@/components/ui/campos";
import { InsigniaEstado } from "@/components/ui/insignias";

const ESTADOS = ["OFRECIDA", "CONFIRMADA", "RECIBIDA", "CANCELADA"];

interface Donacion {
  id: string;
  codigo: string;
  nombreDonante: string;
  telefonoDonante: string;
  tipoAyuda: string;
  descripcion: string;
  municipio: string;
  estado: string;
  donationPoint: { id: string; codigo: string; nombre: string } | null;
}

export default function DonacionesLista({ donaciones }: { donaciones: Donacion[] }) {
  const [lista, setLista] = useState(donaciones);

  async function cambiarEstado(id: string, estado: string) {
    setLista((prev) => prev.map((d) => (d.id === id ? { ...d, estado } : d)));
    await fetch(`/api/donations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {lista.map((d) => (
        <Tarjeta key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-primary">{d.codigo}</p>
            <p className="text-sm font-bold">{d.tipoAyuda} · {d.nombreDonante}</p>
            <p className="text-xs text-muted">{d.descripcion} — {d.municipio} · {d.telefonoDonante}</p>
            {d.donationPoint && <p className="text-xs font-semibold text-primary">→ {d.donationPoint.nombre}</p>}
          </div>
          <div className="flex items-center gap-2">
            <InsigniaEstado estado={d.estado} />
            <Seleccion value={d.estado} onChange={(e) => cambiarEstado(d.id, e.target.value)} className="w-auto py-1.5 text-xs">
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </Seleccion>
          </div>
        </Tarjeta>
      ))}
      {lista.length === 0 && <p className="mt-2 text-sm text-muted">No se han registrado donaciones.</p>}
    </div>
  );
}
