"use client";

import { useEffect, useState } from "react";
import { Tarjeta } from "@/components/ui/campos";
import { InsigniaEstado } from "@/components/ui/insignias";

interface PersonaDesaparecida {
  id: string;
  nombreCompleto: string;
  edad: number | null;
  sexo: string;
  descripcionFisica: string | null;
  estadoPersona: string;
  contactoNombre: string;
  contactoTelefono: string;
  contactoParentesco: string | null;
  foto: string | null;
  codigoIncidente: string | null;
  ultimaUbicacion: { direccion: string; municipio: string; departamento: string; fecha: string } | null;
}

const SEXO_LABEL: Record<string, string> = {
  MASCULINO: "Hombre",
  FEMENINO: "Mujer",
  OTRO: "Otro",
  NO_INFORMA: "",
};

export default function ListaDesaparecidos({ recargar }: { recargar: number }) {
  const [personas, setPersonas] = useState<PersonaDesaparecida[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setCargando(true);
      try {
        const res = await fetch("/api/missing-persons");
        const data = await res.json();
        if (!cancelado) setPersonas(Array.isArray(data) ? data : []);
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
    return <p className="mt-4 text-sm text-muted">Cargando…</p>;
  }

  if (personas.length === 0) {
    return <p className="mt-4 text-sm text-muted">No hay personas reportadas como desaparecidas en este momento.</p>;
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {personas.map((p) => (
        <Tarjeta key={p.id} className="flex gap-3 p-3.5">
          {p.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.foto} alt={p.nombreCompleto} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-black/[.05] text-3xl">🧍</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold">{p.nombreCompleto}</p>
              <InsigniaEstado estado={p.estadoPersona} />
            </div>
            <p className="text-xs text-muted">
              {[p.edad ? `${p.edad} años` : null, SEXO_LABEL[p.sexo] || null].filter(Boolean).join(" · ")}
            </p>
            {p.descripcionFisica && <p className="mt-1 text-xs text-foreground">{p.descripcionFisica}</p>}
            {p.ultimaUbicacion && (
              <p className="mt-1 text-xs text-muted">
                📍 Visto por última vez en {p.ultimaUbicacion.direccion}, {p.ultimaUbicacion.municipio}
              </p>
            )}
            <p className="mt-1 text-xs font-semibold text-primary">
              ¿La has visto? Llama a {p.contactoNombre}
              {p.contactoParentesco && ` (${p.contactoParentesco})`}: {p.contactoTelefono}
            </p>
          </div>
        </Tarjeta>
      ))}
    </div>
  );
}
