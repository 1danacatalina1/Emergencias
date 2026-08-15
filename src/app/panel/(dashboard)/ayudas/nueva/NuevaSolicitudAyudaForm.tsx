"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Boton, Campo, AreaTexto, Seleccion, Etiqueta, ErrorCampo, Tarjeta } from "@/components/ui/campos";
import SelectorUbicacion from "@/components/mapa/SelectorUbicacionDinamico";
import { TIPOS_AYUDA, CANALES_SOLICITUD } from "@/lib/catalogos";

const TIPOS_AYUDA_VALIDOS = new Set(TIPOS_AYUDA.map((t) => t.value));

export default function NuevaSolicitudAyudaForm({ esAdmin }: { esAdmin: boolean }) {
  const router = useRouter();
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const [modo, setModo] = useState<"escribir" | "captura">("escribir");
  const [analizando, setAnalizando] = useState(false);
  const [errorCaptura, setErrorCaptura] = useState<string | null>(null);
  const [datosExtraidos, setDatosExtraidos] = useState(false);

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

  async function analizarCaptura(archivo: File) {
    setAnalizando(true);
    setErrorCaptura(null);
    try {
      const formData = new FormData();
      formData.append("file", archivo);
      const res = await fetch("/api/aid-requests/extraer-captura", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorCaptura(data.error ?? "No se pudo leer la captura. Intenta de nuevo o regístrala a mano.");
        return;
      }
      if (typeof data.nombreSolicitante === "string") setNombreSolicitante(data.nombreSolicitante);
      if (typeof data.telefonoSolicitante === "string") setTelefonoSolicitante(data.telefonoSolicitante);
      if (typeof data.tipoAyuda === "string" && TIPOS_AYUDA_VALIDOS.has(data.tipoAyuda)) setTipoAyuda(data.tipoAyuda);
      if (typeof data.descripcion === "string") setDescripcion(data.descripcion);
      if (typeof data.cantidadPersonas === "number" && data.cantidadPersonas > 0) {
        setCantidadPersonas(String(Math.round(data.cantidadPersonas)));
      }
      if (typeof data.direccion === "string") setDireccion(data.direccion);
      if (typeof data.municipio === "string") setMunicipio(data.municipio);
      if (typeof data.departamento === "string") setDepartamento(data.departamento);
      setDatosExtraidos(true);
      setModo("escribir");
    } catch {
      setErrorCaptura("Ocurrió un error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setAnalizando(false);
      if (inputArchivoRef.current) inputArchivoRef.current.value = "";
    }
  }

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

  function reiniciar() {
    setCodigoGenerado(null);
    setDatosExtraidos(false);
    setNombreSolicitante("");
    setTelefonoSolicitante("");
    setDescripcion("");
    setDireccion("");
    setMunicipio("");
    setDepartamento("");
    setLat(null);
    setLng(null);
    setModo("escribir");
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
            <Boton type="button" variante="secundario" onClick={reiniciar}>
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

      {esAdmin && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setModo("escribir")}
            className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              modo === "escribir" ? "bg-primary text-white" : "bg-black/[.04] text-foreground"
            }`}
          >
            ✍️ Escribir a mano
          </button>
          <button
            type="button"
            onClick={() => { setModo("captura"); setErrorCaptura(null); }}
            className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              modo === "captura" ? "bg-primary text-white" : "bg-black/[.04] text-foreground"
            }`}
          >
            📷 Subir captura
          </button>
        </div>
      )}

      {modo === "captura" ? (
        <Tarjeta className="mt-4 p-4">
          <p className="text-sm font-bold">Sube la captura de la conversación</p>
          <p className="mt-1 text-xs text-muted">
            La plataforma lee la imagen con IA y llena el formulario por ti. Vas a poder revisar y
            corregir todo antes de registrar la solicitud.
          </p>
          {errorCaptura && (
            <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{errorCaptura}</div>
          )}
          <input
            ref={inputArchivoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={analizando}
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) analizarCaptura(archivo);
            }}
            className="mt-3 block w-full rounded-xl border border-border bg-surface p-3 text-sm"
          />
          {analizando && <p className="mt-2 text-sm font-semibold text-primary">🔍 Leyendo la captura…</p>}
        </Tarjeta>
      ) : (
        <form onSubmit={enviar} className="mt-4 flex flex-col gap-4 pb-6">
          {errorGeneral && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{errorGeneral}</div>}
          {datosExtraidos && (
            <div className="rounded-xl bg-primary/5 p-3 text-sm font-medium text-primary">
              🔍 Estos datos se extrajeron de la captura. Revísalos y corrígelos antes de registrar.
            </div>
          )}

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
      )}
    </div>
  );
}
