"use client";

import dynamic from "next/dynamic";

const MiUbicacionMapa = dynamic(() => import("./MiUbicacionMapa"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-black/[.03] text-sm text-muted">
      Cargando mapa…
    </div>
  ),
});

export default MiUbicacionMapa;
