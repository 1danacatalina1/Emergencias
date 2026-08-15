"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Boton, Campo, AreaTexto, Seleccion, Etiqueta, ErrorCampo, Tarjeta } from "@/components/ui/campos";
import { TIPOS_VEHICULO } from "@/lib/catalogos";

export default function NuevoVehiculoPage() {
  const router = useRouter();

  const [placa, setPlaca] = useState("");
  const [tipo, setTipo] = useState("CARRO");
  const [marcaModelo, setMarcaModelo] = useState("");
  const [capacidadPersonas, setCapacidadPersonas] = useState("");
  const [capacidadCargaDescripcion, setCapacidadCargaDescripcion] = useState("");
  const [paraPersonas, setParaPersonas] = useState(true);
  const [paraInsumos, setParaInsumos] = useState(true);
  const [cubreRutaNacional, setCubreRutaNacional] = useState(false);
  const [cubreRutaUrbana, setCubreRutaUrbana] = useState(false);
  const [rutasCubiertas, setRutasCubiertas] = useState("");
  const [municipioBase, setMunicipioBase] = useState("");
  const [departamentoBase, setDepartamentoBase] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErrores({});
    setErrorGeneral(null);

    if (!paraPersonas && !paraInsumos) {
      setErrorGeneral("Marca al menos un uso: personal, insumos, o ambos.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placa,
          tipo,
          marcaModelo: marcaModelo || null,
          capacidadPersonas: capacidadPersonas ? Number(capacidadPersonas) : null,
          capacidadCargaDescripcion: capacidadCargaDescripcion || null,
          paraPersonas,
          paraInsumos,
          cubreRutaNacional,
          cubreRutaUrbana,
          rutasCubiertas: rutasCubiertas || null,
          municipioBase: municipioBase || null,
          departamentoBase: departamentoBase || null,
          observaciones: observaciones || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.detalles?.fieldErrors) {
          const mapa: Record<string, string> = {};
          for (const [campo, msgs] of Object.entries(data.detalles.fieldErrors)) {
            if (Array.isArray(msgs) && msgs.length) mapa[campo] = msgs[0] as string;
          }
          setErrores(mapa);
        }
        setErrorGeneral(data.error ?? "No pudimos registrar el vehículo. Intenta de nuevo.");
        return;
      }
      const data = await res.json();
      router.push(`/panel/vehiculos/${data.id}`);
    } catch {
      setErrorGeneral("Ocurrió un error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Registrar vehículo</h1>
      <p className="mt-1 text-sm text-muted">
        Registra un vehículo disponible para movilizar personal entre ciudades o llevar insumos a
        los puntos de acopio.
      </p>

      <form onSubmit={enviar} className="mt-4 flex flex-col gap-4 pb-6">
        {errorGeneral && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{errorGeneral}</div>}

        <Tarjeta className="p-4">
          <Etiqueta htmlFor="placa">Placa *</Etiqueta>
          <Campo id="placa" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} required />
          <ErrorCampo mensaje={errores.placa} />

          <div className="mt-4">
            <Etiqueta htmlFor="tipo">Tipo de vehículo *</Etiqueta>
            <Seleccion id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {TIPOS_VEHICULO.map((t) => (
                <option key={t.value} value={t.value}>{t.icono} {t.label}</option>
              ))}
            </Seleccion>
          </div>

          <div className="mt-4">
            <Etiqueta htmlFor="marcaModelo">Marca / modelo</Etiqueta>
            <Campo id="marcaModelo" value={marcaModelo} onChange={(e) => setMarcaModelo(e.target.value)} placeholder="Ej. Toyota Hilux 2018" />
          </div>
        </Tarjeta>

        <Tarjeta className="p-4">
          <p className="text-sm font-semibold">¿Para qué se puede usar? *</p>
          <div className="mt-2 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={paraPersonas} onChange={(e) => setParaPersonas(e.target.checked)} />
              Movilizar personal / voluntarios entre ciudades
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={paraInsumos} onChange={(e) => setParaInsumos(e.target.checked)} />
              Llevar insumos a puntos de acopio
            </label>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Etiqueta htmlFor="capacidadPersonas">Capacidad (personas)</Etiqueta>
              <Campo id="capacidadPersonas" type="number" min={0} value={capacidadPersonas} onChange={(e) => setCapacidadPersonas(e.target.value)} />
            </div>
            <div>
              <Etiqueta htmlFor="capacidadCarga">Capacidad de carga</Etiqueta>
              <Campo id="capacidadCarga" value={capacidadCargaDescripcion} onChange={(e) => setCapacidadCargaDescripcion(e.target.value)} placeholder="Ej. 500 kg" />
            </div>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4">
          <p className="text-sm font-semibold">¿Qué tipo de ruta puede cubrir?</p>
          <div className="mt-2 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={cubreRutaNacional} onChange={(e) => setCubreRutaNacional(e.target.checked)} />
              Nacional (de ciudad a ciudad)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={cubreRutaUrbana} onChange={(e) => setCubreRutaUrbana(e.target.checked)} />
              Urbana (interna en una ciudad)
            </label>
          </div>
          <div className="mt-4">
            <Etiqueta htmlFor="rutasCubiertas">Rutas específicas (opcional)</Etiqueta>
            <Campo
              id="rutasCubiertas"
              value={rutasCubiertas}
              onChange={(e) => setRutasCubiertas(e.target.value)}
              placeholder="Ej. Bogotá - Cali, o dentro de Bogotá"
            />
          </div>
        </Tarjeta>

        <Tarjeta className="p-4">
          <p className="mb-3 text-sm font-semibold">Ubicación base del vehículo</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Etiqueta htmlFor="municipioBase">Municipio</Etiqueta>
              <Campo id="municipioBase" value={municipioBase} onChange={(e) => setMunicipioBase(e.target.value)} />
            </div>
            <div>
              <Etiqueta htmlFor="departamentoBase">Departamento</Etiqueta>
              <Campo id="departamentoBase" value={departamentoBase} onChange={(e) => setDepartamentoBase(e.target.value)} />
            </div>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4">
          <Etiqueta htmlFor="observaciones">Observaciones</Etiqueta>
          <AreaTexto id="observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Cualquier información adicional útil" />
        </Tarjeta>

        <p className="text-xs text-muted">
          Después de registrar el vehículo vas a poder asignarle conductores autorizados, el grupo de
          voluntarios que traslada, y las necesidades económicas para el transporte.
        </p>

        <div className="flex flex-col gap-2">
          <Boton type="submit" variante="primario" disabled={enviando}>
            {enviando ? "Registrando…" : "Registrar vehículo"}
          </Boton>
          <Link href="/panel/vehiculos">
            <Boton type="button" variante="secundario">Cancelar</Boton>
          </Link>
        </div>
      </form>
    </div>
  );
}
