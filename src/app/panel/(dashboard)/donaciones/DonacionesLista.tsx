"use client";

import { useState } from "react";
import { Boton, Tarjeta, Seleccion, Campo, AreaTexto, Etiqueta, ErrorCampo } from "@/components/ui/campos";
import { InsigniaEstado } from "@/components/ui/insignias";
import BotonEliminar from "@/components/ui/BotonEliminar";
import { INSUMOS_SUGERIDOS, UNIDADES_SUGERIDAS, TIPOS_AYUDA } from "@/lib/catalogos";

const ESTADOS = ["OFRECIDA", "CONFIRMADA", "RECIBIDA", "CANCELADA"];

interface Donacion {
  id: string;
  codigo: string;
  nombreDonante: string;
  telefonoDonante: string;
  tipoAyuda: string;
  descripcion: string;
  insumo: string | null;
  cantidad: number | null;
  unidad: string | null;
  municipio: string;
  estado: string;
  donationPoint: { id: string; codigo: string; nombre: string } | null;
}

interface PuntoOpcion {
  id: string;
  nombre: string;
  municipio: string;
  departamento: string;
}

const FORM_VACIO = {
  donationPointId: "",
  nombreDonante: "",
  telefonoDonante: "",
  tipoAyuda: "OTRO",
  descripcion: "",
  insumo: "",
  cantidad: "",
  unidad: "",
  municipio: "",
  departamento: "",
};

