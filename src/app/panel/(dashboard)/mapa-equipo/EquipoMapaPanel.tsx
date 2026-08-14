"use client";

import { useEffect, useState } from "react";
import { Tarjeta } from "@/components/ui/campos";
import MapaEquipo from "@/components/mapa/MapaEquipoDinamico";
import type { UbicacionUsuarioMapa } from "@/components/mapa/MapaEquipo";
import { TIPOS_COLABORADOR } from "@/lib/catalogos";

const INTERVALO_ACTUALIZACION_MS = 15_000;

function etiquetaColaborador(tipo: string | null) {
  return TIPOS_COLABORADOR.find((t) => t.value === tipo)?.label ?? "Colaborador";
}

function haceCuanto(iso: string) {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutos < 1) return "hace instantes";
  if (minutos < 60) return `hace ${minutos} min`;
  return `hace ${Math.round(minutos / 60)} h`;
}

export default function EquipoMapaPanel() {
  const [usuarios, setUsuarios] = useState<UbicacionUsuarioMapa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [soloMiEquipo, setSoloMiEquipo] = useState(false);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      const res = await fetch(`/api/equipo/ubicaciones${soloMiEquipo ? "?miEquipo=true" : ""}`);
      if (!res.ok || !activo) return;
      const data = await res.json();
      if (activo) {
        setUsuarios(data);
        setCargando(false);
      }
    }
    cargar();
    const intervalo = setInterval(cargar, INTERVALO_ACTUALIZACION_MS);
    return () => { activo = false; clearInterval(intervalo); };
  }, [soloMiEquipo]);

  return (
    <div className="mt-4 flex flex-col gap-4 md:flex-row">
      <div className="h-[50vh] w-full shrink-0 overflow-hidden rounded-2xl border border-border md:h-[70vh] md:flex-1">
        <MapaEquipo usuarios={usuarios} />
      </div>
      <div className="w-full shrink-0 md:w-72">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold">Compartiendo ahora ({usuarios.length})</h2>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <input type="checkbox" checked={soloMiEquipo} onChange={(e) => setSoloMiEquipo(e.target.checked)} />
            Mi equipo ⭐
          </label>
        </div>
        <div className="mt-2 flex max-h-[40vh] flex-col gap-2 overflow-y-auto md:max-h-[calc(100vh-14rem)]">
          {!cargando && usuarios.length === 0 && (
            <Tarjeta className="p-3 text-xs text-muted">
              {soloMiEquipo
                ? "Nadie de tu equipo (⭐ en Usuarios) está compartiendo su ubicación."
                : "Nadie está compartiendo su ubicación en este momento."}
            </Tarjeta>
          )}
          {usuarios.map((u) => (
            <Tarjeta key={u.id} className="p-3">
              <p className="text-sm font-bold">{u.name}</p>
              <p className="text-xs text-muted">{etiquetaColaborador(u.tipoColaborador)}</p>
              {u.telefono && <p className="mt-1 text-xs">📞 {u.telefono}</p>}
              <p className="mt-1 text-xs text-muted">Actualizado {haceCuanto(u.ubicacionActualizadaEn)}</p>
            </Tarjeta>
          ))}
        </div>
      </div>
    </div>
  );
}
