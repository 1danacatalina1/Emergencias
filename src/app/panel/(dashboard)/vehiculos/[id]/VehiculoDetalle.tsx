"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Boton, Campo, AreaTexto, Seleccion, Etiqueta, Tarjeta } from "@/components/ui/campos";
import BotonEliminar from "@/components/ui/BotonEliminar";
import { TIPOS_VEHICULO, ESTADOS_VEHICULO, TIPOS_COLABORADOR } from "@/lib/catalogos";

function etiqueta(lista: readonly { value: string; label: string }[], value: string) {
  return lista.find((o) => o.value === value)?.label ?? value;
}

function etiquetaColaborador(tipo: string | null) {
  return TIPOS_COLABORADOR.find((t) => t.value === tipo)?.label ?? "Colaborador";
}

interface Usuario {
  id: string;
  name: string;
  telefono: string | null;
  tipoColaborador?: string | null;
}

interface Necesidad {
  id: string;
  concepto: string;
  montoEstimado: number | null;
  descripcion: string | null;
  estado: string;
  createdAt: string;
}

interface Vehiculo {
  id: string;
  placa: string;
  tipo: string;
  marcaModelo: string | null;
  capacidadPersonas: number | null;
  capacidadCargaDescripcion: string | null;
  paraPersonas: boolean;
  paraInsumos: boolean;
  cubreRutaNacional: boolean;
  cubreRutaUrbana: boolean;
  rutasCubiertas: string | null;
  municipioBase: string | null;
  departamentoBase: string | null;
  estado: string;
  observaciones: string | null;
  registradoPor: { id: string; name: string } | null;
  conductores: { usuario: Usuario; cedula: string | null }[];
  pasajeros: { usuario: Usuario }[];
  necesidades: Necesidad[];
}

