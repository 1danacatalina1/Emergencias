"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { crearIconoMarcador, COLOR_POR_PRIORIDAD } from "./icono";
import { InsigniaEstado, InsigniaPrioridad } from "@/components/ui/insignias";

export interface IncidenteMapa {
  id: string;
  codigo: string;
  tipo: string | null;
  descripcion: string;
  direccion: string;
  municipio: string;
  latitud: number;
  longitud: number;
  nivelPrioridad: string;
  estado: string;
}

const CENTRO_DEFECTO: [number, number] = [4.5709, -74.2973];

export default function MapaIncidentes({ incidentes }: { incidentes: IncidenteMapa[] }) {
  const centro: [number, number] =
    incidentes.length > 0 ? [incidentes[0]!.latitud, incidentes[0]!.longitud] : CENTRO_DEFECTO;

  return (
    <MapContainer center={centro} zoom={incidentes.length > 0 ? 12 : 6} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {incidentes.map((inc) => (
        <Marker
          key={inc.id}
          position={[inc.latitud, inc.longitud]}
          icon={crearIconoMarcador(COLOR_POR_PRIORIDAD[inc.nivelPrioridad] ?? "#14406b")}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-mono text-xs font-bold text-primary">{inc.codigo}</p>
              <p className="mt-1 font-bold">{inc.tipo}</p>
              <p className="mt-1 text-sm">{inc.descripcion}</p>
              <p className="mt-1 text-xs text-muted">{inc.direccion}, {inc.municipio}</p>
              <div className="mt-2 flex gap-1.5">
                <InsigniaPrioridad prioridad={inc.nivelPrioridad} />
                <InsigniaEstado estado={inc.estado} />
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
