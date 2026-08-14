"use client";

import { useUbicacion } from "@/components/ubicacion/UbicacionContext";
import { Boton, Tarjeta } from "@/components/ui/campos";
import MiUbicacionMapa from "@/components/mapa/MiUbicacionMapaDinamico";

function haceCuanto(timestamp: number) {
  const segundos = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (segundos < 60) return "hace unos segundos";
  const minutos = Math.round(segundos / 60);
  return `hace ${minutos} min`;
}

export default function MiUbicacionPanel() {
  const { compartiendo, cargando, error, ultimaActualizacion, posicion, activar, desactivar } = useUbicacion();

  return (
    <div className="mt-5 flex max-w-md flex-col gap-4">
      <Tarjeta className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold">Compartir mi ubicación en tiempo real</p>
            <p className="mt-1 text-sm text-muted">
              Permite que Administración y Coordinación te ubiquen en el mapa mientras haces trabajo de
              campo, para poder asistirte si lo necesitas.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={compartiendo}
            disabled={cargando}
            onClick={() => (compartiendo ? desactivar() : activar())}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${compartiendo ? "bg-primary" : "bg-black/[.15]"} disabled:opacity-50`}
          >
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${compartiendo ? "left-5" : "left-0.5"}`} />
          </button>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-emergency">{error}</p>}

        {compartiendo && (
          <div className="mt-3 rounded-lg bg-primary/5 p-3 text-xs text-muted">
            <p className="font-semibold text-primary">Ubicación activa</p>
            <p className="mt-1">
              {ultimaActualizacion
                ? `Última actualización enviada ${haceCuanto(ultimaActualizacion)}.`
                : "Puede que necesites volver a activarla en este dispositivo para reanudar el envío."}
            </p>
            <p className="mt-1">
              Solo se actualiza mientras tienes el panel abierto en tu navegador y diste permiso de
              ubicación.
            </p>
            {!ultimaActualizacion && (
              <Boton type="button" variante="secundario" className="mt-2 w-auto px-3 py-1.5 text-xs" onClick={activar}>
                Reanudar envío de ubicación
              </Boton>
            )}
          </div>
        )}
      </Tarjeta>

      {compartiendo && posicion && (
        <Tarjeta className="overflow-hidden p-0">
          <div className="h-56 w-full">
            <MiUbicacionMapa lat={posicion.lat} lng={posicion.lng} />
          </div>
          <p className="p-3 text-xs text-muted">
            Así es como te ve el equipo de coordinación en este momento. Actualiza automáticamente
            mientras te mueves.
          </p>
        </Tarjeta>
      )}

      {!compartiendo && (
        <Tarjeta className="p-4 text-center text-sm text-muted">
          No estás compartiendo tu ubicación. Actívala arriba cuando salgas a hacer trabajo de campo.
        </Tarjeta>
      )}
    </div>
  );
}
