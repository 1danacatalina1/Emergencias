"use client";

import { useMemo, useState } from "react";
import { Campo, Seleccion, Tarjeta } from "@/components/ui/campos";
import { TIPOS_COLABORADOR } from "@/lib/catalogos";

interface Profesional {
  id: string;
  name: string;
  telefono: string | null;
  tipoColaborador: string | null;
  lugarAccionMunicipio: string | null;
  lugarAccionDepartamento: string | null;
  disponibilidadTiempo: string | null;
  disponibilidadDesplazamiento: boolean | null;
  zonasDesplazamiento: string | null;
  experticia: string | null;
  comoPuedeAyudar: string | null;
}

function etiquetaColaborador(tipo: string | null) {
  return TIPOS_COLABORADOR.find((t) => t.value === tipo)?.label ?? tipo ?? "—";
}

export default function ProfesionalesLista({ profesionales }: { profesionales: Profesional[] }) {
  const [tipo, setTipo] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  const tiposPresentes = useMemo(() => {
    const set = new Set(profesionales.map((p) => p.tipoColaborador).filter(Boolean) as string[]);
    return TIPOS_COLABORADOR.filter((t) => set.has(t.value));
  }, [profesionales]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return profesionales.filter((p) => {
      if (tipo !== "TODOS" && p.tipoColaborador !== tipo) return false;
      if (!q) return true;
      return [p.name, p.experticia, p.comoPuedeAyudar, p.zonasDesplazamiento, p.lugarAccionMunicipio]
        .filter(Boolean)
        .some((campo) => campo!.toLowerCase().includes(q));
    });
  }, [profesionales, tipo, busqueda]);

  return (
    <div className="mt-5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Seleccion value={tipo} onChange={(e) => setTipo(e.target.value)} className="sm:w-72">
          <option value="TODOS">Todos los tipos ({profesionales.length})</option>
          {tiposPresentes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Seleccion>
        <Campo
          placeholder="Buscar por nombre, experticia, zona…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {filtrados.length === 0 && (
          <Tarjeta className="p-4 text-sm text-muted">Nadie coincide con este filtro todavía.</Tarjeta>
        )}
        {filtrados.map((p) => (
          <Tarjeta key={p.id} className="p-3.5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold">{p.name}</p>
                <p className="text-xs font-semibold text-primary">{etiquetaColaborador(p.tipoColaborador)}</p>
                {(p.lugarAccionMunicipio || p.lugarAccionDepartamento) && (
                  <p className="text-xs text-muted">
                    📍 {[p.lugarAccionMunicipio, p.lugarAccionDepartamento].filter(Boolean).join(", ")}
                  </p>
                )}
                {p.telefono && <p className="mt-1 text-xs">📞 {p.telefono}</p>}
                {p.disponibilidadTiempo && <p className="mt-1 text-xs text-muted">⏱️ {p.disponibilidadTiempo}</p>}
                {p.disponibilidadDesplazamiento && (
                  <p className="mt-1 text-xs text-muted">
                    🚗 Puede desplazarse{p.zonasDesplazamiento ? ` a: ${p.zonasDesplazamiento}` : ""}
                  </p>
                )}
                {p.experticia && <p className="mt-1 text-xs">🎓 <span className="font-semibold">Experticia:</span> {p.experticia}</p>}
                {p.comoPuedeAyudar && <p className="mt-1 text-xs">🤝 <span className="font-semibold">Puede ayudar con:</span> {p.comoPuedeAyudar}</p>}
              </div>
            </div>
          </Tarjeta>
        ))}
      </div>
    </div>
  );
}
