"use client";

import { useState } from "react";
import { Tarjeta, Seleccion, Campo } from "@/components/ui/campos";
import { InsigniaEstado } from "@/components/ui/insignias";
import BotonEliminar from "@/components/ui/BotonEliminar";

const ESTADOS = ["OFRECIDA", "CONFIRMADA", "RECIBIDA", "CANCELADA"];

interface Donacion {
  id: string;
  codigo: string;
  nombreDonante: string;
  telefonoDonante: string;
  tipoAyuda: string;
  descripcion: string;
  cantidad: number | null;
  unidad: string | null;
  municipio: string;
  estado: string;
  donationPoint: { id: string; codigo: string; nombre: string } | null;
}

export default function DonacionesLista({ donaciones, puedeEliminar }: { donaciones: Donacion[]; puedeEliminar: boolean }) {
  const [lista, setLista] = useState(donaciones);

  async function actualizar(id: string, cambios: Partial<Donacion>) {
    setLista((prev) => prev.map((d) => (d.id === id ? { ...d, ...cambios } : d)));
    await fetch(`/api/donations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
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
            <div className="mt-2 flex items-center gap-2">
              <Campo
                type="number"
                min={1}
                placeholder="Cantidad"
                value={d.cantidad ?? ""}
                onChange={(e) => setLista((prev) => prev.map((x) => (x.id === d.id ? { ...x, cantidad: e.target.value ? Number(e.target.value) : null } : x)))}
                onBlur={(e) => actualizar(d.id, { cantidad: e.target.value ? Number(e.target.value) : null })}
                className="w-24 py-1.5 text-xs"
              />
              <Campo
                placeholder="Unidad (kg, cajas…)"
                value={d.unidad ?? ""}
                onChange={(e) => setLista((prev) => prev.map((x) => (x.id === d.id ? { ...x, unidad: e.target.value } : x)))}
                onBlur={(e) => actualizar(d.id, { unidad: e.target.value || null })}
                className="w-36 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <InsigniaEstado estado={d.estado} />
            <Seleccion value={d.estado} onChange={(e) => actualizar(d.id, { estado: e.target.value })} className="w-auto py-1.5 text-xs">
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </Seleccion>
            {puedeEliminar && (
              <BotonEliminar
                endpoint={`/api/donations/${d.id}`}
                mensajeConfirmacion="¿Eliminar esta donación de forma definitiva? Esta acción no se puede deshacer."
                onEliminado={() => setLista((prev) => prev.filter((x) => x.id !== d.id))}
              />
            )}
          </div>
        </Tarjeta>
      ))}
      {lista.length === 0 && <p className="mt-2 text-sm text-muted">No se han registrado donaciones.</p>}
    </div>
  );
}
