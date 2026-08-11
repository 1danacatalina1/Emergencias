"use client";

import { useState } from "react";
import Link from "next/link";
import { EncabezadoPagina } from "@/components/EncabezadoPagina";
import { Boton, Campo, AreaTexto, Seleccion, Etiqueta, ErrorCampo, Tarjeta } from "@/components/ui/campos";
import SelectorUbicacion from "@/components/mapa/SelectorUbicacionDinamico";
import { TIPOS_AYUDA } from "@/lib/catalogos";
import { CheckboxPrivacidad } from "@/components/AvisoPrivacidad";

export default function SolicitarAyudaPage() {
  const [nombreSolicitante, setNombreSolicitante] = useState("");
  const [telefonoSolicitante, setTelefonoSolicitante] = useState("");
  const [tipoAyuda, setTipoAyuda] = useState("ALIMENTOS");
  const [descripcion, setDescripcion] = useState("");
  const [cantidadPersonas, setCantidadPersonas] = useState("1");
  const [prioridad, setPrioridad] = useState("MEDIA");
  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErrores({});
    setErrorGeneral(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/aid-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreSolicitante,
          telefonoSolicitante,
          tipoAyuda,
          descripcion,
          cantidadPersonas: Number(cantidadPersonas) || 1,
          prioridad,
          direccion,
          municipio,
          departamento,
          latitud: lat,
          longitud: lng,
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
        setErrorGeneral(data.error ?? "No pudimos enviar tu solicitud. Intenta de nuevo.");
        return;
      }
      const data = await res.json();
      setCodigoGenerado(data.codigo);
    } catch {
      setErrorGeneral("Ocurrió un error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (codigoGenerado) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-background pb-12">
        <EncabezadoPagina titulo="🏠 Solicitar ayuda" claseColor="bg-primary" />
        <main className="mx-auto -mt-3 w-full max-w-xl flex-1 px-4">
          <Tarjeta className="mt-4 p-6 text-center">
            <p className="text-4xl">✅</p>
            <h2 className="mt-3 text-lg font-bold">Solicitud registrada</h2>
            <p className="mt-1 text-sm text-muted">Tu código de seguimiento es:</p>
            <p className="mt-2 rounded-lg bg-primary/5 px-4 py-2 text-xl font-mono font-bold text-primary">{codigoGenerado}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/mapa"><Boton type="button" variante="primario">Ver en el mapa</Boton></Link>
              <Link href="/"><Boton type="button" variante="secundario">Volver al inicio</Boton></Link>
            </div>
          </Tarjeta>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background pb-12">
      <EncabezadoPagina titulo="🏠 Solicitar ayuda" subtitulo="Alimentos, agua, refugio, medicamentos y más" claseColor="bg-primary" />
      <main className="mx-auto -mt-3 w-full max-w-xl flex-1 px-4">
        <form onSubmit={enviar} className="mt-4 flex flex-col gap-5 pb-6">
          {errorGeneral && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{errorGeneral}</div>}

          <Tarjeta className="p-4">
            <Etiqueta htmlFor="nombre">Tu nombre completo *</Etiqueta>
            <Campo id="nombre" value={nombreSolicitante} onChange={(e) => setNombreSolicitante(e.target.value)} required />
            <ErrorCampo mensaje={errores.nombreSolicitante} />

            <div className="mt-4">
              <Etiqueta htmlFor="telefono">Teléfono de contacto *</Etiqueta>
              <Campo id="telefono" type="tel" value={telefonoSolicitante} onChange={(e) => setTelefonoSolicitante(e.target.value)} required />
              <ErrorCampo mensaje={errores.telefonoSolicitante} />
            </div>
          </Tarjeta>

          <Tarjeta className="p-4">
            <Etiqueta htmlFor="tipoAyuda">Tipo de ayuda *</Etiqueta>
            <Seleccion id="tipoAyuda" value={tipoAyuda} onChange={(e) => setTipoAyuda(e.target.value)}>
              {TIPOS_AYUDA.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Seleccion>

            <div className="mt-4">
              <Etiqueta htmlFor="descripcion">Describe qué necesitas *</Etiqueta>
              <AreaTexto id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
              <ErrorCampo mensaje={errores.descripcion} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <Etiqueta htmlFor="personas">Personas a beneficiar</Etiqueta>
                <Campo id="personas" type="number" min={1} value={cantidadPersonas} onChange={(e) => setCantidadPersonas(e.target.value)} />
              </div>
              <div>
                <Etiqueta htmlFor="prioridad">Urgencia</Etiqueta>
                <Seleccion id="prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="CRITICA">Crítica</option>
                </Seleccion>
              </div>
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

          <CheckboxPrivacidad checked={aceptaPrivacidad} onChange={setAceptaPrivacidad} />

          <Boton type="submit" variante="primario" disabled={enviando || !aceptaPrivacidad}>
            {enviando ? "Enviando…" : "Enviar solicitud de ayuda"}
          </Boton>
        </form>
      </main>
    </div>
  );
}
