"use client";

import { useUbicacion } from "./UbicacionContext";

export default function BotonUbicacion({ className = "" }: { className?: string }) {
  const { compartiendo, cargando, error, activar, desactivar } = useUbicacion();

  return (
    <div className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => (compartiendo ? desactivar() : activar())}
        disabled={cargando}
        title={compartiendo ? "Dejar de compartir mi ubicación" : "Compartir mi ubicación en tiempo real"}
        className={`flex w-full items-center justify-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold shadow active:scale-95 disabled:opacity-60 ${
          compartiendo ? "bg-success text-white" : "bg-black/[.08] text-foreground"
        }`}
      >
        📍 {cargando ? "…" : compartiendo ? "Activa" : "Ubicación"}
      </button>
      {error && (
        <p className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg bg-emergency px-2 py-1 text-xs font-medium text-white shadow-lg">
          {error}
        </p>
      )}
    </div>
  );
}
