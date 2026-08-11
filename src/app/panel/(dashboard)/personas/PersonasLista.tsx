"use client";

import { useState } from "react";
import Link from "next/link";
import { Tarjeta, Seleccion } from "@/components/ui/campos";
import { InsigniaEstado } from "@/components/ui/insignias";
import BotonEliminar from "@/components/ui/BotonEliminar";

const ESTADOS = ["DESAPARECIDA", "BUSQUEDA", "LOCALIZADA", "ILESA", "HERIDA", "ATRAPADA", "TRASLADADA", "FALLECIDA", "ATENDIDA"];

interface Persona {
  id: string;
  nombreCompleto: string;
  numeroDocumento: string | null;
  edad: number | null;
  sexo: string;
  estadoPersona: string;
  incident: { id: string; codigo: string; municipio: string } | null;
}

export default function PersonasLista({ personas, puedeEliminar }: { personas: Persona[]; puedeEliminar: boolean }) {
  const [lista, setLista] = useState(personas);

  async function cambiarEstado(id: string, estadoPersona: string) {
    setLista((prev) => prev.map((p) => (p.id === id ? { ...p, estadoPersona } : p)));
    await fetch(`/api/persons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estadoPersona }),
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      {lista.map((p) => (
        <Tarjeta key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
          <div className="min-w-0">
            <p className="text-sm font-bold">{p.nombreCompleto}</p>
            <p className="text-xs text-muted">
              {p.numeroDocumento ?? "Sin documento"} · {p.edad ? `${p.edad} años` : "Edad no registrada"} · {p.sexo}
            </p>
            {p.incident && (
              <Link href={`/panel/incidentes/${p.incident.id}`} className="text-xs font-semibold text-primary">
                {p.incident.codigo} · {p.incident.municipio}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <InsigniaEstado estado={p.estadoPersona} />
            <Seleccion
              value={p.estadoPersona}
              onChange={(e) => cambiarEstado(p.id, e.target.value)}
              className="w-auto py-1.5 text-xs"
            >
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </Seleccion>
            {puedeEliminar && (
              <BotonEliminar
                endpoint={`/api/persons/${p.id}`}
                mensajeConfirmacion="¿Eliminar esta persona de forma definitiva, incluidas sus fotos? Esta acción no se puede deshacer."
                onEliminado={() => setLista((prev) => prev.filter((x) => x.id !== p.id))}
              />
            )}
          </div>
        </Tarjeta>
      ))}
      {lista.length === 0 && <p className="text-sm text-muted">No se encontraron personas.</p>}
    </div>
  );
}
