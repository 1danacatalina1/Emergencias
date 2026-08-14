"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const INTERVALO_MINIMO_MS = 20_000;

interface UbicacionContextValor {
  compartiendo: boolean;
  cargando: boolean;
  error: string | null;
  ultimaActualizacion: number | null;
  activar: () => void;
  desactivar: () => void;
}

const UbicacionContext = createContext<UbicacionContextValor | null>(null);

async function enviarUbicacion(compartir: boolean, latitud?: number, longitud?: number) {
  await fetch("/api/account/ubicacion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ compartir, latitud, longitud }),
  });
}

export function UbicacionProvider({
  compartiendoInicial,
  children,
}: {
  compartiendoInicial: boolean;
  children: React.ReactNode;
}) {
  const [compartiendo, setCompartiendo] = useState(compartiendoInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const ultimoEnvioRef = useRef(0);

  const detenerSeguimiento = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const desactivar = useCallback(() => {
    detenerSeguimiento();
    setCompartiendo(false);
    setUltimaActualizacion(null);
    enviarUbicacion(false);
  }, [detenerSeguimiento]);

  const activar = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no permite compartir la ubicación.");
      return;
    }
    setCargando(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        setCargando(false);
        setCompartiendo(true);
        setUltimaActualizacion(Date.now());
        ultimoEnvioRef.current = Date.now();
        await enviarUbicacion(true, posicion.coords.latitude, posicion.coords.longitude);

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const ahora = Date.now();
            if (ahora - ultimoEnvioRef.current < INTERVALO_MINIMO_MS) return;
            ultimoEnvioRef.current = ahora;
            setUltimaActualizacion(ahora);
            enviarUbicacion(true, pos.coords.latitude, pos.coords.longitude);
          },
          () => { /* errores intermitentes de GPS se ignoran; el último punto conocido sigue vigente */ },
          { enableHighAccuracy: true, maximumAge: 15_000 },
        );
      },
      () => {
        setCargando(false);
        setError("No pudimos acceder a tu ubicación. Revisa los permisos de ubicación de tu navegador.");
      },
      { enableHighAccuracy: true },
    );
  }, []);

  useEffect(() => detenerSeguimiento, [detenerSeguimiento]);

  return (
    <UbicacionContext.Provider value={{ compartiendo, cargando, error, ultimaActualizacion, activar, desactivar }}>
      {children}
    </UbicacionContext.Provider>
  );
}

export function useUbicacion() {
  const contexto = useContext(UbicacionContext);
  if (!contexto) throw new Error("useUbicacion debe usarse dentro de UbicacionProvider");
  return contexto;
}
