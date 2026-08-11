"use client";

import { useState } from "react";
import { Boton, Campo, Etiqueta, Tarjeta } from "@/components/ui/campos";
import { formatearFechaHora } from "@/lib/fecha";
import BotonEliminar from "@/components/ui/BotonEliminar";

interface Llave {
  id: string;
  nombre: string;
  prefijo: string;
  activa: boolean;
  ultimoUsoEn: string | null;
  expiraEn: string | null;
  createdAt: string;
  creadoPor: { name: string } | null;
}

export default function IntegracionesPanel({ llavesIniciales }: { llavesIniciales: Llave[] }) {
  const [llaves, setLlaves] = useState(llavesIniciales);
  const [nombre, setNombre] = useState("");
  const [expiraEn, setExpiraEn] = useState("");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [llaveNueva, setLlaveNueva] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  async function crearLlave(e: React.FormEvent) {
    e.preventDefault();
    setCreando(true);
    setError(null);
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, expiraEn: expiraEn || undefined }),
    });
    const data = await res.json();
    setCreando(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la llave");
      return;
    }
    setLlaveNueva(data.llave);
    setNombre("");
    setExpiraEn("");
    setLlaves((prev) => [
      {
        id: data.id,
        nombre: data.nombre,
        prefijo: data.llave.slice(0, 19),
        activa: true,
        ultimoUsoEn: null,
        expiraEn: null,
        createdAt: new Date().toISOString(),
        creadoPor: null,
      },
      ...prev,
    ]);
  }

  function copiarLlave() {
    if (!llaveNueva) return;
    navigator.clipboard.writeText(llaveNueva).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  return (
    <div className="mt-5 flex flex-col gap-5">
      <Tarjeta className="p-4">
        <h2 className="font-bold">Cómo la consume un sistema externo</h2>
        <p className="mt-1 text-sm text-muted">
          El sistema externo debe enviar el token en cada solicitud, en el encabezado{" "}
          <code className="rounded bg-black/[.05] px-1 py-0.5 text-xs">Authorization: Bearer &lt;token&gt;</code>.
        </p>
        <div className="mt-2 flex flex-col gap-1 rounded-lg bg-black/[.03] p-3 font-mono text-xs">
          <span>GET {baseUrl}/api/external/v1/incidents</span>
          <span>GET {baseUrl}/api/external/v1/incidents/&lt;id&gt;</span>
          <span>GET {baseUrl}/api/external/v1/stats</span>
        </div>
        <p className="mt-2 text-xs text-muted">
          El listado de incidentes admite los parámetros <code>?limit=</code>, <code>?pagina=</code>,{" "}
          <code>?estado=</code> y <code>?actualizadoDesde=2026-01-01T00:00:00Z</code> para traer solo lo
          que cambió desde la última consulta.
        </p>
      </Tarjeta>

      <Tarjeta className="p-4">
        <h2 className="font-bold">Crear nueva llave</h2>
        {error && <div className="mt-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{error}</div>}

        {llaveNueva ? (
          <div className="mt-3 rounded-xl border border-warning/40 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-900">
              Copia esta llave ahora — no se volverá a mostrar completa.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-lg bg-white p-2 text-xs">{llaveNueva}</code>
              <Boton type="button" variante="secundario" className="w-auto px-3 py-2 text-xs" onClick={copiarLlave}>
                {copiado ? "Copiado ✓" : "Copiar"}
              </Boton>
            </div>
            <Boton type="button" variante="fantasma" className="mt-2 w-auto px-3 py-1.5 text-xs" onClick={() => setLlaveNueva(null)}>
              Ya la guardé
            </Boton>
          </div>
        ) : (
          <form onSubmit={crearLlave} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Etiqueta htmlFor="nombre-llave">Nombre (para quién es)</Etiqueta>
              <Campo
                id="nombre-llave"
                placeholder="Ej: UNGRD - integración nacional"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div>
              <Etiqueta htmlFor="expira-llave">Expira (opcional)</Etiqueta>
              <Campo id="expira-llave" type="date" value={expiraEn} onChange={(e) => setExpiraEn(e.target.value)} />
            </div>
            <Boton type="submit" className="w-auto px-5" disabled={creando}>
              {creando ? "Creando…" : "Crear llave"}
            </Boton>
          </form>
        )}
      </Tarjeta>

      <div>
        <h2 className="font-bold">Llaves existentes ({llaves.length})</h2>
        <div className="mt-3 flex flex-col gap-2">
          {llaves.map((k) => (
            <Tarjeta key={k.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
              <div className="min-w-0">
                <p className="text-sm font-bold">{k.nombre}</p>
                <p className="font-mono text-xs text-muted">{k.prefijo}…</p>
                <p className="mt-1 text-xs text-muted">
                  Creada {formatearFechaHora(k.createdAt)}
                  {k.creadoPor && ` por ${k.creadoPor.name}`}
                  {k.ultimoUsoEn ? ` · Último uso: ${formatearFechaHora(k.ultimoUsoEn)}` : " · Sin uso todavía"}
                  {k.expiraEn && ` · Expira: ${formatearFechaHora(k.expiraEn)}`}
                </p>
              </div>
              <BotonEliminar
                endpoint={`/api/api-keys/${k.id}`}
                mensajeConfirmacion={`¿Revocar la llave "${k.nombre}"? El sistema que la use dejará de tener acceso de inmediato.`}
                onEliminado={() => setLlaves((prev) => prev.filter((x) => x.id !== k.id))}
              />
            </Tarjeta>
          ))}
          {llaves.length === 0 && <p className="text-sm text-muted">Aún no se han creado llaves de integración.</p>}
        </div>
      </div>
    </div>
  );
}
