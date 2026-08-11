"use client";

import { useState } from "react";
import { Tarjeta, Seleccion } from "@/components/ui/campos";
import { InsigniaEstado } from "@/components/ui/insignias";
import BotonEliminar from "@/components/ui/BotonEliminar";

const ESTADOS = ["ACTIVO", "REUNIDO", "CERRADO"];

interface Mascota {
  id: string;
  codigo: string;
  tipo: string;
  especie: string;
  nombre: string | null;
  descripcion: string;
  municipio: string;
  contactoNombre: string;
  contactoTelefono: string;
  estado: string;
}

export default function MascotasLista({ mascotas, puedeEliminar }: { mascotas: Mascota[]; puedeEliminar: boolean }) {
  const [lista, setLista] = useState(mascotas);

  async function cambiarEstado(id: string, estado: string) {
    setLista((prev) => prev.map((m) => (m.id === id ? { ...m, estado } : m)));
    await fetch(`/api/pets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      {lista.map((m) => (
        <Tarjeta key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-primary">{m.codigo}</p>
            <div className="flex items-center gap-1.5">
              <InsigniaEstado estado={m.tipo} />
              <p className="text-sm font-bold">{m.nombre || "Sin nombre"} · {m.especie}</p>
            </div>
            <p className="text-xs text-muted">{m.descripcion} — {m.municipio}</p>
            <p className="text-xs text-muted">{m.contactoNombre} · {m.contactoTelefono}</p>
          </div>
          <div className="flex items-center gap-2">
            <InsigniaEstado estado={m.estado} />
            <Seleccion value={m.estado} onChange={(e) => cambiarEstado(m.id, e.target.value)} className="w-auto py-1.5 text-xs">
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </Seleccion>
            {puedeEliminar && (
              <BotonEliminar
                endpoint={`/api/pets/${m.id}`}
                mensajeConfirmacion="¿Eliminar este reporte de mascota de forma definitiva? Esta acción no se puede deshacer."
                onEliminado={() => setLista((prev) => prev.filter((x) => x.id !== m.id))}
              />
            )}
          </div>
        </Tarjeta>
      ))}
      {lista.length === 0 && <p className="mt-2 text-sm text-muted">No se han registrado mascotas.</p>}
    </div>
  );
}
