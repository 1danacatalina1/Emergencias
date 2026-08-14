"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/campos";

type Tipo = "PERSONAL" | "LABOR";

function obtenerPosicionActual(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 6000 },
    );
  });
}

export default function BotonSOS({ className = "" }: { className?: string }) {
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cerrar() {
    setAbierto(false);
    setTipo(null);
    setNota("");
    setEnviado(false);
    setError(null);
  }

  async function enviarSOS() {
    if (!tipo) return;
    setEnviando(true);
    setError(null);
    try {
      const posicion = await obtenerPosicionActual();
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          nota: nota || undefined,
          latitud: posicion?.lat,
          longitud: posicion?.lng,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo enviar la alerta. Intenta de nuevo o llama directamente.");
        return;
      }
      setEnviado(true);
    } catch {
      setError("Ocurrió un error de conexión. Intenta de nuevo o llama directamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={`flex shrink-0 items-center gap-1 rounded-full bg-emergency px-3 py-1.5 text-sm font-bold text-white shadow active:scale-95 ${className}`}
      >
        🆘 SOS
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-sm rounded-t-2xl bg-surface p-5 sm:rounded-2xl">
            {enviado ? (
              <div className="text-center">
                <p className="text-4xl">✅</p>
                <h2 className="mt-3 text-lg font-bold">Alerta enviada</h2>
                <p className="mt-2 text-sm text-muted">
                  Se notificó de inmediato a Administración y Coordinación. Mantén tu teléfono a la mano.
                </p>
                <Boton type="button" className="mt-5" onClick={cerrar}>
                  Cerrar
                </Boton>
              </div>
            ) : (
              <>
                <p className="text-3xl">🆘</p>
                <h2 className="mt-2 text-lg font-bold text-emergency">Botón de emergencia</h2>
                <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-emergency">
                  Solo debes tocar este botón si tú o la labor que estás realizando necesita auxilio
                  inmediato. Se notificará de inmediato a Administración y Coordinación.
                </p>

                <p className="mt-4 text-sm font-semibold">¿Para quién necesitas auxilio?</p>
                <div className="mt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo("PERSONAL")}
                    className={`rounded-xl border p-3 text-left text-sm font-semibold ${tipo === "PERSONAL" ? "border-emergency bg-red-50 text-emergency" : "border-border"}`}
                  >
                    Auxilio para mí
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo("LABOR")}
                    className={`rounded-xl border p-3 text-left text-sm font-semibold ${tipo === "LABOR" ? "border-emergency bg-red-50 text-emergency" : "border-border"}`}
                  >
                    Auxilio por la labor que estoy realizando
                  </button>
                </div>

                <textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Detalle breve (opcional): qué está pasando, dónde estás…"
                  rows={2}
                  className="mt-3 w-full rounded-xl border border-border p-2.5 text-sm"
                />

                {error && <p className="mt-2 text-sm font-medium text-emergency">{error}</p>}

                <div className="mt-4 flex gap-2">
                  <Boton type="button" variante="fantasma" className="flex-1" onClick={cerrar} disabled={enviando}>
                    Cancelar
                  </Boton>
                  <Boton type="button" variante="emergencia" className="flex-1" onClick={enviarSOS} disabled={!tipo || enviando}>
                    {enviando ? "Enviando…" : "Enviar alerta SOS"}
                  </Boton>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
