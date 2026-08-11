import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface DireccionNominatim {
  address?: {
    road?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    quarter?: string;
    city?: string;
    town?: string;
    municipality?: string;
    village?: string;
    county?: string;
    state?: string;
    state_district?: string;
  };
  display_name?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Faltan coordenadas" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lng);
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "es");
  url.searchParams.set("zoom", "18");

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SistemaGestionEmergencias/1.0 (https://emergencias-psi.vercel.app)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "No se pudo obtener la dirección" }, { status: 502 });
    }

    const data: DireccionNominatim = await res.json();
    const a = data.address ?? {};

    const direccion =
      [a.road, a.house_number].filter(Boolean).join(" ") ||
      a.neighbourhood ||
      a.suburb ||
      a.quarter ||
      data.display_name?.split(",")[0] ||
      "";

    const municipio = a.city || a.town || a.municipality || a.village || a.county || "";
    const departamento = a.state || a.state_district || "";

    return NextResponse.json({ direccion, municipio, departamento });
  } catch {
    return NextResponse.json({ error: "No se pudo obtener la dirección" }, { status: 502 });
  }
}