export default function VehiculoDetalle({
  vehiculoInicial,
  roster,
  puedeEditar,
  puedeEliminar,
}: {
  vehiculoInicial: Vehiculo;
  roster: Usuario[];
  puedeEditar: boolean;
  puedeEliminar: boolean;
}) {
  const router = useRouter();
  const [vehiculo, setVehiculo] = useState(vehiculoInicial);

  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const [editandoInfo, setEditandoInfo] = useState(false);
  const [guardandoInfo, setGuardandoInfo] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [form, setForm] = useState({
    placa: vehiculo.placa,
    tipo: vehiculo.tipo,
    marcaModelo: vehiculo.marcaModelo ?? "",
    capacidadPersonas: vehiculo.capacidadPersonas?.toString() ?? "",
    capacidadCargaDescripcion: vehiculo.capacidadCargaDescripcion ?? "",
    paraPersonas: vehiculo.paraPersonas,
    paraInsumos: vehiculo.paraInsumos,
    cubreRutaNacional: vehiculo.cubreRutaNacional,
    cubreRutaUrbana: vehiculo.cubreRutaUrbana,
    rutasCubiertas: vehiculo.rutasCubiertas ?? "",
    municipioBase: vehiculo.municipioBase ?? "",
    departamentoBase: vehiculo.departamentoBase ?? "",
    observaciones: vehiculo.observaciones ?? "",
  });

  const [editandoEquipo, setEditandoEquipo] = useState(false);
  const [guardandoEquipo, setGuardandoEquipo] = useState(false);
  const [errorEquipo, setErrorEquipo] = useState<string | null>(null);
  const [conductoresCedulas, setConductoresCedulas] = useState<Record<string, string>>(
    Object.fromEntries(vehiculo.conductores.map((c) => [c.usuario.id, c.cedula ?? ""])),
  );
  const [pasajerosSel, setPasajerosSel] = useState(new Set(vehiculo.pasajeros.map((p) => p.usuario.id)));
  const [busquedaEquipo, setBusquedaEquipo] = useState("");

  const [nuevoConcepto, setNuevoConcepto] = useState("");
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [agregandoNecesidad, setAgregandoNecesidad] = useState(false);

  const rosterFiltrado = useMemo(() => {
    const q = busquedaEquipo.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter((u) => u.name.toLowerCase().includes(q));
  }, [roster, busquedaEquipo]);

  async function cambiarEstado(nuevoEstado: string) {
    setCambiandoEstado(true);
    const res = await fetch(`/api/vehiculos/${vehiculo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (res.ok) {
      setVehiculo((prev) => ({ ...prev, estado: nuevoEstado }));
    }
    setCambiandoEstado(false);
  }

  async function guardarInfo() {
    setErrorInfo(null);
    if (!form.paraPersonas && !form.paraInsumos) {
      setErrorInfo("Marca al menos un uso: personal, insumos, o ambos.");
      return;
    }
    setGuardandoInfo(true);
    const res = await fetch(`/api/vehiculos/${vehiculo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        placa: form.placa,
        tipo: form.tipo,
        marcaModelo: form.marcaModelo || null,
        capacidadPersonas: form.capacidadPersonas ? Number(form.capacidadPersonas) : null,
        capacidadCargaDescripcion: form.capacidadCargaDescripcion || null,
        paraPersonas: form.paraPersonas,
        paraInsumos: form.paraInsumos,
        cubreRutaNacional: form.cubreRutaNacional,
        cubreRutaUrbana: form.cubreRutaUrbana,
        rutasCubiertas: form.rutasCubiertas || null,
        municipioBase: form.municipioBase || null,
        departamentoBase: form.departamentoBase || null,
        observaciones: form.observaciones || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setVehiculo((prev) => ({ ...prev, ...data }));
      setEditandoInfo(false);
    } else {
      setErrorInfo(data.error ?? "No se pudo guardar. Intenta de nuevo.");
    }
    setGuardandoInfo(false);
  }

  function alternarUsuario(set: Set<string>, setFn: (s: Set<string>) => void, id: string) {
    const copia = new Set(set);
    if (copia.has(id)) copia.delete(id); else copia.add(id);
    setFn(copia);
  }

  function alternarConductor(id: string) {
    setConductoresCedulas((prev) => {
      const copia = { ...prev };
      if (id in copia) delete copia[id]; else copia[id] = "";
      return copia;
    });
  }

  async function guardarEquipo() {
    setErrorEquipo(null);
    const conductoresIds = Object.keys(conductoresCedulas);
    const sinCedula = conductoresIds.some((id) => !conductoresCedulas[id]?.trim());
    if (sinCedula) {
      setErrorEquipo("Falta la cédula de alguno de los conductores. Es necesaria para tramitar los permisos de ingreso.");
      return;
    }

    setGuardandoEquipo(true);
    const res = await fetch(`/api/vehiculos/${vehiculo.id}/equipo`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conductores: conductoresIds.map((usuarioId) => ({ usuarioId, cedula: conductoresCedulas[usuarioId].trim() })),
        pasajerosIds: Array.from(pasajerosSel),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setVehiculo((prev) => ({ ...prev, conductores: data.conductores, pasajeros: data.pasajeros }));
      setEditandoEquipo(false);
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorEquipo(data.error ?? "No se pudo guardar. Intenta de nuevo.");
    }
    setGuardandoEquipo(false);
  }

  async function agregarNecesidad(e: React.FormEvent) {
    e.preventDefault();
    setAgregandoNecesidad(true);
    const res = await fetch(`/api/vehiculos/${vehiculo.id}/necesidades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concepto: nuevoConcepto,
        montoEstimado: nuevoMonto ? Number(nuevoMonto) : null,
        descripcion: nuevaDescripcion || null,
      }),
    });
    if (res.ok) {
      const necesidad = await res.json();
      setVehiculo((prev) => ({ ...prev, necesidades: [necesidad, ...prev.necesidades] }));
      setNuevoConcepto("");
      setNuevoMonto("");
      setNuevaDescripcion("");
    }
    setAgregandoNecesidad(false);
  }

  async function alternarEstadoNecesidad(necesidad: Necesidad) {
    const nuevoEstado = necesidad.estado === "PENDIENTE" ? "CUBIERTA" : "PENDIENTE";
    const res = await fetch(`/api/vehiculos/${vehiculo.id}/necesidades/${necesidad.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (res.ok) {
      setVehiculo((prev) => ({
        ...prev,
        necesidades: prev.necesidades.map((n) => (n.id === necesidad.id ? { ...n, estado: nuevoEstado } : n)),
      }));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/panel/vehiculos" className="text-xs font-semibold text-primary">← Vehículos</Link>
          <h1 className="mt-1 text-xl font-bold">
            {TIPOS_VEHICULO.find((t) => t.value === vehiculo.tipo)?.icono ?? "🚗"} {vehiculo.placa}
          </h1>
        </div>
        {puedeEliminar && (
          <BotonEliminar
            endpoint={`/api/vehiculos/${vehiculo.id}`}
            mensajeConfirmacion="¿Eliminar este vehículo de forma definitiva? Se perderán sus conductores, grupo y necesidades económicas registradas. Esta acción no se puede deshacer."
            onEliminado={() => router.push("/panel/vehiculos")}
          />
        )}
      </div>

      <Tarjeta className="mt-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Estado</p>
          <Seleccion
            value={vehiculo.estado}
            onChange={(e) => cambiarEstado(e.target.value)}
            disabled={!puedeEditar || cambiandoEstado}
            className="w-auto py-1.5 text-sm"
          >
            {ESTADOS_VEHICULO.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
          </Seleccion>
        </div>
      </Tarjeta>

      {!editandoInfo ? (
        <Tarjeta className="mt-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm"><span className="font-semibold">Tipo:</span> {etiqueta(TIPOS_VEHICULO, vehiculo.tipo)}</p>
              {vehiculo.marcaModelo && <p className="mt-1 text-sm"><span className="font-semibold">Marca/modelo:</span> {vehiculo.marcaModelo}</p>}
              <p className="mt-1 text-sm">
                <span className="font-semibold">Uso:</span>{" "}
                {vehiculo.paraPersonas && vehiculo.paraInsumos ? "Personal e insumos" : vehiculo.paraPersonas ? "Solo personal" : "Solo insumos"}
              </p>
              {vehiculo.capacidadPersonas != null && <p className="mt-1 text-sm"><span className="font-semibold">Capacidad:</span> {vehiculo.capacidadPersonas} personas</p>}
              {vehiculo.capacidadCargaDescripcion && <p className="mt-1 text-sm"><span className="font-semibold">Capacidad de carga:</span> {vehiculo.capacidadCargaDescripcion}</p>}
              {(vehiculo.cubreRutaNacional || vehiculo.cubreRutaUrbana) && (
                <p className="mt-1 text-sm">
                  <span className="font-semibold">Cobertura:</span>{" "}
                  {[vehiculo.cubreRutaNacional && "Nacional (ciudad a ciudad)", vehiculo.cubreRutaUrbana && "Urbana (interna)"].filter(Boolean).join(" · ")}
                  {vehiculo.rutasCubiertas && ` — ${vehiculo.rutasCubiertas}`}
                </p>
              )}
              {(vehiculo.municipioBase || vehiculo.departamentoBase) && (
                <p className="mt-1 text-sm">
                  <span className="font-semibold">Base:</span> {[vehiculo.municipioBase, vehiculo.departamentoBase].filter(Boolean).join(", ")}
                </p>
              )}
              {vehiculo.observaciones && <p className="mt-1 text-sm"><span className="font-semibold">Observaciones:</span> {vehiculo.observaciones}</p>}
              {vehiculo.registradoPor && <p className="mt-2 text-xs text-muted">Registrado por {vehiculo.registradoPor.name}</p>}
            </div>
            {puedeEditar && (
              <button type="button" onClick={() => setEditandoInfo(true)} className="shrink-0 text-sm font-semibold text-primary">
                ✏️ Editar
              </button>
            )}
          </div>
        </Tarjeta>
      ) : (
        <Tarjeta className="mt-3 p-4">
          <p className="mb-3 text-sm font-bold">Editar datos del vehículo</p>
          {errorInfo && <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{errorInfo}</div>}

          <Etiqueta htmlFor="ed-placa">Placa</Etiqueta>
          <Campo id="ed-placa" value={form.placa} onChange={(e) => setForm((f) => ({ ...f, placa: e.target.value.toUpperCase() }))} />

          <div className="mt-3">
            <Etiqueta htmlFor="ed-tipo">Tipo</Etiqueta>
            <Seleccion id="ed-tipo" value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
              {TIPOS_VEHICULO.map((t) => <option key={t.value} value={t.value}>{t.icono} {t.label}</option>)}
            </Seleccion>
          </div>

          <div className="mt-3">
            <Etiqueta htmlFor="ed-marca">Marca / modelo</Etiqueta>
            <Campo id="ed-marca" value={form.marcaModelo} onChange={(e) => setForm((f) => ({ ...f, marcaModelo: e.target.value }))} />
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.paraPersonas} onChange={(e) => setForm((f) => ({ ...f, paraPersonas: e.target.checked }))} />
              Movilizar personal / voluntarios entre ciudades
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.paraInsumos} onChange={(e) => setForm((f) => ({ ...f, paraInsumos: e.target.checked }))} />
              Llevar insumos a puntos de acopio
            </label>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Etiqueta htmlFor="ed-capacidad">Capacidad (personas)</Etiqueta>
              <Campo id="ed-capacidad" type="number" min={0} value={form.capacidadPersonas} onChange={(e) => setForm((f) => ({ ...f, capacidadPersonas: e.target.value }))} />
            </div>
            <div>
              <Etiqueta htmlFor="ed-carga">Capacidad de carga</Etiqueta>
              <Campo id="ed-carga" value={form.capacidadCargaDescripcion} onChange={(e) => setForm((f) => ({ ...f, capacidadCargaDescripcion: e.target.value }))} />
            </div>
          </div>

          <p className="mt-3 text-sm font-semibold">¿Qué tipo de ruta puede cubrir?</p>
          <div className="mt-2 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.cubreRutaNacional} onChange={(e) => setForm((f) => ({ ...f, cubreRutaNacional: e.target.checked }))} />
              Nacional (de ciudad a ciudad)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.cubreRutaUrbana} onChange={(e) => setForm((f) => ({ ...f, cubreRutaUrbana: e.target.checked }))} />
              Urbana (interna en una ciudad)
            </label>
          </div>
          <div className="mt-3">
            <Etiqueta htmlFor="ed-rutas">Rutas específicas (opcional)</Etiqueta>
            <Campo
              id="ed-rutas"
              value={form.rutasCubiertas}
              onChange={(e) => setForm((f) => ({ ...f, rutasCubiertas: e.target.value }))}
              placeholder="Ej. Bogotá - Cali, o dentro de Bogotá"
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Etiqueta htmlFor="ed-municipio">Municipio base</Etiqueta>
              <Campo id="ed-municipio" value={form.municipioBase} onChange={(e) => setForm((f) => ({ ...f, municipioBase: e.target.value }))} />
            </div>
            <div>
              <Etiqueta htmlFor="ed-departamento">Departamento base</Etiqueta>
              <Campo id="ed-departamento" value={form.departamentoBase} onChange={(e) => setForm((f) => ({ ...f, departamentoBase: e.target.value }))} />
            </div>
          </div>

          <div className="mt-3">
            <Etiqueta htmlFor="ed-obs">Observaciones</Etiqueta>
            <AreaTexto id="ed-obs" value={form.observaciones} onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))} />
          </div>

          <div className="mt-4 flex gap-2">
            <Boton type="button" variante="primario" disabled={guardandoInfo} onClick={guardarInfo} className="w-auto px-4">
              {guardandoInfo ? "Guardando…" : "Guardar"}
            </Boton>
            <Boton type="button" variante="secundario" onClick={() => setEditandoInfo(false)} className="w-auto px-4">
              Cancelar
            </Boton>
          </div>
        </Tarjeta>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h2 className="font-bold">Conductores autorizados y grupo trasladado</h2>
          <p className="mt-0.5 text-xs text-muted">Quién puede movilizar este vehículo y a quiénes traslada.</p>
        </div>
        {puedeEditar && !editandoEquipo && (
          <button type="button" onClick={() => setEditandoEquipo(true)} className="shrink-0 text-sm font-semibold text-primary">
            ✏️ Editar
          </button>
        )}
      </div>

      {!editandoEquipo ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Tarjeta className="p-4">
            <p className="text-sm font-bold">🚙 Conductores autorizados ({vehiculo.conductores.length})</p>
            <div className="mt-2 flex flex-col gap-1">
              {vehiculo.conductores.length === 0 && <p className="text-xs text-muted">Nadie asignado todavía.</p>}
              {vehiculo.conductores.map((c) => (
                <p key={c.usuario.id} className="text-sm">
                  {c.usuario.name}
                  {c.usuario.telefono && <span className="text-xs text-muted"> · {c.usuario.telefono}</span>}
                  <span className={`text-xs ${c.cedula ? "text-muted" : "font-semibold text-emergency"}`}> · Cédula {c.cedula || "sin registrar"}</span>
                </p>
              ))}
            </div>
          </Tarjeta>
          <Tarjeta className="p-4">
            <p className="text-sm font-bold">🧍 Grupo que traslada ({vehiculo.pasajeros.length})</p>
            <div className="mt-2 flex flex-col gap-1">
              {vehiculo.pasajeros.length === 0 && <p className="text-xs text-muted">Nadie asignado todavía.</p>}
              {vehiculo.pasajeros.map((p) => (
                <p key={p.usuario.id} className="text-sm">{p.usuario.name} {p.usuario.telefono && <span className="text-xs text-muted">· {p.usuario.telefono}</span>}</p>
              ))}
            </div>
          </Tarjeta>
        </div>
      ) : (
        <Tarjeta className="mt-3 p-4">
          <p className="mb-2 text-xs text-muted">
            La cédula del conductor es necesaria para tramitar las cartas de permiso de ingreso a
            zonas afectadas.
          </p>
          {errorEquipo && <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{errorEquipo}</div>}
          <Campo
            placeholder="Buscar por nombre…"
            value={busquedaEquipo}
            onChange={(e) => setBusquedaEquipo(e.target.value)}
          />
          <div className="mt-3 max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-muted">
                  <th className="pb-2">Nombre</th>
                  <th className="pb-2 text-center">Conductor</th>
                  <th className="pb-2">Cédula</th>
                  <th className="pb-2 text-center">Grupo</th>
                </tr>
              </thead>
              <tbody>
                {rosterFiltrado.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="py-2 pr-2">
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-xs text-muted">{etiquetaColaborador(u.tipoColaborador ?? null)}</p>
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="checkbox"
                        checked={u.id in conductoresCedulas}
                        onChange={() => alternarConductor(u.id)}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      {u.id in conductoresCedulas && (
                        <Campo
                          placeholder="N.º de cédula"
                          value={conductoresCedulas[u.id]}
                          onChange={(e) => setConductoresCedulas((prev) => ({ ...prev, [u.id]: e.target.value }))}
                          className="py-1.5 text-xs"
                        />
                      )}
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="checkbox"
                        checked={pasajerosSel.has(u.id)}
                        onChange={() => alternarUsuario(pasajerosSel, setPasajerosSel, u.id)}
                      />
                    </td>
                  </tr>
                ))}
                {rosterFiltrado.length === 0 && (
                  <tr><td colSpan={4} className="py-3 text-center text-xs text-muted">No hay coincidencias.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-2">
            <Boton type="button" variante="primario" disabled={guardandoEquipo} onClick={guardarEquipo} className="w-auto px-4">
              {guardandoEquipo ? "Guardando…" : "Guardar"}
            </Boton>
            <Boton
              type="button"
              variante="secundario"
              className="w-auto px-4"
              onClick={() => {
                setConductoresCedulas(Object.fromEntries(vehiculo.conductores.map((c) => [c.usuario.id, c.cedula ?? ""])));
                setPasajerosSel(new Set(vehiculo.pasajeros.map((p) => p.usuario.id)));
                setErrorEquipo(null);
                setEditandoEquipo(false);
              }}
            >
              Cancelar
            </Boton>
          </div>
        </Tarjeta>
      )}

      <div className="mt-6">
        <h2 className="font-bold">Necesidades económicas para el transporte</h2>
        <p className="mt-0.5 text-xs text-muted">Ej. gasolina, peajes, mantenimiento, seguro.</p>

        {puedeEditar && (
          <form onSubmit={agregarNecesidad} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Campo placeholder="Concepto (ej. Gasolina)" value={nuevoConcepto} onChange={(e) => setNuevoConcepto(e.target.value)} required className="sm:flex-1" />
            <Campo type="number" min={0} placeholder="Monto estimado" value={nuevoMonto} onChange={(e) => setNuevoMonto(e.target.value)} className="sm:w-40" />
            <Campo placeholder="Descripción (opcional)" value={nuevaDescripcion} onChange={(e) => setNuevaDescripcion(e.target.value)} className="sm:flex-1" />
            <button type="submit" disabled={agregandoNecesidad} className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white sm:w-auto">
              {agregandoNecesidad ? "Agregando…" : "Agregar"}
            </button>
          </form>
        )}

        <div className="mt-3 flex flex-col gap-2">
          {vehiculo.necesidades.length === 0 && <p className="text-sm text-muted">Aún no hay necesidades económicas registradas.</p>}
          {vehiculo.necesidades.map((n) => (
            <Tarjeta key={n.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
              <div className="min-w-0">
                <p className="text-sm font-bold">
                  {n.concepto}
                  {n.montoEstimado != null && <span className="ml-1 font-mono text-primary">${n.montoEstimado.toLocaleString("es-CO")}</span>}
                </p>
                {n.descripcion && <p className="text-xs text-muted">{n.descripcion}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${n.estado === "CUBIERTA" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {n.estado === "CUBIERTA" ? "Cubierta" : "Pendiente"}
                </span>
                {puedeEditar && (
                  <>
                    <button
                      type="button"
                      onClick={() => alternarEstadoNecesidad(n)}
                      className="text-xs font-semibold text-primary"
                    >
                      {n.estado === "CUBIERTA" ? "Marcar pendiente" : "Marcar cubierta"}
                    </button>
                    <BotonEliminar
                      endpoint={`/api/vehiculos/${vehiculo.id}/necesidades/${n.id}`}
                      mensajeConfirmacion="¿Eliminar esta necesidad económica?"
                      onEliminado={() => setVehiculo((prev) => ({ ...prev, necesidades: prev.necesidades.filter((x) => x.id !== n.id) }))}
                    />
                  </>
                )}
              </div>
            </Tarjeta>
          ))}
        </div>
      </div>
    </div>
  );
}
