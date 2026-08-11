"use client";

import { useState } from "react";
import { Tarjeta, Seleccion } from "@/components/ui/campos";
import { InsigniaEstado } from "@/components/ui/insignias";
import BotonEliminar from "@/components/ui/BotonEliminar";

const ESTADOS = ["ACTIVO", "PAUSADO", "CERRADO"];

interface Punto {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  municipio: string;
  telefonoContacto: string;
  tiposAceptados: string[];
  estado: string;
}

export default function PuntosAcopioLista({ puntos, puedeEliminar }: { puntos: Punto[]; puedeEliminar: boolean }) {
  const [lista, setLista] = useState(puntos);

  async function cambiarEstado(id: string, estado: string) {
    setLista((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)));
    await fetch(`/api/donation-points/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {lista.map((p) => (
        <Tarjeta key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-primary">{p.codigo}</p>
            <p className="text-sm font-bold">{p.nombre}</p>
            <p className="text-xs text-muted">{p.direccion}, {p.municipio} · {p.telefonoContacto}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {p.tiposAceptados.map((t) => (
                <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <InsigniaEstado estado={p.estado} />
            <Seleccion value={p.estado} onChange={(e) => cambiarEstado(p.id, e.target.value)} className="w-auto py-1.5 text-xs">
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </Seleccion>
            {puedeEliminar && (
              <BotonEliminar
                endpoint={`/api/donation-points/${p.id}`}
                mensajeConfirmacion="¿Eliminar este punto de acopio de forma definitiva? Esta acción no se puede deshacer."
                onEliminado={() => setLista((prev) => prev.filter((x) => x.id !== p.id))}
              />
            )}
          </div>
        </Tarjeta>
      ))}
      {lista.length === 0 && <p className="mt-2 text-sm text-muted">No se han registrado puntos de acopio.</p>}
    </div>
  );
}
