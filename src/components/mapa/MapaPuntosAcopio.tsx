"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { crearIconoMarcador } from "./icono";

export interface PuntoAcopioMapa {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  direccion: string;
  municipio: string;
  latitud: number;
  longitud: number;
  telefonoContacto: string;
  horario: string | null;
  tiposAceptados: string[];
}

const CENTRO_DEFECTO: [number, number] = [4.5709, -74.2973];
const COLOR_PUNTO_ACOPIO = "#16a34a";

export default function MapaPuntosAcopio({ puntos }: { puntos: PuntoAcopioMapa[] }) {
  const centro: [number, number] = puntos.length > 0 ? [puntos[0]!.latitud, puntos[0]!.longitud] : CENTRO_DEFECTO;

  return (
    <MapContainer center={centro} zoom={puntos.length > 0 ? 12 : 6} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {puntos.map((p) => (
        <Marker key={p.id} position={[p.latitud, p.longitud]} icon={crearIconoMarcador(COLOR_PUNTO_ACOPIO)}>
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-mono text-xs font-bold text-primary">{p.codigo}</p>
              <p className="mt-1 font-bold">{p.nombre}</p>
              <p className="mt-1 text-xs text-muted">{p.direccion}, {p.municipio}</p>
              {p.horario && <p className="mt-1 text-xs">🕒 {p.horario}</p>}
              <p className="mt-1 text-xs">📞 {p.telefonoContacto}</p>
              <p className="mt-1 text-xs">{p.tiposAceptados.join(", ")}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
