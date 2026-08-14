"use client";

import { useState } from "react";
import { Boton, Campo, Etiqueta, Seleccion, Tarjeta } from "@/components/ui/campos";
import { InsigniaEstado } from "@/components/ui/insignias";
import BotonEliminar from "@/components/ui/BotonEliminar";
import { INSUMOS_SUGERIDOS, UNIDADES_SUGERIDAS } from "@/lib/catalogos";

const ESTADOS_ENVIO = ["PREPARADO", "EN_TRANSITO", "ENTREGADO"];

interface ItemForm {
  insumo: string;
  cantidad: string;
  unidad: string;
}

interface PuntoOpcion {
  id: string;
  nombre: string;
  municipio: string;
}

interface EnvioItem {
  id: string;
  insumo: string;
  cantidad: number;
  unidad: string | null;
}

interface Envio {
  id: string;
  codigo: string;
  destinatarioNombre: string;
  destinatarioTelefono: string | null;
  destinoLugar: string;
  destinoMunicipio: string | null;
  destinoDepartamento: string | null;
  responsable: string;
  responsableTelefono: string | null;
  vehiculo: string | null;
  vehiculoPlaca: string | null;
  conductorNombre: string | null;
  conductorTelefono: string | null;
  notas: string | null;
  estado: string;
  createdAt: string;
  donationPoint: { id: string; codigo: string; nombre: string };
  items: EnvioItem[];
}

const ITEM_VACIO: ItemForm = { insumo: "", cantidad: "", unidad: "unidades" };

