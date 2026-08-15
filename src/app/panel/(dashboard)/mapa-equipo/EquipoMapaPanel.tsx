"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Boton, Campo, Tarjeta } from "@/components/ui/campos";
import { puedeGestionarUsuarios } from "@/lib/permisos";
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

interface Miembro {
  id: string;
  name: string;
  telefono: string | null;
  tipoColaborador: string | null;
  lugarAccionMunicipio: string | null;
  lugarAccionDepartamento: string | null;
  compartirUbicacion: boolean;
}

interface Coordinador {
  id: string;
  name: string;
  telefono: string | null;
  tipoColaborador: string | null;
}

export default function EquipoMapaPanel({
  rosterInicial,
  seguidosIniciales,
  coordinadores,
  misSolicitudesIniciales,
  usuarioActualId,
  rolActual,
}: {
  rosterInicial: Miembro[];
  seguidosIniciales: string[];
  coordinadores: Coordinador[];
  misSolicitudesIniciales: { coordinadorId: string; estado: string }[];
  usuarioActualId: string;
  rolActual: string;
}) {
  const esCoordinador = puedeGestionarUsuarios(rolActual);

  const [usuarios, setUsuarios] = useState<UbicacionUsuarioMapa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [soloMiEquipo, setSoloMiEquipo] = useState(false);
  const [seguidos, setSeguidos] = useState(new Set(seguidosIniciales));
  const [busqueda, setBusqueda] = useState("");
  const [misSolicitudes, setMisSolicitudes] = useState<Record<string, string>>(() =>
    Object.fromEntries(misSolicitudesIniciales.map((s) => [s.coordinadorId, s.estado])),
  );
  const [enviandoA, setEnviandoA] = useState<string | null>(null);
  const [enfoque, setEnfoque] = useState<{ id: string; token: number } | null>(null);
  const mapaRef = useRef<HTMLDivElement>(null);

  function enfocarUsuario(id: string) {
    setEnfoque((prev) => ({ id, token: (prev?.token ?? 0) + 1 }));
    mapaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

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

  async function alternarSeguido(id: string) {
    const yaSeguido = seguidos.has(id);
    setSeguidos((prev) => {
      const copia = new Set(prev);
      if (yaSeguido) copia.delete(id); else copia.add(id);
      return copia;
    });
    const res = await fetch("/api/equipo/seguidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: id }),
    });
    if (!res.ok) {
      setSeguidos((prev) => {
        const copia = new Set(prev);
        if (yaSeguido) copia.add(id); else copia.delete(id);
        return copia;
      });
    }
  }

  async function solicitarUnirse(coordinadorId: string) {
    setEnviandoA(coordinadorId);
    const res = await fetch("/api/equipo/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coordinadorId }),
    });
    if (res.ok) {
      const data = await res.json();
      setMisSolicitudes((prev) => ({ ...prev, [coordinadorId]: data.estado }));
    }
    setEnviandoA(null);
  }

  const roster = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let lista = rosterInicial;
    if (soloMiEquipo) lista = lista.filter((m) => seguidos.has(m.id));
    if (!q) return lista;
    return lista.filter((m) =>
      [m.name, etiquetaColaborador(m.tipoColaborador), m.lugarAccionMunicipio]
        .filter(Boolean)
        .some((campo) => campo!.toLowerCase().includes(q)),
    );
  }, [rosterInicial, soloMiEquipo, seguidos, busqueda]);

  return (
    <div className="mt-4 flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row">
        <div ref={mapaRef} className="h-[50vh] w-full shrink-0 overflow-hidden rounded-2xl border border-border md:h-[70vh] md:flex-1">
          <MapaEquipo usuarios={usuarios} enfocarId={enfoque?.id} enfocarToken={enfoque?.token} />
        </div>
        <div className="w-full shrink-0 md:w-72">
          <h2 className="text-sm font-bold">Compartiendo ubicación ahora ({usuarios.length})</h2>
          <p className="mt-1 text-xs text-muted">Toca un nombre para ubicarlo en el mapa.</p>
          <div className="mt-2 flex max-h-[40vh] flex-col gap-2 overflow-y-auto md:max-h-[calc(100vh-14rem)]">
            {!cargando && usuarios.length === 0 && (
              <Tarjeta className="p-3 text-xs text-muted">
                {soloMiEquipo
                  ? "Nadie de tu equipo (⭐) está compartiendo su ubicación."
                  : "Nadie está compartiendo su ubicación en este momento."}
              </Tarjeta>
            )}
            {usuarios.map((u) => (
              <Tarjeta
                key={u.id}
                role="button"
                tabIndex={0}
                onClick={() => enfocarUsuario(u.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); enfocarUsuario(u.id); } }}
                className={`cursor-pointer p-3 text-left transition ${enfoque?.id === u.id ? "border-primary bg-primary/5" : "hover:bg-black/[.02]"}`}
              >
                <p className="text-sm font-bold">📍 {u.name}</p>
                <p className="text-xs text-muted">{etiquetaColaborador(u.tipoColaborador)}</p>
                {u.telefono && <p className="mt-1 text-xs">📞 {u.telefono}</p>}
                <p className="mt-1 text-xs text-muted">Actualizado {haceCuanto(u.ubicacionActualizadaEn)}</p>
              </Tarjeta>
            ))}
          </div>
        </div>
      </div>

      {!esCoordinador && coordinadores.length > 0 && (
        <div>
          <h2 className="font-bold">Coordinadores ({coordinadores.length})</h2>
          <p className="mt-1 text-xs text-muted">
            Encuentra a tu coordinador y solicita unirte a su equipo de trabajo.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {coordinadores
              .filter((c) => c.id !== usuarioActualId)
              .map((c) => {
                const estado = misSolicitudes[c.id];
                return (
                  <Tarjeta key={c.id} className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold">{c.name}</p>
                        <p className="text-xs font-semibold text-primary">{etiquetaColaborador(c.tipoColaborador)}</p>
                        {c.telefono && <p className="mt-1 text-xs">📞 {c.telefono}</p>}
                      </div>
                      {estado === "ACEPTADO" ? (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
                          ✓ En tu equipo
                        </span>
                      ) : estado === "PENDIENTE" ? (
                        <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
                          ⏳ Solicitud enviada
                        </span>
                      ) : (
                        <Boton
                          type="button"
                          variante="secundario"
                          className="w-auto shrink-0 px-3 py-1.5 text-xs"
                          disabled={enviandoA === c.id}
                          onClick={() => solicitarUnirse(c.id)}
                        >
                          {enviandoA === c.id ? "Enviando…" : estado === "RECHAZADO" ? "Solicitar de nuevo" : "Solicitar unirme"}
                        </Boton>
                      )}
                    </div>
                  </Tarjeta>
                );
              })}
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">Usuarios registrados ({roster.length})</h2>
          {esCoordinador && (
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <input type="checkbox" checked={soloMiEquipo} onChange={(e) => setSoloMiEquipo(e.target.checked)} />
              Ver solo mi equipo ⭐
            </label>
          )}
        </div>
        {esCoordinador && (
          <p className="mt-1 text-xs text-muted">
            Marca la ⭐ de quienes quieras seguir de cerca. Los que están compartiendo su ubicación en
            este momento se ven en el mapa de arriba.
          </p>
        )}
        <Campo
          placeholder="Buscar por nombre, tipo o municipio…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mt-2"
        />
        <div className="mt-3 flex flex-col gap-2">
          {roster.length === 0 && (
            <Tarjeta className="p-4 text-sm text-muted">
              {soloMiEquipo ? "Aún no marcaste a nadie con ⭐." : "No hay usuarios registrados que coincidan."}
            </Tarjeta>
          )}
          {roster.map((m) => (
            <Tarjeta key={m.id} className="relative p-3">
              {esCoordinador && m.id !== usuarioActualId && (
                <button
                  type="button"
                  onClick={() => alternarSeguido(m.id)}
                  title={seguidos.has(m.id) ? "Quitar de mi equipo" : "Agregar a mi equipo"}
                  aria-label={seguidos.has(m.id) ? "Quitar de mi equipo" : "Agregar a mi equipo"}
                  className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none transition active:scale-90 ${
                    seguidos.has(m.id) ? "" : "border-2 border-black/70 bg-white"
                  }`}
                >
                  <span className={seguidos.has(m.id) ? "text-2xl" : "text-lg opacity-60 grayscale"}>⭐</span>
                </button>
              )}
              <div className="min-w-0 pr-10">
                <p className="text-sm font-bold">{m.name}</p>
                <p className="text-xs font-semibold text-primary">{etiquetaColaborador(m.tipoColaborador)}</p>
                {(m.lugarAccionMunicipio || m.lugarAccionDepartamento) && (
                  <p className="text-xs text-muted">
                    📍 {[m.lugarAccionMunicipio, m.lugarAccionDepartamento].filter(Boolean).join(", ")}
                  </p>
                )}
                {m.telefono && <p className="mt-1 text-xs">📞 {m.telefono}</p>}
                {m.compartirUbicacion && (
                  <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                    🟢 en vivo
                  </span>
                )}
              </div>
            </Tarjeta>
          ))}
        </div>
      </div>
    </div>
  );
}
