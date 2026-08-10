"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { crearIconoMarcador } from "./icono";
import { Boton } from "@/components/ui/campos";

const CENTRO_DEFECTO: [number, number] = [4.5709, -74.2973]; // Colombia

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

function ManejadorClicMapa({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function SelectorUbicacion({ lat, lng, onChange }: Props) {
  const [buscando, setBuscando] = useState(false);
  const [errorGeo, setErrorGeo] = useState<string | null>(null);
  const posicion: [number, number] = lat !== null && lng !== null ? [lat, lng] : CENTRO_DEFECTO;

  const usarMiUbicacion = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorGeo("Tu navegador no soporta geolocalización");
      return;
    }
    setBuscando(true);
    setErrorGeo(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setBuscando(false);
      },
      () => {
        setErrorGeo("No pudimos obtener tu ubicación. Selecciónala en el mapa.");
        setBuscando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [onChange]);

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
          <ManejadorClicMapa onChange={onChange} />
          {lat !== null && lng !== null && <Marker position={[lat, lng]} icon={crearIconoMarcador()} />}
        </MapContainer>
      </div>
      {lat !== null && lng !== null && (
        <p className="mt-1.5 text-xs text-muted">
          Coordenadas: {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}
