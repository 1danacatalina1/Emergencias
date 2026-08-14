"use client";

import { useState } from "react";
import { Boton, Campo, Etiqueta, Seleccion, Tarjeta } from "@/components/ui/campos";
import { InsigniaEstado } from "@/components/ui/insignias";
import { INSUMOS_SUGERIDOS, UNIDADES_SUGERIDAS } from "@/lib/catalogos";
import { formatearFechaHora } from "@/lib/fecha";
import type { PrefillEnvio } from "./EnviosPanel";

interface PuntoOpcion {
  id: string;
  nombre: string;
  municipio: string;
}

interface Solicitud {
  id: string;
  codigo: string;
  insumo: string;
  cantidad: number;
  unidad: string | null;
  notas: string | null;
  estado: string;
  createdAt: string;
  donationPoint: { id: string; nombre: string; municipio: string; telefonoContacto: string };
  envio: { id: string; codigo: string } | null;
}

export default function SolicitudesInsumoPanel({
  solicitudesIniciales,
  puntos,
  onResponder,
}: {
  solicitudesIniciales: Solicitud[];
  puntos: PuntoOpcion[];
  onResponder: (prefill: PrefillEnvio) => void;
}) {
  const [solicitudes, setSolicitudes] = useState(solicitudesIniciales);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [donationPointId, setDonationPointId] = useState(puntos[0]?.id ?? "");
  const [insumo, setInsumo] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("unidades");
  const [notas, setNotas] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abiertas = solicitudes.filter((s) => s.estado === "ABIERTA");
  const resueltas = solicitudes.filter((s) => s.estado !== "ABIERTA");

  async function crearSolicitud(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/solicitudes-insumo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationPointId, insumo, cantidad: Number(cantidad), unidad: unidad || undefined, notas: notas || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la solicitud");
        return;
      }
      setSolicitudes((prev) => [data, ...prev]);
      setInsumo("");
      setCantidad("");
      setNotas("");
      setMostrarFormulario(false);
    } catch {
      setError("Ocurrió un error de conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  async function cancelar(id: string) {
    if (!window.confirm("¿Cancelar esta solicitud?")) return;
    setSolicitudes((prev) => prev.map((s) => (s.id === id ? { ...s, estado: "CANCELADA" } : s)));
    await fetch(`/api/solicitudes-insumo/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "CANCELADA" }),
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-4">
      <datalist id="insumos-solicitud">
        {INSUMOS_SUGERIDOS.map((i) => <option key={i} value={i} />)}
      </datalist>
      <datalist id="unidades-solicitud">
        {UNIDADES_SUGERIDAS.map((u) => <option key={u} value={u} />)}
      </datalist>

      {puntos.length === 0 ? (
        <Tarjeta className="p-4 text-sm text-muted">Registra primero un punto de acopio para poder publicar solicitudes.</Tarjeta>
      ) : !mostrarFormulario ? (
        <Boton type="button" className="w-auto px-4" onClick={() => setMostrarFormulario(true)}>
          + Solicitar un insumo
        </Boton>
      ) : (
        <Tarjeta className="p-4">
          <form onSubmit={crearSolicitud} className="flex flex-col gap-3">
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{error}</div>}
            <div>
              <Etiqueta htmlFor="punto-solicitante">Punto de acopio que necesita el insumo *</Etiqueta>
              <Seleccion id="punto-solicitante" value={donationPointId} onChange={(e) => setDonationPointId(e.target.value)} required>
                {puntos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} — {p.municipio}</option>
                ))}
              </Seleccion>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input list="insumos-solicitud" placeholder="Insumo *" value={insumo} onChange={(e) => setInsumo(e.target.value)} required className="rounded-xl border border-border px-4 py-3 text-base sm:col-span-1" />
              <Campo type="number" min={1} placeholder="Cantidad *" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
              <input list="unidades-solicitud" placeholder="Unidad" value={unidad} onChange={(e) => setUnidad(e.target.value)} className="rounded-xl border border-border px-4 py-3 text-base" />
            </div>
            <Campo placeholder="Notas (opcional)" value={notas} onChange={(e) => setNotas(e.target.value)} />
            <div className="flex gap-2">
              <Boton type="submit" className="w-auto px-5" disabled={enviando}>
                {enviando ? "Guardando…" : "Publicar solicitud"}
              </Boton>
              <Boton type="button" variante="fantasma" className="w-auto px-5" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </Boton>
            </div>
          </form>
        </Tarjeta>
      )}

      <div>
        <h3 className="text-sm font-bold">Solicitudes abiertas ({abiertas.length})</h3>
        <div className="mt-2 flex flex-col gap-2">
          {abiertas.length === 0 && <p className="text-sm text-muted">Ningún punto de acopio tiene solicitudes abiertas.</p>}
          {abiertas.map((s) => (
            <Tarjeta key={s.id} className="border-primary/30 bg-primary/5 p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-bold text-primary">{s.codigo}</p>
                  <p className="text-sm font-bold">{s.cantidad} {s.unidad ?? ""} de {s.insumo}</p>
                  <p className="text-xs text-muted">
                    Necesita: <span className="font-semibold">{s.donationPoint.nombre}</span> — {s.donationPoint.municipio} · {s.donationPoint.telefonoContacto}
                  </p>
                  {s.notas && <p className="mt-1 text-xs italic text-muted">{s.notas}</p>}
                  <p className="mt-1 text-xs text-muted">Publicada {formatearFechaHora(s.createdAt)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Boton
                    type="button"
                    className="w-auto px-3 py-1.5 text-xs"
                    onClick={() => onResponder({
                      destinatarioNombre: s.donationPoint.nombre,
                      destinoLugar: s.donationPoint.nombre,
                      destinoMunicipio: s.donationPoint.municipio,
                      items: [{ insumo: s.insumo, cantidad: String(s.cantidad), unidad: s.unidad ?? "unidades" }],
                      solicitudInsumoId: s.id,
                    })}
                  >
                    Responder con un envío
                  </Boton>
                  <button type="button" onClick={() => cancelar(s.id)} className="text-xs font-medium text-emergency">
                    Cancelar solicitud
                  </button>
                </div>
              </div>
            </Tarjeta>
          ))}
        </div>
      </div>

      {resueltas.length > 0 && (
        <div>
          <h3 className="text-sm font-bold">Historial ({resueltas.length})</h3>
          <div className="mt-2 flex flex-col gap-2">
            {resueltas.map((s) => (
              <Tarjeta key={s.id} className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm">{s.cantidad} {s.unidad ?? ""} de {s.insumo} — {s.donationPoint.nombre}</p>
                    {s.envio && <p className="text-xs text-muted">Resuelta con el envío {s.envio.codigo}</p>}
                  </div>
                  <InsigniaEstado estado={s.estado} />
                </div>
              </Tarjeta>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
