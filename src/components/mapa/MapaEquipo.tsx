"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { Marker as LeafletMarker } from "leaflet";
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

function EnfocarUsuario({
  usuarios,
  enfocarId,
  enfocarToken,
  marcadores,
}: {
  usuarios: UbicacionUsuarioMapa[];
  enfocarId: string | null | undefined;
  enfocarToken: number | undefined;
  marcadores: React.RefObject<Record<string, LeafletMarker>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!enfocarId) return;
    const usuario = usuarios.find((u) => u.id === enfocarId);
    if (!usuario) return;
    map.flyTo([usuario.ubicacionLat, usuario.ubicacionLng], 15, { duration: 1 });
    marcadores.current[enfocarId]?.openPopup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enfocarId, enfocarToken]);

  return null;
}

export default function MapaEquipo({
  usuarios,
  enfocarId,
  enfocarToken,
}: {
  usuarios: UbicacionUsuarioMapa[];
  enfocarId?: string | null;
  enfocarToken?: number;
}) {
  const centro: [number, number] = usuarios.length > 0 ? [usuarios[0]!.ubicacionLat, usuarios[0]!.ubicacionLng] : CENTRO_DEFECTO;
  const marcadores = useRef<Record<string, LeafletMarker>>({});

  return (
    <MapContainer center={centro} zoom={usuarios.length > 0 ? 11 : 6} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <EnfocarUsuario usuarios={usuarios} enfocarId={enfocarId} enfocarToken={enfocarToken} marcadores={marcadores} />
      {usuarios.map((u) => {
        const desactualizado = estaDesactualizado(u.ubicacionActualizadaEn);
        return (
          <Marker
            key={u.id}
            position={[u.ubicacionLat, u.ubicacionLng]}
            icon={crearIconoMarcador(desactualizado ? "#9ca3af" : COLOR_EQUIPO)}
            ref={(marcador) => {
              if (marcador) marcadores.current[u.id] = marcador;
              else delete marcadores.current[u.id];
            }}
          >
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
