"use client";

import { useState } from "react";
import { Boton, Campo, AreaTexto, Etiqueta, Seleccion, Tarjeta } from "@/components/ui/campos";
import SelectorUbicacion from "@/components/mapa/SelectorUbicacionDinamico";
import { formatearFechaHora } from "@/lib/fecha";
import { TIPOS_COLABORADOR } from "@/lib/catalogos";

function etiquetaColaborador(tipo: string | null | undefined) {
  return TIPOS_COLABORADOR.find((t) => t.value === tipo)?.label ?? null;
}

interface Registro {
  id: string;
  tipo: "ACTUALIZACION" | "NECESIDAD";
  descripcion: string;
  direccion: string | null;
  municipio: string | null;
  departamento: string | null;
  fotos: string[];
  contactoLugarNombre: string | null;
  contactoLugarTelefono: string | null;
  estado: "PENDIENTE" | "ATENDIDA";
  createdAt: string;
  autor: { id: string; name: string; tipoColaborador: string | null };
  atendidaPor: { id: string; name: string } | null;
  atendidaEn: string | null;
}

export default function BitacoraPanel({
  registrosIniciales,
  usuarioActualId,
  veTodo,
}: {
  registrosIniciales: Registro[];
  usuarioActualId: string;
  veTodo: boolean;
}) {
  const [registros, setRegistros] = useState(registrosIniciales);
  const [tipo, setTipo] = useState<"ACTUALIZACION" | "NECESIDAD">("ACTUALIZACION");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoTelefono, setContactoTelefono] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [subiendoFotos, setSubiendoFotos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [atendiendo, setAtendiendo] = useState<string | null>(null);

  function limpiarFormulario() {
    setDescripcion("");
    setDireccion("");
    setMunicipio("");
    setDepartamento("");
    setLat(null);
    setLng(null);
    setContactoNombre("");
    setContactoTelefono("");
    setFotos([]);
  }

  async function subirFotos(): Promise<string[]> {
    if (fotos.length === 0) return [];
    setSubiendoFotos(true);
    try {
      const urls: string[] = [];
      for (const foto of fotos) {
        const formData = new FormData();
        formData.append("file", foto);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          urls.push(data.url);
        }
      }
      return urls;
    } finally {
      setSubiendoFotos(false);
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const urlsFotos = await subirFotos();
      const res = await fetch("/api/bitacora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          descripcion,
          direccion: direccion || undefined,
          municipio: municipio || undefined,
          departamento: departamento || undefined,
          latitud: lat,
          longitud: lng,
          fotos: urlsFotos,
          contactoLugarNombre: contactoNombre || undefined,
          contactoLugarTelefono: contactoTelefono || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el registro");
        return;
      }
      setRegistros((prev) => [data, ...prev]);
      limpiarFormulario();
      setMostrarFormulario(false);
    } catch {
      setError("Ocurrió un error de conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  async function marcarAtendida(id: string) {
    if (!window.confirm("¿Confirmas que ya atendiste esta necesidad? Quedará registrado con tu nombre.")) return;
    setAtendiendo(id);
    const res = await fetch(`/api/bitacora/${id}/atender`, { method: "POST" });
    const data = await res.json();
    setAtendiendo(null);
    if (!res.ok) {
      window.alert(data.error ?? "No se pudo actualizar el registro");
      return;
    }
    setRegistros((prev) => prev.map((r) => (r.id === id ? data : r)));
  }

  return (
    <div className="mt-5 flex flex-col gap-5">
      <Tarjeta className="p-4">
        {!mostrarFormulario ? (
          <div className="flex flex-wrap gap-2">
            <Boton type="button" className="w-auto px-4" onClick={() => { setTipo("ACTUALIZACION"); setMostrarFormulario(true); }}>
              + Registrar actualización
            </Boton>
            <Boton type="button" variante="secundario" className="w-auto px-4" onClick={() => { setTipo("NECESIDAD"); setMostrarFormulario(true); }}>
              + Reportar necesidad puntual
            </Boton>
          </div>
        ) : (
          <form onSubmit={enviar} className="flex flex-col gap-4">
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{error}</div>}

            <div>
              <Etiqueta htmlFor="tipo-registro">Tipo de registro</Etiqueta>
              <Seleccion id="tipo-registro" value={tipo} onChange={(e) => setTipo(e.target.value as "ACTUALIZACION" | "NECESIDAD")}>
                <option value="ACTUALIZACION">Actualización de mi trabajo</option>
                <option value="NECESIDAD">Necesidad puntual encontrada en la zona</option>
              </Seleccion>
            </div>

            <div>
              <Etiqueta htmlFor="descripcion-bitacora">Descripción *</Etiqueta>
              <AreaTexto
                id="descripcion-bitacora"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder={tipo === "NECESIDAD" ? "Describe la necesidad encontrada: qué falta, cuántas personas, urgencia…" : "Describe brevemente el trabajo realizado o el estado actual"}
                required
              />
            </div>

            {tipo === "NECESIDAD" && (
              <>
                <div>
                  <h3 className="mb-2 text-sm font-bold">Ubicación del lugar afectado (opcional)</h3>
                  <SelectorUbicacion
                    lat={lat}
                    lng={lng}
                    onChange={(la, lo) => { setLat(la); setLng(lo); }}
                    onDireccionEncontrada={(d) => {
                      if (!direccion && d.direccion) setDireccion(d.direccion);
                      if (!municipio && d.municipio) setMunicipio(d.municipio);
                      if (!departamento && d.departamento) setDepartamento(d.departamento);
                    }}
                  />
                  <div className="mt-3">
                    <Campo placeholder="Dirección o punto de referencia" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Campo placeholder="Municipio" value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
                    <Campo placeholder="Departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} />
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-bold">Contacto en el lugar (opcional)</h3>
                  <p className="mb-2 text-xs text-muted">Persona encargada de recibir la ayuda en ese sitio.</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Campo placeholder="Nombre" value={contactoNombre} onChange={(e) => setContactoNombre(e.target.value)} />
                    <Campo placeholder="Teléfono" type="tel" value={contactoTelefono} onChange={(e) => setContactoTelefono(e.target.value)} />
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-bold">Registro fotográfico (opcional)</h3>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    onChange={(e) => setFotos(Array.from(e.target.files ?? []))}
                    className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
                  />
                  {fotos.length > 0 && <p className="mt-2 text-sm text-muted">{fotos.length} foto(s) seleccionada(s)</p>}
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Boton type="submit" className="w-auto px-5" disabled={enviando || subiendoFotos}>
                {enviando ? "Guardando…" : subiendoFotos ? "Subiendo fotos…" : "Guardar"}
              </Boton>
              <Boton type="button" variante="fantasma" className="w-auto px-5" onClick={() => { setMostrarFormulario(false); limpiarFormulario(); }}>
                Cancelar
              </Boton>
            </div>
          </form>
        )}
      </Tarjeta>

      <div>
        <h2 className="font-bold">
          {veTodo ? `Bitácora de todo el equipo (${registros.length})` : `Registros (${registros.length})`}
        </h2>
        {!veTodo && (
          <p className="mt-1 text-xs text-muted">Ves tus propios registros y todas las necesidades puntuales reportadas por el equipo.</p>
        )}
        <div className="mt-3 flex flex-col gap-2">
          {registros.length === 0 && (
            <Tarjeta className="p-4 text-sm text-muted">Aún no hay registros. Usa los botones de arriba para crear el primero.</Tarjeta>
          )}
          {registros.map((r) => {
            const esNecesidad = r.tipo === "NECESIDAD";
            const ubicacion = [r.direccion, r.municipio, r.departamento].filter(Boolean).join(", ");
            return (
              <Tarjeta key={r.id} className={`p-3.5 ${esNecesidad && r.estado === "PENDIENTE" ? "border-warning/40 bg-amber-50/30" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${esNecesidad ? "bg-primary/10 text-primary" : "bg-black/[.05] text-muted"}`}>
                        {esNecesidad ? "Necesidad puntual" : "Actualización"}
                      </span>
                      {esNecesidad && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.estado === "ATENDIDA" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                          {r.estado === "ATENDIDA" ? "Atendida" : "Pendiente"}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm">{r.descripcion}</p>
                    {ubicacion && <p className="mt-1 text-xs text-muted">📍 {ubicacion}</p>}
                    {(r.contactoLugarNombre || r.contactoLugarTelefono) && (
                      <p className="mt-1 text-xs text-muted">
                        Contacto en el lugar: {r.contactoLugarNombre} {r.contactoLugarTelefono && `· ${r.contactoLugarTelefono}`}
                      </p>
                    )}
                    {r.fotos.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {r.fotos.map((url) => (
                          <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="Evidencia fotográfica" className="h-16 w-16 rounded-lg object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-muted">
                      {r.autor.name}
                      {etiquetaColaborador(r.autor.tipoColaborador) && ` · ${etiquetaColaborador(r.autor.tipoColaborador)}`}
                      {r.autor.id === usuarioActualId && " (tú)"} · {formatearFechaHora(r.createdAt)}
                    </p>
                    {r.estado === "ATENDIDA" && r.atendidaPor && (
                      <p className="mt-1 text-xs font-semibold text-green-700">
                        Atendida por {r.atendidaPor.name}{r.atendidaEn && ` · ${formatearFechaHora(r.atendidaEn)}`}
                      </p>
                    )}
                  </div>
                  {esNecesidad && r.estado === "PENDIENTE" && (
                    <Boton
                      type="button"
                      className="w-auto shrink-0 px-3 py-1.5 text-xs"
                      disabled={atendiendo === r.id}
                      onClick={() => marcarAtendida(r.id)}
                    >
                      {atendiendo === r.id ? "Guardando…" : "Marcar como atendida"}
                    </Boton>
                  )}
                </div>
              </Tarjeta>
            );
          })}
        </div>
      </div>
    </div>
  );
}
