"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const INTERVALO_MS = 12_000;

export default function BannerSOSActivo() {
  const pathname = usePathname();
  const [cantidad, setCantidad] = useState(0);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      const res = await fetch("/api/sos?estado=ACTIVA");
      if (!res.ok || !activo) return;
      const data = await res.json();
      if (activo) setCantidad(Array.isArray(data) ? data.length : 0);
    }
    cargar();
    const intervalo = setInterval(cargar, INTERVALO_MS);
    return () => { activo = false; clearInterval(intervalo); };
  }, []);

  if (cantidad === 0 || pathname === "/panel/sos") return null;

  return (
    <Link
      href="/panel/sos"
      className="flex animate-pulse items-center justify-center gap-2 bg-emergency px-4 py-2 text-center text-sm font-bold text-white"
    >
      🆘 {cantidad === 1 ? "Hay 1 alerta SOS activa" : `Hay ${cantidad} alertas SOS activas`} — Ver detalles
    </Link>
  );
}
