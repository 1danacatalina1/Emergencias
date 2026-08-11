"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Boton, Campo, Seleccion, Etiqueta, Tarjeta } from "@/components/ui/campos";
import { formatearFechaHora } from "@/lib/fecha";
import { InsigniaEstado, InsigniaPrioridad } from "@/components/ui/insignias";
import SelectorUbicacion from "@/components/mapa/SelectorUbicacionDinamico";
import BotonEliminar from "@/components/ui/BotonEliminar";

interface Persona {
  id: string;
  nombreCompleto: string;
  tipoDocumento: string;
  numeroDocumento: string | null;
  edad: number | null;
  sexo: string;
  estadoPersona: string;
  telefono: string | null;
  condicionSalud: string | null;
  traslados: { id: string; centroMedico: string; estadoTraslado: string }[];
}

interface Traslado {
  id: string;
  centroMedico: string;
  tipoTraslado: string;
  estadoTraslado: string;
  motivo: string;
  person: { nombreCompleto: string } | null;
}

interface Ayuda {
  id: string;
  codigo: string;
  tipoAyuda: string;
  estado: string;
  nombreSolicitante: string;
  descripcion: string;
}

interface Incident {
  id: string;
  codigo: string;
  descripcion: string;
  subtipo: string | null;
  direccion: string;
  municipio: string;
  departamento: string;
  latitud: number;
  longitud: number;
  nivelPrioridad: string;
  estado: string;
  incidentTypeId: string;
  incidentType: { nombre: string } | null;
  reporteroNombre: string | null;
  reporteroTelefono: string | null;
  esAnonimo: boolean;
  fechaEvento: string;
  createdAt: string;
  creadoPor: { name: string } | null;
  personas: Persona[];
  traslados: Traslado[];
  ayudas: Ayuda[];
  adjuntos: { id: string; url: string }[];
}

const ESTADOS_INCIDENTE = ["REPORTADO", "EN_ATENCION", "EN_PROCESO", "RESUELTO", "CERRADO", "DESCARTADO"];
const PRIORIDADES = ["BAJA", "MEDIA", "ALTA", "CRITICA"];
const ESTADOS_PERSONA = ["DESAPARECIDA", "BUSQUEDA", "LOCALIZADA", "ILESA", "HERIDA", "ATRAPADA", "TRASLADADA", "FALLECIDA", "ATENDIDA"];

const PERSONA_VACIA = {
  nombreCompleto: "",
  tipoDocumento: "SIN_DOCUMENTO",
  numeroDocumento: "",
  edad: "",
  sexo: "NO_INFORMA",
  estadoPersona: "DESAPARECIDA",
};

