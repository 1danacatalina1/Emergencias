"use client";

import { useState } from "react";
import { Boton, Tarjeta } from "@/components/ui/campos";
import { formatearFechaHora } from "@/lib/fecha";
import { TIPOS_COLABORADOR } from "@/lib/catalogos";

const ETIQUETAS_TIPO: Record<string, string> = {
  PERSONAL: "Auxilio para sí mismo",
  LABOR: "Auxilio por la labor que realiza",
};

function etiquetaColaborador(tipo: string | null) {
  return TIPOS_COLABORADOR.find((t) => t.value === tipo)?.label ?? null;
}

interface Alerta {
  id: string;
  tipo: "PERSONAL" | "LABOR";
  nota: string | null;
  latitud: number | null;
  longitud: number | null;
  estado: "ACTIVA" | "ATENDIDA";
  correoEnviado: boolean;
  createdAt: string;
  atendidaEn: string | null;
  autor: { id: string; name: string; telefono: string | null; tipoColaborador: string | null };
  atendidaPor: { id: string; name: string } | null;
}

function TarjetaAlerta({ alerta, onAtender }: { alerta: Alerta; onAtender: (id: string) => void }) {
  const [procesando, setProcesando] = useState(false);
  const activa = alerta.estado === "ACTIVA";
  const enlaceMapa =
    alerta.latitud != null && alerta.longitud != null
      ? `https://www.openstreetmap.org/?mlat=${alerta.latitud}&mlon=${alerta.longitud}#map=16/${alerta.latitud}/${alerta.longitud}`
      : null;

  return (
    <Tarjeta className={`p-4 ${activa ? "border-emergency/50 bg-red-50/50" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${activa ? "bg-emergency text-white" : "bg-green-100 text-green-800"}`}>
              {activa ? "🆘 Activa" : "Atendida"}
            </span>
            <span className="text-xs font-semibold text-muted">{ETIQUETAS_TIPO[alerta.tipo]}</span>
          </div>
          <p className="mt-2 text-sm font-bold">{alerta.autor.name}</p>
          <p className="text-xs text-muted">
            {etiquetaColaborador(alerta.autor.tipoColaborador)}
            {alerta.autor.telefono && ` · 📞 ${alerta.autor.telefono}`}
          </p>
          {alerta.nota && <p className="mt-2 text-sm">{alerta.nota}</p>}
          {enlaceMapa ? (
            <a href={enlaceMapa} target="_blank" rel="noopener noreferrer" className="mt-2 block text-xs font-semibold text-primary underline">
              📍 Ver ubicación en el mapa
            </a>
          ) : (
            <p className="mt-2 text-xs text-muted">Sin ubicación capturada en el momento de la alerta.</p>
          )}
          <p className="mt-2 text-xs text-muted">
            Enviada {formatearFechaHora(alerta.createdAt)} · {alerta.correoEnviado ? "correo enviado" : "correo no enviado"}
          </p>
          {!activa && alerta.atendidaPor && (
            <p className="mt-1 text-xs font-semibold text-green-700">
              Atendida por {alerta.atendidaPor.name}{alerta.atendidaEn && ` · ${formatearFechaHora(alerta.atendidaEn)}`}
            </p>
          )}
        </div>
        {activa && (
          <Boton
            type="button"
            className="w-auto shrink-0 px-3 py-1.5 text-xs"
            disabled={procesando}
            onClick={async () => { setProcesando(true); await onAtender(alerta.id); setProcesando(false); }}
          >
            {procesando ? "Guardando…" : "Marcar como atendida"}
          </Boton>
        )}
      </div>
    </Tarjeta>
  );
}

export default function AlertasSOSPanel({ alertasIniciales }: { alertasIniciales: Alerta[] }) {
  const [alertas, setAlertas] = useState(alertasIniciales);

  const activas = alertas.filter((a) => a.estado === "ACTIVA");
  const historial = alertas.filter((a) => a.estado !== "ACTIVA");

  async function atender(id: string) {
    const res = await fetch(`/api/sos/${id}/atender`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      window.alert(data.error ?? "No se pudo actualizar la alerta");
      return;
    }
    setAlertas((prev) => prev.map((a) => (a.id === id ? data : a)));
  }

  return (
    <div className="mt-5 flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-emergency">Alertas activas ({activas.length})</h2>
        <div className="mt-3 flex flex-col gap-2">
          {activas.length === 0 && <Tarjeta className="p-4 text-sm text-muted">No hay alertas SOS activas en este momento.</Tarjeta>}
          {activas.map((a) => (
            <TarjetaAlerta key={a.id} alerta={a} onAtender={atender} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-bold">Historial ({historial.length})</h2>
        <div className="mt-3 flex flex-col gap-2">
          {historial.map((a) => (
            <TarjetaAlerta key={a.id} alerta={a} onAtender={atender} />
          ))}
        </div>
      </div>
    </div>
  );
}
