"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { crearIconoMarcador } from "./icono";
import { TIPOS_COLABORADOR } from "@/lib/catalogos";

export interface UbicacionUsuarioMapa {
  id: string;
  name: string;
  tipoColaborador: string | null;
  telefono: string | null;
  ubicacionLat: number;
  ubicacionLng: number;
  ubicacionActualizadaEn: string;
}

const CENTRO_DEFECTO: [number, number] = [4.5709, -74.2973];
const COLOR_EQUIPO = "#7c3aed";

function etiquetaColaborador(tipo: string | null) {
  return TIPOS_COLABORADOR.find((t) => t.value === tipo)?.label ?? "Colaborador";
}

function haceCuanto(iso: string) {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutos < 1) return "hace instantes";
  if (minutos < 60) return `hace ${minutos} min`;
  return `hace ${Math.round(minutos / 60)} h`;
}

function estaDesactualizado(iso: string) {
  return Date.now() - new Date(iso).getTime() > 30 * 60_000;
}

export default function MapaEquipo({ usuarios }: { usuarios: UbicacionUsuarioMapa[] }) {
  const centro: [number, number] = usuarios.length > 0 ? [usuarios[0]!.ubicacionLat, usuarios[0]!.ubicacionLng] : CENTRO_DEFECTO;

  return (
    <MapContainer center={centro} zoom={usuarios.length > 0 ? 11 : 6} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {usuarios.map((u) => {
        const desactualizado = estaDesactualizado(u.ubicacionActualizadaEn);
        return (
          <Marker key={u.id} position={[u.ubicacionLat, u.ubicacionLng]} icon={crearIconoMarcador(desactualizado ? "#9ca3af" : COLOR_EQUIPO)}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-bold">{u.name}</p>
                <p className="text-xs text-muted">{etiquetaColaborador(u.tipoColaborador)}</p>
                {u.telefono && <p className="mt-1 text-xs">📞 {u.telefono}</p>}
                <p className={`mt-1 text-xs ${desactualizado ? "font-semibold text-amber-700" : "text-muted"}`}>
                  {desactualizado ? "⚠️ Sin actualizar hace más de 30 min · " : ""}
                  {haceCuanto(u.ubicacionActualizadaEn)}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