export default function IncidenteDetalle({
  incident,
  tipos,
  puedeEliminar,
}: {
  incident: Incident;
  tipos: { id: string; nombre: string }[];
  puedeEliminar: boolean;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState(incident.estado);
  const [nivelPrioridad, setNivelPrioridad] = useState(incident.nivelPrioridad);
  const [incidentTypeId, setIncidentTypeId] = useState(incident.incidentTypeId);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [personas, setPersonas] = useState(incident.personas);
  const [mostrarFormPersona, setMostrarFormPersona] = useState(false);
  const [nuevaPersona, setNuevaPersona] = useState({ ...PERSONA_VACIA });
  const [guardandoPersona, setGuardandoPersona] = useState(false);

  const [lat] = useState(incident.latitud);
  const [lng] = useState(incident.longitud);

  async function guardarCambios() {
    setGuardando(true);
    setMensaje(null);
    const res = await fetch(`/api/incidents/${incident.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, nivelPrioridad, incidentTypeId }),
    });
    setGuardando(false);
    if (res.ok) {
      setMensaje("Cambios guardados");
      router.refresh();
    } else {
      setMensaje("No se pudieron guardar los cambios");
    }
  }

  async function agregarPersona(e: React.FormEvent) {
    e.preventDefault();
    setGuardandoPersona(true);
    const res = await fetch("/api/persons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incidentId: incident.id,
        nombreCompleto: nuevaPersona.nombreCompleto,
        tipoDocumento: nuevaPersona.tipoDocumento,
        numeroDocumento: nuevaPersona.numeroDocumento || undefined,
        edad: nuevaPersona.edad ? Number(nuevaPersona.edad) : undefined,
        sexo: nuevaPersona.sexo,
        estadoPersona: nuevaPersona.estadoPersona,
      }),
    });
    setGuardandoPersona(false);
    if (res.ok) {
      const creada = await res.json();
      setPersonas((prev) => [{ ...creada, traslados: [] }, ...prev]);
      setNuevaPersona({ ...PERSONA_VACIA });
      setMostrarFormPersona(false);
    }
  }

  async function actualizarEstadoPersona(personaId: string, nuevoEstado: string) {
    setPersonas((prev) => prev.map((p) => (p.id === personaId ? { ...p, estadoPersona: nuevoEstado } : p)));
    await fetch(`/api/persons/${personaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estadoPersona: nuevoEstado }),
    });
    router.refresh();
  }

  return (
    <div className="pb-10">
      <Link href="/panel/incidentes" className="text-sm font-medium text-muted">← Volver a incidentes</Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-bold text-primary">{incident.codigo}</p>
          <h1 className="text-xl font-bold">{incident.incidentType?.nombre}{incident.subtipo ? ` — ${incident.subtipo}` : ""}</h1>
          <p className="text-sm text-muted">{incident.direccion}, {incident.municipio}, {incident.departamento}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <InsigniaPrioridad prioridad={nivelPrioridad} />
          <InsigniaEstado estado={estado} />
          {puedeEliminar && (
            <BotonEliminar
              endpoint={`/api/incidents/${incident.id}`}
              mensajeConfirmacion="¿Eliminar este reporte de forma definitiva, incluidas las personas, fotos y traslados asociados? Esta acción no se puede deshacer."
              onEliminado={() => router.push("/panel/incidentes")}
            />
          )}
        </div>
      </div>

      <Tarjeta className="mt-4 p-4">
        <p className="text-sm">{incident.descripcion}</p>
        {!incident.esAnonimo && (incident.reporteroNombre || incident.reporteroTelefono) && (
          <p className="mt-2 text-xs text-muted">Reportado por: {incident.reporteroNombre} {incident.reporteroTelefono && `· ${incident.reporteroTelefono}`}</p>
        )}
        <p className="mt-1 text-xs text-muted">Creado: {formatearFechaHora(incident.createdAt)} {incident.creadoPor && `por ${incident.creadoPor.name}`}</p>
      </Tarjeta>

      <Tarjeta className="mt-4 p-4">
        <h2 className="mb-3 font-bold">Gestión del caso</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Etiqueta htmlFor="tipo">Tipo</Etiqueta>
            <Seleccion id="tipo" value={incidentTypeId} onChange={(e) => setIncidentTypeId(e.target.value)}>
              {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </Seleccion>
          </div>
          <div>
            <Etiqueta htmlFor="estado">Estado</Etiqueta>
            <Seleccion id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
              {ESTADOS_INCIDENTE.map((e) => <option key={e} value={e}>{e}</option>)}
            </Seleccion>
          </div>
          <div>
            <Etiqueta htmlFor="prioridad">Prioridad</Etiqueta>
            <Seleccion id="prioridad" value={nivelPrioridad} onChange={(e) => setNivelPrioridad(e.target.value)}>
              {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
            </Seleccion>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Boton type="button" className="w-auto px-5" onClick={guardarCambios} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </Boton>
          {mensaje && <span className="text-sm text-muted">{mensaje}</span>}
        </div>
      </Tarjeta>

      <Tarjeta className="mt-4 overflow-hidden p-0">
        <div className="h-56 w-full">
          <SelectorUbicacion lat={lat} lng={lng} onChange={() => {}} />
        </div>
      </Tarjeta>

      {incident.adjuntos.length > 0 && (
        <Tarjeta className="mt-4 p-4">
          <h2 className="mb-3 font-bold">Fotos</h2>
          <div className="grid grid-cols-3 gap-2">
            {incident.adjuntos.map((a) => (
              <a key={a.id} href={a.url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt="Adjunto" className="h-24 w-full rounded-lg object-cover" />
              </a>
            ))}
          </div>
        </Tarjeta>
      )}

      <Tarjeta className="mt-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Personas relacionadas ({personas.length})</h2>
          <Boton type="button" variante="fantasma" className="w-auto px-3 py-1.5 text-sm" onClick={() => setMostrarFormPersona((v) => !v)}>
            {mostrarFormPersona ? "Cancelar" : "+ Añadir persona"}
          </Boton>
        </div>

        {mostrarFormPersona && (
          <form onSubmit={agregarPersona} className="mt-3 flex flex-col gap-2 rounded-xl border border-border p-3">
            <Campo placeholder="Nombre completo" value={nuevaPersona.nombreCompleto} onChange={(e) => setNuevaPersona({ ...nuevaPersona, nombreCompleto: e.target.value })} required />
            <div className="grid grid-cols-2 gap-2">
              <Campo placeholder="Documento" value={nuevaPersona.numeroDocumento} onChange={(e) => setNuevaPersona({ ...nuevaPersona, numeroDocumento: e.target.value })} />
              <Campo placeholder="Edad" type="number" value={nuevaPersona.edad} onChange={(e) => setNuevaPersona({ ...nuevaPersona, edad: e.target.value })} />
            </div>
            <Seleccion value={nuevaPersona.estadoPersona} onChange={(e) => setNuevaPersona({ ...nuevaPersona, estadoPersona: e.target.value })}>
              {ESTADOS_PERSONA.map((s) => <option key={s} value={s}>{s}</option>)}
            </Seleccion>
            <Boton type="submit" className="w-auto px-4" disabled={guardandoPersona}>
              {guardandoPersona ? "Guardando…" : "Guardar persona"}
            </Boton>
          </form>
        )}

        <div className="mt-3 flex flex-col gap-2">
          {personas.map((p) => (
            <div key={p.id} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold">{p.nombreCompleto}</p>
                  <p className="text-xs text-muted">
                    {p.tipoDocumento !== "SIN_DOCUMENTO" && p.numeroDocumento ? `${p.tipoDocumento} ${p.numeroDocumento} · ` : ""}
                    {p.edad ? `${p.edad} años · ` : ""}{p.sexo}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Seleccion
                    value={p.estadoPersona}
                    onChange={(e) => actualizarEstadoPersona(p.id, e.target.value)}
                    className="w-auto py-1.5 text-xs"
                  >
                    {ESTADOS_PERSONA.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Seleccion>
                  {puedeEliminar && (
                    <BotonEliminar
                      endpoint={`/api/persons/${p.id}`}
                      mensajeConfirmacion="¿Eliminar esta persona de forma definitiva, incluidas sus fotos? Esta acción no se puede deshacer."
                      onEliminado={() => setPersonas((prev) => prev.filter((x) => x.id !== p.id))}
                    />
                  )}
                </div>
              </div>
              {p.traslados.length > 0 && (
                <p className="mt-1.5 text-xs text-muted">Traslados: {p.traslados.map((t) => `${t.centroMedico} (${t.estadoTraslado})`).join(", ")}</p>
              )}
            </div>
          ))}
          {personas.length === 0 && <p className="text-sm text-muted">Sin personas registradas.</p>}
        </div>
      </Tarjeta>

      {incident.traslados.length > 0 && (
        <Tarjeta className="mt-4 p-4">
          <h2 className="mb-3 font-bold">Traslados ({incident.traslados.length})</h2>
          <div className="flex flex-col gap-2">
            {incident.traslados.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-bold">{t.person?.nombreCompleto}</p>
                  <p className="text-xs text-muted">{t.centroMedico} · {t.tipoTraslado}</p>
                </div>
                <InsigniaEstado estado={t.estadoTraslado} />
              </div>
            ))}
          </div>
        </Tarjeta>
      )}

      {incident.ayudas.length > 0 && (
        <Tarjeta className="mt-4 p-4">
          <h2 className="mb-3 font-bold">Ayudas humanitarias ({incident.ayudas.length})</h2>
          <div className="flex flex-col gap-2">
            {incident.ayudas.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-bold">{a.tipoAyuda} · {a.nombreSolicitante}</p>
                  <p className="text-xs text-muted">{a.descripcion}</p>
                </div>
                <InsigniaEstado estado={a.estado} />
              </div>
            ))}
          </div>
        </Tarjeta>
      )}
    </div>
  );
}
