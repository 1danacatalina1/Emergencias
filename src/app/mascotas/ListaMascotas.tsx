"use client";

import { useEffect, useState } from "react";
import { Tarjeta } from "@/components/ui/campos";

interface Mascota {
  id: string;
  codigo: string;
  tipo: string;
  especie: string;
  nombre: string | null;
  raza: string | null;
  descripcion: string;
  direccion: string;
  municipio: string;
  departamento: string;
  contactoNombre: string;
  contactoTelefono: string;
  fotoUrl: string | null;
  fecha: string;
}

const ICONO_ESPECIE: Record<string, string> = {
  PERRO: "🐶",
  GATO: "🐱",
  AVE: "🐦",
  OTRO: "🐾",
};

export default function ListaMascotas({ recargar }: { recargar: number }) {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<"TODAS" | "PERDIDA" | "ENCONTRADA">("TODAS");

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setCargando(true);
      try {
        const params = new URLSearchParams();
        if (filtro !== "TODAS") params.set("tipo", filtro);
        const res = await fetch(`/api/pets?${params.toString()}`);
        const data = await res.json();
        if (!cancelado) setMascotas(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, [recargar, filtro]);

  return (
    <div className="mt-4">
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-black/[.04] p-1">
        {(["TODAS", "PERDIDA", "ENCONTRADA"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              filtro === f ? "bg-surface text-foreground shadow-sm" : "text-muted"
            }`}
          >
            {f === "TODAS" ? "Todas" : f === "PERDIDA" ? "Perdidas" : "Encontradas"}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="mt-4 text-sm text-muted">Cargando…</p>
      ) : mascotas.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No hay reportes de mascotas en este momento.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {mascotas.map((m) => (
            <Tarjeta key={m.id} className="flex gap-3 p-3.5">
              {m.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.fotoUrl} alt={m.nombre ?? "Mascota"} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-black/[.05] text-3xl">
                  {ICONO_ESPECIE[m.especie] ?? "🐾"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold">{m.nombre || "Sin nombre"} {ICONO_ESPECIE[m.especie]}</p>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                      m.tipo === "PERDIDA" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {m.tipo === "PERDIDA" ? "Perdida" : "Encontrada"}
                  </span>
                </div>
                {m.raza && <p className="text-xs text-muted">{m.raza}</p>}
                <p className="mt-1 text-xs text-foreground">{m.descripcion}</p>
                <p className="mt-1 text-xs text-muted">
                  📍 {m.direccion}, {m.municipio}
                </p>
                <p className="mt-1 text-xs font-semibold text-primary">
                  Contactar a {m.contactoNombre}: {m.contactoTelefono}
                </p>
              </div>
            </Tarjeta>
          ))}
        </div>
      )}
    </div>
  );
}
