"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { crearIconoMarcador } from "./icono";
import { Boton } from "@/components/ui/campos";

const CENTRO_DEFECTO: [number, number] = [4.5709, -74.2973]; // Colombia

interface DireccionEncontrada {
  direccion: string;
  municipio: string;
  departamento: string;
}

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  onDireccionEncontrada?: (direccion: DireccionEncontrada) => void;
}

function ManejadorClicMapa({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function SelectorUbicacion({ lat, lng, onChange, onDireccionEncontrada }: Props) {
  const [buscando, setBuscando] = useState(false);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  const [errorGeo, setErrorGeo] = useState<string | null>(null);
  const posicion: [number, number] = lat !== null && lng !== null ? [lat, lng] : CENTRO_DEFECTO;

  const buscarDireccion = useCallback(
    async (la: number, lo: number) => {
      if (!onDireccionEncontrada) return;
      setBuscandoDireccion(true);
      try {
        const res = await fetch(`/api/geocode/reverse?lat=${la}&lng=${lo}`);
        if (res.ok) {
          const data = await res.json();
          onDireccionEncontrada(data);
        }
      } catch {
        // Si falla, la persona simplemente completa la dirección a mano.
      } finally {
        setBuscandoDireccion(false);
      }
    },
    [onDireccionEncontrada],
  );

  const manejarCambioUbicacion = useCallback(
    (la: number, lo: number) => {
      onChange(la, lo);
      buscarDireccion(la, lo);
    },
    [onChange, buscarDireccion],
  );

  const usarMiUbicacion = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorGeo("Tu navegador no soporta geolocalización");
      return;
    }
    setBuscando(true);
    setErrorGeo(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        manejarCambioUbicacion(pos.coords.latitude, pos.coords.longitude);
        setBuscando(false);
      },
      () => {
        setErrorGeo("No pudimos obtener tu ubicación. Selecciónala en el mapa.");
        setBuscando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [manejarCambioUbicacion]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm text-muted">Toca el mapa para marcar el punto exacto</p>
        <Boton type="button" variante="secundario" className="w-auto px-3 py-2 text-sm" onClick={usarMiUbicacion} disabled={buscando}>
          {buscando ? "Ubicando…" : "📍 Mi ubicación"}
        </Boton>
      </div>
      {errorGeo && <p className="mb-2 text-sm text-emergency">{errorGeo}</p>}
      <div className="h-64 w-full overflow-hidden rounded-xl border border-border">
        <MapContainer center={posicion} zoom={lat !== null ? 15 : 6} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ManejadorClicMapa onChange={manejarCambioUbicacion} />
          {lat !== null && lng !== null && <Marker position={[lat, lng]} icon={crearIconoMarcador()} />}
        </MapContainer>
      </div>
      {lat !== null && lng !== null && (
        <p className="mt-1.5 text-xs text-muted">
          Coordenadas: {lat.toFixed(5)}, {lng.toFixed(5)}
          {buscandoDireccion && " · buscando dirección…"}
        </p>
      )}
    </div>
  );
}
