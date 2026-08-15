"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const INTERVALO_CRUCERO_MS = 120_000;
const INTERVALO_SOS_MS = 20_000;

interface UbicacionContextValor {
  compartiendo: boolean;
  cargando: boolean;
  error: string | null;
  ultimaActualizacion: number | null;
  posicion: { lat: number; lng: number } | null;
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

function obtenerPosicion(altaPrecision: boolean): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: altaPrecision,
      timeout: 15_000,
      maximumAge: altaPrecision ? 0 : 60_000,
    });
  });
}

async function tengoSOSActiva(): Promise<boolean> {
  try {
    const res = await fetch("/api/sos/mi-estado");
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.activa;
  } catch {
    return false;
  }
}

export function UbicacionProvider({
  compartiendoInicial,
  posicionInicial,
  children,
}: {
  compartiendoInicial: boolean;
  posicionInicial?: { lat: number; lng: number } | null;
  children: React.ReactNode;
}) {
  const [compartiendo, setCompartiendo] = useState(compartiendoInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<number | null>(null);
  const [posicion, setPosicion] = useState<{ lat: number; lng: number } | null>(posicionInicial ?? null);
  const activoRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const detenerSeguimiento = useCallback(() => {
    activoRef.current = false;
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const desactivar = useCallback(() => {
    detenerSeguimiento();
    setCompartiendo(false);
    setUltimaActualizacion(null);
    setPosicion(null);
    enviarUbicacion(false);
  }, [detenerSeguimiento]);

  const activar = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no permite compartir la ubicación.");
      return;
    }
    setCargando(true);
    setError(null);
    activoRef.current = true;

    async function ciclo(primeraVez: boolean) {
      const sosActiva = await tengoSOSActiva();
      if (!activoRef.current) return;
      const altaPrecision = primeraVez || sosActiva;

      try {
        const posicionGeo = await obtenerPosicion(altaPrecision);
        if (!activoRef.current) return;
        setCargando(false);
        setCompartiendo(true);
        setError(null);
        const ahora = Date.now();
        setUltimaActualizacion(ahora);
        setPosicion({ lat: posicionGeo.coords.latitude, lng: posicionGeo.coords.longitude });
        await enviarUbicacion(true, posicionGeo.coords.latitude, posicionGeo.coords.longitude);
      } catch {
        if (primeraVez) {
          setCargando(false);
          setError("No pudimos acceder a tu ubicación. Revisa los permisos de ubicación de tu navegador.");
          activoRef.current = false;
          return;
        }
        // Errores intermitentes de GPS en ciclos posteriores se ignoran; el último punto conocido sigue vigente.
      }

      if (!activoRef.current) return;
      timeoutRef.current = setTimeout(() => ciclo(false), sosActiva ? INTERVALO_SOS_MS : INTERVALO_CRUCERO_MS);
    }

    ciclo(true);
  }, []);

  useEffect(() => detenerSeguimiento, [detenerSeguimiento]);

  return (
    <UbicacionContext.Provider value={{ compartiendo, cargando, error, ultimaActualizacion, posicion, activar, desactivar }}>
      {children}
    </UbicacionContext.Provider>
  );
}

export function useUbicacion() {
  const contexto = useContext(UbicacionContext);
  if (!contexto) throw new Error("useUbicacion debe usarse dentro de UbicacionProvider");
  return contexto;
}
