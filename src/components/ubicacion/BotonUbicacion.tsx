"use client";

import { useUbicacion } from "./UbicacionContext";

export default function BotonUbicacion({ className = "", oscuro = false }: { className?: string; oscuro?: boolean }) {
  const { compartiendo, cargando, error, activar, desactivar } = useUbicacion();

  return (
    <div className={`relative flex shrink-0 items-center gap-2 ${className}`}>
      <span className={`text-sm font-semibold ${oscuro ? "text-white" : "text-foreground"}`}>Mi ubicación</span>
      <button
        type="button"
        role="switch"
        aria-checked={compartiendo}
        aria-label="Compartir mi ubicación en tiempo real"
        disabled={cargando}
        onClick={() => (compartiendo ? desactivar() : activar())}
        title={compartiendo ? "Dejar de compartir mi ubicación" : "Compartir mi ubicación en tiempo real"}
        className={`relative h-6 w-11 shrink-0 rounded-full shadow-inner transition disabled:opacity-50 ${
          compartiendo ? "bg-success" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            compartiendo ? "left-5" : "left-0.5"
          }`}
        />
      </button>
      {error && (
        <p className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg bg-emergency px-2 py-1 text-xs font-medium text-white shadow-lg">
          {error}
        </p>
      )}
    </div>
  );
}
