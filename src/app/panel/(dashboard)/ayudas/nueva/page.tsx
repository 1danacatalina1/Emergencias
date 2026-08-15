"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Boton, Campo, AreaTexto, Seleccion, Etiqueta, ErrorCampo, Tarjeta } from "@/components/ui/campos";
import SelectorUbicacion from "@/components/mapa/SelectorUbicacionDinamico";
import { TIPOS_AYUDA, CANALES_SOLICITUD } from "@/lib/catalogos";

export default function NuevaSolicitudAyudaPage() {
  const router = useRouter();

  const [canal, setCanal] = useState("WHATSAPP");
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
          canal,
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
        setErrorGeneral(data.error ?? "No pudimos registrar la solicitud. Intenta de nuevo.");
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
      <div>
        <h1 className="text-xl font-bold">Solicitud de ayuda</h1>
        <Tarjeta className="mt-4 p-6 text-center">
          <p className="text-4xl">✅</p>
          <h2 className="mt-3 text-lg font-bold">Solicitud registrada</h2>
          <p className="mt-1 text-sm text-muted">Código de seguimiento:</p>
          <p className="mt-2 rounded-lg bg-primary/5 px-4 py-2 text-xl font-mono font-bold text-primary">{codigoGenerado}</p>
          <div className="mt-6 flex flex-col gap-2">
            <Boton type="button" variante="primario" onClick={() => router.push("/panel/ayudas")}>
              Ver todas las solicitudes
            </Boton>
            <Boton
              type="button"
              variante="secundario"
              onClick={() => {
                setCodigoGenerado(null);
                setNombreSolicitante("");
                setTelefonoSolicitante("");
                setDescripcion("");
                setDireccion("");
                setMunicipio("");
                setDepartamento("");
                setLat(null);
                setLng(null);
              }}
            >
              Registrar otra solicitud
            </Boton>
          </div>
        </Tarjeta>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Registrar solicitud manual</h1>
      <p className="mt-1 text-sm text-muted">
        Úsala cuando alguien pide ayuda por WhatsApp, llamada o en persona, para que quede en el
        sistema con el mismo seguimiento que una solicitud enviada por la plataforma.
      </p>

      <form onSubmit={enviar} className="mt-4 flex flex-col gap-4 pb-6">
        {errorGeneral && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{errorGeneral}</div>}

        <Tarjeta className="p-4">
          <Etiqueta htmlFor="canal">¿Cómo llegó esta solicitud? *</Etiqueta>
          <Seleccion id="canal" value={canal} onChange={(e) => setCanal(e.target.value)}>
            {CANALES_SOLICITUD.filter((c) => c.value !== "PLATAFORMA").map((c) => (
              <option key={c.value} value={c.value}>{c.icono} {c.label}</option>
            ))}
          </Seleccion>
        </Tarjeta>

        <Tarjeta className="p-4">
          <Etiqueta htmlFor="nombre">Nombre completo del solicitante *</Etiqueta>
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
            <Etiqueta htmlFor="descripcion">Describe qué necesita *</Etiqueta>
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

        <div className="flex flex-col gap-2">
          <Boton type="submit" variante="primario" disabled={enviando}>
            {enviando ? "Registrando…" : "Registrar solicitud"}
          </Boton>
          <Link href="/panel/ayudas">
            <Boton type="button" variante="secundario">Cancelar</Boton>
          </Link>
        </div>
      </form>
    </div>
  );
}
