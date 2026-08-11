"use client";

import dynamic from "next/dynamic";

const MapaPuntosAcopio = dynamic(() => import("./MapaPuntosAcopio"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-black/[.03] text-sm text-muted">
      Cargando mapa…
    </div>
  ),
});

export default MapaPuntosAcopio;
