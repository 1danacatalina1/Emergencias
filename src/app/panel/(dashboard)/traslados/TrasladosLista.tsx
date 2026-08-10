"use client";

import { useState } from "react";
import Link from "next/link";
import { Tarjeta, Seleccion } from "@/components/ui/campos";
import { InsigniaEstado } from "@/components/ui/insignias";

const ESTADOS = ["SOLICITADO", "EN_RUTA", "TRASLADADO", "ATENDIDO_EN_CENTRO", "CANCELADO"];

interface Traslado {
  id: string;
  centroMedico: string;
  tipoTraslado: string;
  estadoTraslado: string;
  motivo: string;
  person: { nombreCompleto: string } | null;
  incident: { id: string; codigo: string; municipio: string } | null;
}

export default function TrasladosLista({ traslados }: { traslados: Traslado[] }) {
  const [lista, setLista] = useState(traslados);

  async function cambiarEstado(id: string, estadoTraslado: string) {
    setLista((prev) => prev.map((t) => (t.id === id ? { ...t, estadoTraslado } : t)));
    await fetch(`/api/transfers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estadoTraslado }),
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      {lista.map((t) => (
        <Tarjeta key={t.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
          <div className="min-w-0">
            <p className="text-sm font-bold">{t.person?.nombreCompleto}</p>
            <p className="text-xs text-muted">{t.centroMedico} · {t.tipoTraslado} · {t.motivo}</p>
            {t.incident && (
              <Link href={`/panel/incidentes/${t.incident.id}`} className="text-xs font-semibold text-primary">
                {t.incident.codigo} · {t.incident.municipio}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <InsigniaEstado estado={t.estadoTraslado} />
            <Seleccion value={t.estadoTraslado} onChange={(e) => cambiarEstado(t.id, e.target.value)} className="w-auto py-1.5 text-xs">
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </Seleccion>
          </div>
        </Tarjeta>
      ))}
      {lista.length === 0 && <p className="text-sm text-muted">No se encontraron traslados.</p>}
    </div>
  );
}
