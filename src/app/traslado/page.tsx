"use client";

import { useState } from "react";
import Link from "next/link";
import { EncabezadoPagina } from "@/components/EncabezadoPagina";
import { Boton, Campo, AreaTexto, Seleccion, Etiqueta, ErrorCampo, Tarjeta } from "@/components/ui/campos";
import SelectorUbicacion from "@/components/mapa/SelectorUbicacionDinamico";

export default function ReportarTrasladoPage() {
  const [nombrePersona, setNombrePersona] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("NO_INFORMA");
  const [centroMedico, setCentroMedico] = useState("");
  const [tipoTraslado, setTipoTraslado] = useState("AMBULANCIA");
  const [motivo, setMotivo] = useState("");
  const [vehiculoPlaca, setVehiculoPlaca] = useState("");
  const [responsable, setResponsable] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [reporteroNombre, setReporteroNombre] = useState("");
  const [reporteroTelefono, setReporteroTelefono] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [codigoOk, setCodigoOk] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErrores({});
    setErrorGeneral(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: {
            nombreCompleto: nombrePersona,
            numeroDocumento: numeroDocumento || undefined,
            edad: edad ? Number(edad) : undefined,
            sexo,
          },
          centroMedico,
          tipoTraslado,
          motivo,
          vehiculoPlaca: vehiculoPlaca || undefined,
          responsable: responsable || undefined,
          observaciones: observaciones || undefined,
          direccion,
          municipio,
          departamento,
          latitud: lat,
          longitud: lng,
          reporteroNombre: reporteroNombre || undefined,
          reporteroTelefono: reporteroTelefono || undefined,
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
        setErrorGeneral(data.error ?? "No pudimos registrar el traslado. Intenta de nuevo.");
        return;
      }
      setCodigoOk(true);
    } catch {
      setErrorGeneral("Ocurrió un error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (codigoOk) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-background pb-12">
        <EncabezadoPagina titulo="🚑 Reportar traslado" claseColor="bg-warning" />
        <main className="mx-auto -mt-3 w-full max-w-xl flex-1 px-4">
          <Tarjeta className="mt-4 p-6 text-center">
            <p className="text-4xl">✅</p>
            <h2 className="mt-3 text-lg font-bold">Traslado registrado</h2>
            <p className="mt-1 text-sm text-muted">El equipo de gestión ha sido notificado.</p>
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
      <EncabezadoPagina titulo="🚑 Reportar traslado" subtitulo="Registra el traslado de una persona a un centro médico" claseColor="bg-warning" />
      <main className="mx-auto -mt-3 w-full max-w-xl flex-1 px-4">
        <form onSubmit={enviar} className="mt-4 flex flex-col gap-5 pb-6">
          {errorGeneral && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{errorGeneral}</div>}

          <Tarjeta className="p-4">
            <h3 className="mb-3 font-bold">Persona trasladada</h3>
            <Etiqueta htmlFor="nombrePersona">Nombre completo *</Etiqueta>
            <Campo id="nombrePersona" value={nombrePersona} onChange={(e) => setNombrePersona(e.target.value)} required />
            <ErrorCampo mensaje={errores["persona.nombreCompleto"]} />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <Etiqueta htmlFor="documento">Documento (opcional)</Etiqueta>
                <Campo id="documento" value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} />
              </div>
              <div>
                <Etiqueta htmlFor="edad">Edad</Etiqueta>
                <Campo id="edad" type="number" min={0} value={edad} onChange={(e) => setEdad(e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <Etiqueta htmlFor="sexo">Sexo</Etiqueta>
              <Seleccion id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)}>
                <option value="NO_INFORMA">No informa</option>
                <option value="FEMENINO">Femenino</option>
                <option value="MASCULINO">Masculino</option>
                <option value="OTRO">Otro</option>
              </Seleccion>
            </div>
          </Tarjeta>

          <Tarjeta className="p-4">
            <h3 className="mb-3 font-bold">Detalles del traslado</h3>
            <Etiqueta htmlFor="centroMedico">Centro médico de destino *</Etiqueta>
            <Campo id="centroMedico" value={centroMedico} onChange={(e) => setCentroMedico(e.target.value)} required />
            <ErrorCampo mensaje={errores.centroMedico} />

            <div className="mt-4">
              <Etiqueta htmlFor="tipoTraslado">Tipo de traslado</Etiqueta>
              <Seleccion id="tipoTraslado" value={tipoTraslado} onChange={(e) => setTipoTraslado(e.target.value)}>
                <option value="AMBULANCIA">Ambulancia</option>
                <option value="VEHICULO_PARTICULAR">Vehículo particular</option>
                <option value="HELICOPTERO">Helicóptero</option>
                <option value="A_PIE">A pie</option>
                <option value="OTRO">Otro</option>
              </Seleccion>
            </div>

            <div className="mt-4">
              <Etiqueta htmlFor="motivo">Motivo del traslado *</Etiqueta>
              <AreaTexto id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} required />
              <ErrorCampo mensaje={errores.motivo} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <Etiqueta htmlFor="placa">Placa del vehículo</Etiqueta>
                <Campo id="placa" value={vehiculoPlaca} onChange={(e) => setVehiculoPlaca(e.target.value)} />
              </div>
              <div>
                <Etiqueta htmlFor="responsable">Responsable</Etiqueta>
                <Campo id="responsable" value={responsable} onChange={(e) => setResponsable(e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <Etiqueta htmlFor="observaciones">Observaciones</Etiqueta>
              <AreaTexto id="observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>
          </Tarjeta>

          <Tarjeta className="p-4">
            <h3 className="mb-3 font-bold">Ubicación del incidente</h3>
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
              </div>
              <div>
                <Etiqueta htmlFor="departamento">Departamento *</Etiqueta>
                <Campo id="departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} required />
              </div>
            </div>
          </Tarjeta>

          <Tarjeta className="p-4">
            <h3 className="mb-3 font-bold">Datos de quien reporta (opcional)</h3>
            <div className="flex flex-col gap-3">
              <Campo placeholder="Tu nombre" value={reporteroNombre} onChange={(e) => setReporteroNombre(e.target.value)} />
              <Campo placeholder="Tu teléfono" type="tel" value={reporteroTelefono} onChange={(e) => setReporteroTelefono(e.target.value)} />
            </div>
          </Tarjeta>

          <Boton type="submit" variante="emergencia" disabled={enviando}>
            {enviando ? "Enviando…" : "Registrar traslado"}
          </Boton>
        </form>
      </main>
    </div>
  );
}