export default function DonacionesLista({
  donaciones,
  puntos,
  puedeEscribir,
  puedeEliminar,
}: {
  donaciones: Donacion[];
  puntos: PuntoOpcion[];
  puedeEscribir: boolean;
  puedeEliminar: boolean;
}) {
  const [lista, setLista] = useState(donaciones);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [registrando, setRegistrando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  function elegirPunto(donationPointId: string) {
    const punto = puntos.find((p) => p.id === donationPointId);
    setForm((f) => ({
      ...f,
      donationPointId,
      municipio: punto?.municipio ?? f.municipio,
      departamento: punto?.departamento ?? f.departamento,
    }));
  }

  async function registrarDonacion(e: React.FormEvent) {
    e.preventDefault();
    setErrores({});
    setErrorGeneral(null);
    setRegistrando(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationPointId: form.donationPointId || undefined,
          nombreDonante: form.nombreDonante,
          telefonoDonante: form.telefonoDonante,
          tipoAyuda: form.tipoAyuda,
          descripcion: form.descripcion,
          insumo: form.insumo || undefined,
          cantidad: form.cantidad || undefined,
          unidad: form.unidad || undefined,
          municipio: form.municipio,
          departamento: form.departamento,
          estado: "RECIBIDA",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.detalles?.fieldErrors) {
          const mapa: Record<string, string> = {};
          for (const [campo, msgs] of Object.entries(data.detalles.fieldErrors)) {
            if (Array.isArray(msgs) && msgs.length) mapa[campo] = msgs[0] as string;
          }
          setErrores(mapa);
        }
        setErrorGeneral(data.error ?? "No se pudo registrar la donación. Intenta de nuevo.");
        return;
      }
      setLista((prev) => [data, ...prev]);
      setForm(FORM_VACIO);
      setMostrarFormulario(false);
    } catch {
      setErrorGeneral("Ocurrió un error de conexión. Intenta de nuevo.");
    } finally {
      setRegistrando(false);
    }
  }

  async function actualizar(id: string, cambios: Partial<Donacion>) {
    setLista((prev) => prev.map((d) => (d.id === id ? { ...d, ...cambios } : d)));
    await fetch(`/api/donations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <datalist id="insumos-donacion-lista">
        {INSUMOS_SUGERIDOS.map((i) => <option key={i} value={i} />)}
      </datalist>
      <datalist id="unidades-donacion-lista">
        {UNIDADES_SUGERIDAS.map((u) => <option key={u} value={u} />)}
      </datalist>

      {puedeEscribir && (
        puntos.length === 0 ? (
          <Tarjeta className="p-4 text-sm text-muted">
            Registra primero un punto de acopio para poder registrar aquí una donación ya recibida.
          </Tarjeta>
        ) : !mostrarFormulario ? (
          <Boton type="button" className="w-auto px-4" onClick={() => setMostrarFormulario(true)}>
            + Registrar donación recibida
          </Boton>
        ) : (
          <Tarjeta className="p-4">
            <p className="text-sm font-bold">Registrar donación ya recibida</p>
            <p className="mt-1 text-xs text-muted">
              Úsalo cuando el equipo recoge o recibe ayudas directamente (ej. una jornada de
              recolección). Queda registrada como recibida y suma de inmediato al inventario del
              punto de acopio.
            </p>
            <form onSubmit={registrarDonacion} className="mt-4 flex flex-col gap-3">
              {errorGeneral && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{errorGeneral}</div>}

              <div>
                <Etiqueta htmlFor="reg-punto">Punto de acopio *</Etiqueta>
                <Seleccion id="reg-punto" value={form.donationPointId} onChange={(e) => elegirPunto(e.target.value)} required>
                  <option value="">Selecciona un punto de acopio…</option>
                  {puntos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} — {p.municipio}</option>
                  ))}
                </Seleccion>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Etiqueta htmlFor="reg-nombre">¿Quién entrega la donación? *</Etiqueta>
                  <Campo
                    id="reg-nombre"
                    value={form.nombreDonante}
                    onChange={(e) => setForm((f) => ({ ...f, nombreDonante: e.target.value }))}
                    placeholder="Ej. Jornada de recolección en Calarcá"
                    required
                  />
                  <ErrorCampo mensaje={errores.nombreDonante} />
                </div>
                <div>
                  <Etiqueta htmlFor="reg-telefono">Teléfono de contacto *</Etiqueta>
                  <Campo
                    id="reg-telefono"
                    type="tel"
                    value={form.telefonoDonante}
                    onChange={(e) => setForm((f) => ({ ...f, telefonoDonante: e.target.value }))}
                    required
                  />
                  <ErrorCampo mensaje={errores.telefonoDonante} />
                </div>
              </div>

              <div>
                <Etiqueta htmlFor="reg-tipo">Tipo de ayuda *</Etiqueta>
                <Seleccion id="reg-tipo" value={form.tipoAyuda} onChange={(e) => setForm((f) => ({ ...f, tipoAyuda: e.target.value }))}>
                  {TIPOS_AYUDA.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Seleccion>
              </div>

              <div>
                <Etiqueta htmlFor="reg-descripcion">Descripción *</Etiqueta>
                <AreaTexto
                  id="reg-descripcion"
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Ej. Mercados y ropa de abrigo recogidos en la jornada"
                  required
                />
                <ErrorCampo mensaje={errores.descripcion} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <Etiqueta htmlFor="reg-insumo">Insumo específico</Etiqueta>
                  <input
                    id="reg-insumo"
                    list="insumos-donacion-lista"
                    value={form.insumo}
                    onChange={(e) => setForm((f) => ({ ...f, insumo: e.target.value }))}
                    placeholder="Ej. Arroz"
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Etiqueta htmlFor="reg-cantidad">Cantidad</Etiqueta>
                  <Campo
                    id="reg-cantidad"
                    type="number"
                    min={1}
                    value={form.cantidad}
                    onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
                  />
                </div>
                <div>
                  <Etiqueta htmlFor="reg-unidad">Unidad</Etiqueta>
                  <input
                    id="reg-unidad"
                    list="unidades-donacion-lista"
                    value={form.unidad}
                    onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value }))}
                    placeholder="kg, cajas…"
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <p className="text-xs text-muted">
                El insumo y la cantidad son opcionales, pero si los indicas, el inventario del punto
                de acopio queda actualizado de inmediato.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Etiqueta htmlFor="reg-municipio">Municipio *</Etiqueta>
                  <Campo id="reg-municipio" value={form.municipio} onChange={(e) => setForm((f) => ({ ...f, municipio: e.target.value }))} required />
                  <ErrorCampo mensaje={errores.municipio} />
                </div>
                <div>
                  <Etiqueta htmlFor="reg-departamento">Departamento *</Etiqueta>
                  <Campo id="reg-departamento" value={form.departamento} onChange={(e) => setForm((f) => ({ ...f, departamento: e.target.value }))} required />
                  <ErrorCampo mensaje={errores.departamento} />
                </div>
              </div>

              <div className="mt-1 flex gap-2">
                <Boton type="submit" className="w-auto px-5" disabled={registrando}>
                  {registrando ? "Guardando…" : "Registrar donación"}
                </Boton>
                <Boton
                  type="button"
                  variante="fantasma"
                  className="w-auto px-5"
                  onClick={() => { setMostrarFormulario(false); setForm(FORM_VACIO); setErrores({}); setErrorGeneral(null); }}
                >
                  Cancelar
                </Boton>
              </div>
            </form>
          </Tarjeta>
        )
      )}

      {lista.map((d) => (
        <Tarjeta key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-primary">{d.codigo}</p>
            <p className="text-sm font-bold">{d.tipoAyuda} · {d.nombreDonante}</p>
            <p className="text-xs text-muted">{d.descripcion} — {d.municipio} · {d.telefonoDonante}</p>
            {d.donationPoint ? (
              <p className="text-xs font-semibold text-primary">→ {d.donationPoint.nombre}</p>
            ) : (
              <p className="text-xs text-muted">Sin punto de acopio asignado — no sumará al inventario</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                list="insumos-donacion-lista"
                placeholder="Insumo específico"
                defaultValue={d.insumo ?? ""}
                onBlur={(e) => actualizar(d.id, { insumo: e.target.value || null })}
                className="w-40 rounded-lg border border-border px-2 py-1.5 text-xs"
              />
              <Campo
                type="number"
                min={1}
                placeholder="Cantidad"
                value={d.cantidad ?? ""}
                onChange={(e) => setLista((prev) => prev.map((x) => (x.id === d.id ? { ...x, cantidad: e.target.value ? Number(e.target.value) : null } : x)))}
                onBlur={(e) => actualizar(d.id, { cantidad: e.target.value ? Number(e.target.value) : null })}
                className="w-24 py-1.5 text-xs"
              />
              <input
                list="unidades-donacion-lista"
                placeholder="Unidad (kg, cajas…)"
                defaultValue={d.unidad ?? ""}
                onBlur={(e) => actualizar(d.id, { unidad: e.target.value || null })}
                className="w-36 rounded-lg border border-border px-2 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <InsigniaEstado estado={d.estado} />
            <Seleccion value={d.estado} onChange={(e) => actualizar(d.id, { estado: e.target.value })} className="w-auto py-1.5 text-xs">
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </Seleccion>
            {puedeEliminar && (
              <BotonEliminar
                endpoint={`/api/donations/${d.id}`}
                mensajeConfirmacion="¿Eliminar esta donación de forma definitiva? Esta acción no se puede deshacer."
                onEliminado={() => setLista((prev) => prev.filter((x) => x.id !== d.id))}
              />
            )}
          </div>
        </Tarjeta>
      ))}
      {lista.length === 0 && <p className="mt-2 text-sm text-muted">No se han registrado donaciones.</p>}
    </div>
  );
}
