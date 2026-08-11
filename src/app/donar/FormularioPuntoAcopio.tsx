"use client";

import { useState } from "react";
import Link from "next/link";
import { Boton, Campo, AreaTexto, Etiqueta, ErrorCampo, Tarjeta } from "@/components/ui/campos";
import SelectorUbicacion from "@/components/mapa/SelectorUbicacionDinamico";
import { TIPOS_AYUDA } from "@/lib/catalogos";
import { CheckboxPrivacidad } from "@/components/AvisoPrivacidad";

export default function FormularioPuntoAcopio({ onCreado }: { onCreado?: () => void }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tiposAceptados, setTiposAceptados] = useState<string[]>([]);
  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [responsable, setResponsable] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [horario, setHorario] = useState("");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);

  function alternarTipo(valor: string) {
    setTiposAceptados((prev) => (prev.includes(valor) ? prev.filter((v) => v !== valor) : [...prev, valor]));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErrores({});
    setErrorGeneral(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/donation-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          descripcion: descripcion || undefined,
          tiposAceptados,
          direccion,
          municipio,
          departamento,
          latitud: lat,
          longitud: lng,
          responsable: responsable || undefined,
          telefonoContacto,
          horario: horario || undefined,
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
        setErrorGeneral(data.error ?? "No pudimos registrar el punto de acopio. Intenta de nuevo.");
        return;
      }
      const data = await res.json();
      setCodigoGenerado(data.codigo);
      onCreado?.();
    } catch {
      setErrorGeneral("Ocurrió un error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (codigoGenerado) {
    return (
      <Tarjeta className="mt-4 p-6 text-center">
        <p className="text-4xl">📦</p>
        <h2 className="mt-3 text-lg font-bold">Punto de acopio registrado</h2>
        <p className="mt-1 text-sm text-muted">Código:</p>
        <p className="mt-2 rounded-lg bg-primary/5 px-4 py-2 text-xl font-mono font-bold text-primary">{codigoGenerado}</p>
        <p className="mt-3 text-sm text-muted">Ya aparece en la lista de puntos de acopio para que la comunidad lo vea.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/"><Boton type="button" variante="secundario">Volver al inicio</Boton></Link>
        </div>
      </Tarjeta>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-4 flex flex-col gap-5 pb-6">
      {errorGeneral && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{errorGeneral}</div>}

      <Tarjeta className="p-4">
        <Etiqueta htmlFor="nombre">Nombre del punto de acopio *</Etiqueta>
        <Campo id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Casa comunal El Rosal" required />
        <ErrorCampo mensaje={errores.nombre} />

        <div className="mt-4">
          <Etiqueta htmlFor="descripcion">Descripción (opcional)</Etiqueta>
          <AreaTexto id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>

        <div className="mt-4">
          <Etiqueta>¿Qué tipo de donaciones recibe? *</Etiqueta>
          <div className="flex flex-wrap gap-2">
            {TIPOS_AYUDA.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => alternarTipo(t.value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  tiposAceptados.includes(t.value)
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <ErrorCampo mensaje={errores.tiposAceptados} />
        </div>
      </Tarjeta>

      <Tarjeta className="p-4">
        <h3 className="mb-3 font-bold">Ubicación</h3>
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
        <ErrorCampo mensaje={errores.latitud} />

        <div className="mt-4">
          <Etiqueta htmlFor="direccion">Dirección *</Etiqueta>
          <Campo id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
          <ErrorCampo mensaje={errores.direccion} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <Etiqueta htmlFor="municipio">Municipio *</Etiqueta>
            <Campo id="municipio" value={municipio} onChange={(e) => setMunicipio(e.target.value)} required />
            <ErrorCampo mensaje={errores.municipio} />
          </div>
          <div>
            <Etiqueta htmlFor="departamento">Departamento *</Etiqueta>
            <Campo id="departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} required />
            <ErrorCampo mensaje={errores.departamento} />
          </div>
        </div>
      </Tarjeta>

      <Tarjeta className="p-4">
        <h3 className="mb-3 font-bold">Contacto</h3>
        <Etiqueta htmlFor="telefonoContacto">Teléfono de contacto *</Etiqueta>
        <Campo id="telefonoContacto" type="tel" value={telefonoContacto} onChange={(e) => setTelefonoContacto(e.target.value)} required />
        <ErrorCampo mensaje={errores.telefonoContacto} />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <Etiqueta htmlFor="responsable">Responsable</Etiqueta>
            <Campo id="responsable" value={responsable} onChange={(e) => setResponsable(e.target.value)} />
          </div>
          <div>
            <Etiqueta htmlFor="horario">Horario</Etiqueta>
            <Campo id="horario" value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="Ej. 8am - 6pm" />
          </div>
        </div>
      </Tarjeta>

      <CheckboxPrivacidad checked={aceptaPrivacidad} onChange={setAceptaPrivacidad} />

      <Boton type="submit" variante="primario" disabled={enviando || !aceptaPrivacidad}>
        {enviando ? "Enviando…" : "Registrar punto de acopio"}
      </Boton>
    </form>
  );
}
