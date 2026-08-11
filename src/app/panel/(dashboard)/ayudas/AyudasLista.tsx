"use client";

import { useState } from "react";
import Link from "next/link";
import { Tarjeta, Seleccion } from "@/components/ui/campos";
import { InsigniaEstado } from "@/components/ui/insignias";
import BotonEliminar from "@/components/ui/BotonEliminar";

const ESTADOS = ["SOLICITADA", "EN_PROCESO", "ENTREGADA", "CANCELADA"];

interface Ayuda {
  id: string;
  codigo: string;
  tipoAyuda: string;
  estado: string;
  nombreSolicitante: string;
  telefonoSolicitante: string;
  descripcion: string;
  municipio: string;
  cantidadPersonas: number;
  incident: { id: string; codigo: string } | null;
}

export default function AyudasLista({ ayudas, puedeEliminar }: { ayudas: Ayuda[]; puedeEliminar: boolean }) {
  const [lista, setLista] = useState(ayudas);

  async function cambiarEstado(id: string, estado: string) {
    setLista((prev) => prev.map((a) => (a.id === id ? { ...a, estado } : a)));
    await fetch(`/api/aid-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      {lista.map((a) => (
        <Tarjeta key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-primary">{a.codigo}</p>
            <p className="text-sm font-bold">{a.tipoAyuda} · {a.nombreSolicitante}</p>
            <p className="text-xs text-muted">{a.descripcion} — {a.municipio} · {a.cantidadPersonas} persona(s) · {a.telefonoSolicitante}</p>
            {a.incident && (
              <Link href={`/panel/incidentes/${a.incident.id}`} className="text-xs font-semibold text-primary">
                Incidente {a.incident.codigo}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <InsigniaEstado estado={a.estado} />
            <Seleccion value={a.estado} onChange={(e) => cambiarEstado(a.id, e.target.value)} className="w-auto py-1.5 text-xs">
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </Seleccion>
            {puedeEliminar && (
              <BotonEliminar
                endpoint={`/api/aid-requests/${a.id}`}
                mensajeConfirmacion="¿Eliminar esta solicitud de ayuda de forma definitiva? Esta acción no se puede deshacer."
                onEliminado={() => setLista((prev) => prev.filter((x) => x.id !== a.id))}
              />
            )}
          </div>
        </Tarjeta>
      ))}
      {lista.length === 0 && <p className="text-sm text-muted">No se encontraron solicitudes.</p>}
    </div>
  );
}
