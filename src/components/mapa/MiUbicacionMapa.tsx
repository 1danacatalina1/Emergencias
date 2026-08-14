"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { crearIconoMarcador } from "./icono";

const COLOR_MI_UBICACION = "#7c3aed";

export default function MiUbicacionMapa({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer center={[lat, lng]} zoom={15} className="h-full w-full" dragging={false} scrollWheelZoom={false} zoomControl={false} attributionControl={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={crearIconoMarcador(COLOR_MI_UBICACION)} />
    </MapContainer>
  );
}