export default function EnviosPanel({
  enviosIniciales,
  puntos,
  puedeEliminar,
}: {
  enviosIniciales: Envio[];
  puntos: PuntoOpcion[];
  puedeEliminar: boolean;
}) {
  const [envios, setEnvios] = useState(enviosIniciales);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [donationPointId, setDonationPointId] = useState(puntos[0]?.id ?? "");
  const [destinatarioNombre, setDestinatarioNombre] = useState("");
  const [destinatarioTelefono, setDestinatarioTelefono] = useState("");
  const [destinoLugar, setDestinoLugar] = useState("");
  const [destinoMunicipio, setDestinoMunicipio] = useState("");
  const [destinoDepartamento, setDestinoDepartamento] = useState("");
  const [responsable, setResponsable] = useState("");
  const [responsableTelefono, setResponsableTelefono] = useState("");
  const [vehiculo, setVehiculo] = useState("");
  const [vehiculoPlaca, setVehiculoPlaca] = useState("");
  const [conductorNombre, setConductorNombre] = useState("");
  const [conductorTelefono, setConductorTelefono] = useState("");
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<ItemForm[]>([{ ...ITEM_VACIO }]);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function limpiarFormulario() {
    setDestinatarioNombre("");
    setDestinatarioTelefono("");
    setDestinoLugar("");
    setDestinoMunicipio("");
    setDestinoDepartamento("");
    setResponsable("");
    setResponsableTelefono("");
    setVehiculo("");
    setVehiculoPlaca("");
    setConductorNombre("");
    setConductorTelefono("");
    setNotas("");
    setItems([{ ...ITEM_VACIO }]);
  }

  function actualizarItem(idx: number, campo: keyof ItemForm, valor: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [campo]: valor } : it)));
  }

  async function crearEnvio(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/envios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationPointId,
          destinatarioNombre,
          destinatarioTelefono: destinatarioTelefono || undefined,
          destinoLugar,
          destinoMunicipio: destinoMunicipio || undefined,
          destinoDepartamento: destinoDepartamento || undefined,
          responsable,
          responsableTelefono: responsableTelefono || undefined,
          vehiculo: vehiculo || undefined,
          vehiculoPlaca: vehiculoPlaca || undefined,
          conductorNombre: conductorNombre || undefined,
          conductorTelefono: conductorTelefono || undefined,
          notas: notas || undefined,
          items: items
            .filter((it) => it.insumo.trim() && it.cantidad)
            .map((it) => ({ insumo: it.insumo, cantidad: Number(it.cantidad), unidad: it.unidad || undefined })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar el envío");
        return;
      }
      setEnvios((prev) => [data, ...prev]);
      limpiarFormulario();
      setMostrarFormulario(false);
    } catch {
      setError("Ocurrió un error de conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  async function cambiarEstado(id: string, estado: string) {
    setEnvios((prev) => prev.map((en) => (en.id === id ? { ...en, estado } : en)));
    await fetch(`/api/envios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-4">
      <datalist id="insumos-sugeridos">
        {INSUMOS_SUGERIDOS.map((i) => <option key={i} value={i} />)}
      </datalist>
      <datalist id="unidades-sugeridas">
        {UNIDADES_SUGERIDAS.map((u) => <option key={u} value={u} />)}
      </datalist>

      {puntos.length === 0 ? (
        <Tarjeta className="p-4 text-sm text-muted">
          Registra primero un punto de acopio para poder crear envíos desde ahí.
        </Tarjeta>
      ) : !mostrarFormulario ? (
        <Boton type="button" className="w-auto px-4" onClick={() => setMostrarFormulario(true)}>
          + Registrar envío
        </Boton>
      ) : (
        <Tarjeta className="p-4">
          <form onSubmit={crearEnvio} className="flex flex-col gap-4">
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{error}</div>}

            <div>
              <Etiqueta htmlFor="punto-origen">Punto de acopio de origen *</Etiqueta>
              <Seleccion id="punto-origen" value={donationPointId} onChange={(e) => setDonationPointId(e.target.value)} required>
                {puntos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} — {p.municipio}</option>
                ))}
              </Seleccion>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-bold">Insumos a enviar *</h3>
              <div className="flex flex-col gap-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl border border-border p-2">
                    <input
                      list="insumos-sugeridos"
                      placeholder="Insumo (elige o escribe uno)"
                      value={item.insumo}
                      onChange={(e) => actualizarItem(idx, "insumo", e.target.value)}
                      className="min-w-[10rem] flex-1 rounded-lg border border-border px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      min={1}
                      placeholder="Cantidad"
                      value={item.cantidad}
                      onChange={(e) => actualizarItem(idx, "cantidad", e.target.value)}
                      className="w-24 rounded-lg border border-border px-3 py-2 text-sm"
                    />
                    <input
                      list="unidades-sugeridas"
                      placeholder="Unidad"
                      value={item.unidad}
                      onChange={(e) => actualizarItem(idx, "unidad", e.target.value)}
                      className="w-28 rounded-lg border border-border px-3 py-2 text-sm"
                    />
                    {items.length > 1 && (
                      <button type="button" onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))} className="text-sm font-medium text-emergency">
                        Quitar
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Boton type="button" variante="fantasma" className="mt-2 w-auto px-3 py-1.5 text-sm" onClick={() => setItems((prev) => [...prev, { ...ITEM_VACIO }])}>
                + Añadir otro insumo
              </Boton>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-bold">¿A quién se entrega?</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Campo placeholder="Nombre del destinatario *" value={destinatarioNombre} onChange={(e) => setDestinatarioNombre(e.target.value)} required />
                <Campo placeholder="Teléfono (opcional)" type="tel" value={destinatarioTelefono} onChange={(e) => setDestinatarioTelefono(e.target.value)} />
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-bold">¿Hacia dónde sale la ayuda?</h3>
              <Campo placeholder="Lugar / punto de referencia *" value={destinoLugar} onChange={(e) => setDestinoLugar(e.target.value)} required />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Campo placeholder="Municipio (opcional)" value={destinoMunicipio} onChange={(e) => setDestinoMunicipio(e.target.value)} />
                <Campo placeholder="Departamento (opcional)" value={destinoDepartamento} onChange={(e) => setDestinoDepartamento(e.target.value)} />
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-bold">¿Quién es responsable de estos insumos?</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Campo placeholder="Nombre del responsable *" value={responsable} onChange={(e) => setResponsable(e.target.value)} required />
                <Campo placeholder="Teléfono (opcional)" type="tel" value={responsableTelefono} onChange={(e) => setResponsableTelefono(e.target.value)} />
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-bold">Transporte (opcional)</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Campo placeholder="Vehículo (ej. camioneta blanca)" value={vehiculo} onChange={(e) => setVehiculo(e.target.value)} />
                <Campo placeholder="Placa" value={vehiculoPlaca} onChange={(e) => setVehiculoPlaca(e.target.value)} />
                <Campo placeholder="Nombre del conductor" value={conductorNombre} onChange={(e) => setConductorNombre(e.target.value)} />
                <Campo placeholder="Teléfono del conductor" type="tel" value={conductorTelefono} onChange={(e) => setConductorTelefono(e.target.value)} />
              </div>
            </div>

            <div>
              <Etiqueta htmlFor="notas-envio">Notas (opcional)</Etiqueta>
              <Campo id="notas-envio" value={notas} onChange={(e) => setNotas(e.target.value)} />
            </div>

            <div className="flex gap-2">
              <Boton type="submit" className="w-auto px-5" disabled={enviando}>
                {enviando ? "Guardando…" : "Registrar envío"}
              </Boton>
              <Boton type="button" variante="fantasma" className="w-auto px-5" onClick={() => { setMostrarFormulario(false); limpiarFormulario(); }}>
                Cancelar
              </Boton>
            </div>
          </form>
        </Tarjeta>
      )}

      <div className="flex flex-col gap-2">
        {envios.map((en) => (
          <Tarjeta key={en.id} className="p-3.5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-primary">{en.codigo}</p>
                <p className="text-sm font-bold">{en.donationPoint.nombre} → {en.destinoLugar}</p>
                <p className="text-xs text-muted">
                  {[en.destinoMunicipio, en.destinoDepartamento].filter(Boolean).join(", ")}
                </p>
                <p className="mt-1 text-xs">
                  Entregado a <span className="font-semibold">{en.destinatarioNombre}</span>
                  {en.destinatarioTelefono && ` · ${en.destinatarioTelefono}`}
                </p>
                <p className="text-xs">
                  Responsable: <span className="font-semibold">{en.responsable}</span>
                  {en.responsableTelefono && ` · ${en.responsableTelefono}`}
                </p>
                {(en.vehiculo || en.vehiculoPlaca || en.conductorNombre || en.conductorTelefono) && (
                  <p className="mt-1 text-xs text-muted">
                    🚚 {[en.vehiculo, en.vehiculoPlaca, en.conductorNombre, en.conductorTelefono].filter(Boolean).join(" · ")}
                  </p>
                )}
                <ul className="mt-2 flex flex-col gap-0.5">
                  {en.items.map((it) => (
                    <li key={it.id} className="text-xs">
                      • {it.cantidad} {it.unidad ?? ""} de {it.insumo}
                    </li>
                  ))}
                </ul>
                {en.notas && <p className="mt-1 text-xs italic text-muted">{en.notas}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <InsigniaEstado estado={en.estado} />
                <Seleccion value={en.estado} onChange={(e) => cambiarEstado(en.id, e.target.value)} className="w-auto py-1.5 text-xs">
                  {ESTADOS_ENVIO.map((es) => <option key={es} value={es}>{es}</option>)}
                </Seleccion>
                {puedeEliminar && (
                  <BotonEliminar
                    endpoint={`/api/envios/${en.id}`}
                    mensajeConfirmacion="¿Eliminar este envío de forma definitiva? Esta acción no se puede deshacer."
                    onEliminado={() => setEnvios((prev) => prev.filter((x) => x.id !== en.id))}
                  />
                )}
              </div>
            </div>
          </Tarjeta>
        ))}
        {envios.length === 0 && <p className="text-sm text-muted">Aún no se han registrado envíos.</p>}
      </div>
    </div>
  );
}
