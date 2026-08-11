"use client";

import { useState } from "react";
import Link from "next/link";
import { Boton, Campo, AreaTexto, Seleccion, Etiqueta, ErrorCampo, Tarjeta } from "@/components/ui/campos";
import SelectorUbicacion from "@/components/mapa/SelectorUbicacionDinamico";
import { CheckboxPrivacidad } from "@/components/AvisoPrivacidad";

interface Tipo {
  id: string;
  nombre: string;
}

interface PersonaForm {
  nombreCompleto: string;
  tipoDocumento: string;
  numeroDocumento: string;
  edad: string;
  sexo: string;
  estadoPersona: string;
}

const PERSONA_VACIA: PersonaForm = {
  nombreCompleto: "",
  tipoDocumento: "SIN_DOCUMENTO",
  numeroDocumento: "",
  edad: "",
  sexo: "NO_INFORMA",
  estadoPersona: "DESAPARECIDA",
};

export default function FormularioReportar({ tipos }: { tipos: Tipo[] }) {
  const [incidentTypeId, setIncidentTypeId] = useState(tipos[0]?.id ?? "");
  const [subtipo, setSubtipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [nivelPrioridad, setNivelPrioridad] = useState("MEDIA");
  const [esAnonimo, setEsAnonimo] = useState(false);
  const [reporteroNombre, setReporteroNombre] = useState("");
  const [reporteroTelefono, setReporteroTelefono] = useState("");
  const [personas, setPersonas] = useState<PersonaForm[]>([]);
  const [fotos, setFotos] = useState<File[]>([]);
  const [subiendoFotos, setSubiendoFotos] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);

  function agregarPersona() {
    setPersonas((p) => [...p, { ...PERSONA_VACIA }]);
  }

  function actualizarPersona(idx: number, campo: keyof PersonaForm, valor: string) {
    setPersonas((p) => p.map((persona, i) => (i === idx ? { ...persona, [campo]: valor } : persona)));
  }

  function quitarPersona(idx: number) {
    setPersonas((p) => p.filter((_, i) => i !== idx));
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
    setErrores({});
    setErrorGeneral(null);
    setEnviando(true);

    try {
      const urlsFotos = await subirFotos();

      const payload = {
        incidentTypeId,
        subtipo: subtipo || undefined,
        descripcion,
        direccion,
        municipio,
        departamento,
        latitud: lat,
        longitud: lng,
        nivelPrioridad,
        esAnonimo,
        reporteroNombre: esAnonimo ? undefined : reporteroNombre || undefined,
        reporteroTelefono: esAnonimo ? undefined : reporteroTelefono || undefined,
        personas: personas
          .filter((p) => p.nombreCompleto.trim())
          .map((p) => ({
            nombreCompleto: p.nombreCompleto,
            tipoDocumento: p.tipoDocumento,
            numeroDocumento: p.numeroDocumento || undefined,
            edad: p.edad ? Number(p.edad) : undefined,
            sexo: p.sexo,
            estadoPersona: p.estadoPersona,
          })),
        fotos: urlsFotos,
      };

      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        setErrorGeneral(data.error ?? "No pudimos enviar el reporte. Intenta de nuevo.");
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
      <Tarjeta className="mt-4 p-6 text-center">
        <p className="text-4xl">✅</p>
        <h2 className="mt-3 text-lg font-bold">Emergencia reportada</h2>
        <p className="mt-1 text-sm text-muted">Tu código de seguimiento es:</p>
        <p className="mt-2 rounded-lg bg-primary/5 px-4 py-2 text-xl font-mono font-bold text-primary">{codigoGenerado}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/mapa">
            <Boton type="button" variante="primario">Ver en el mapa</Boton>
          </Link>
          <Link href="/">
            <Boton type="button" variante="secundario">Volver al inicio</Boton>
          </Link>
        </div>
      </Tarjeta>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-4 flex flex-col gap-5 pb-6">
      {errorGeneral && (
        <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{errorGeneral}</div>
      )}

      <Tarjeta className="p-4">
        <Etiqueta htmlFor="tipo">Tipo de emergencia *</Etiqueta>
        <Seleccion id="tipo" value={incidentTypeId} onChange={(e) => setIncidentTypeId(e.target.value)} required>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </Seleccion>
        <ErrorCampo mensaje={errores.incidentTypeId} />

        <div className="mt-4">
          <Etiqueta htmlFor="subtipo">Detalle adicional (opcional)</Etiqueta>
          <Campo id="subtipo" value={subtipo} onChange={(e) => setSubtipo(e.target.value)} placeholder="Ej. Edificio de 3 pisos" />
        </div>

        <div className="mt-4">
          <Etiqueta htmlFor="descripcion">Descripción *</Etiqueta>
          <AreaTexto
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe qué ocurrió, cuántas personas hay involucradas, riesgos visibles, etc."
            required
          />
          <ErrorCampo mensaje={errores.descripcion} />
        </div>

        <div className="mt-4">
          <Etiqueta htmlFor="prioridad">Nivel de prioridad</Etiqueta>
          <Seleccion id="prioridad" value={nivelPrioridad} onChange={(e) => setNivelPrioridad(e.target.value)}>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Crítica — riesgo de vida inmediato</option>
          </Seleccion>
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
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Personas afectadas</h3>
          <Boton type="button" variante="fantasma" className="w-auto px-3 py-1.5 text-sm" onClick={agregarPersona}>
            + Añadir persona
          </Boton>
        </div>
        {personas.length === 0 && <p className="mt-2 text-sm text-muted">Opcional: registra personas atrapadas, desaparecidas, heridas o fallecidas.</p>}
        <div className="mt-3 flex flex-col gap-3">
          {personas.map((persona, idx) => (
            <div key={idx} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted">Persona {idx + 1}</span>
                <button type="button" onClick={() => quitarPersona(idx)} className="text-sm font-medium text-emergency">
                  Quitar
                </button>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                <Campo
                  placeholder="Nombre completo"
                  value={persona.nombreCompleto}
                  onChange={(e) => actualizarPersona(idx, "nombreCompleto", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Campo
                    placeholder="Edad"
                    type="number"
                    min={0}
                    value={persona.edad}
                    onChange={(e) => actualizarPersona(idx, "edad", e.target.value)}
                  />
                  <Seleccion value={persona.sexo} onChange={(e) => actualizarPersona(idx, "sexo", e.target.value)}>
                    <option value="NO_INFORMA">Sexo: no informa</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="OTRO">Otro</option>
                  </Seleccion>
                </div>
                <Seleccion value={persona.estadoPersona} onChange={(e) => actualizarPersona(idx, "estadoPersona", e.target.value)}>
                  <option value="DESAPARECIDA">Desaparecida</option>
                  <option value="ATRAPADA">Atrapada</option>
                  <option value="HERIDA">Herida</option>
                  <option value="ILESA">Ilesa</option>
                  <option value="FALLECIDA">Fallecida</option>
                </Seleccion>
              </div>
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta className="p-4">
        <h3 className="mb-3 font-bold">Fotos (opcional)</h3>
        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={(e) => setFotos(Array.from(e.target.files ?? []))}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
        />
        {fotos.length > 0 && <p className="mt-2 text-sm text-muted">{fotos.length} foto(s) seleccionada(s)</p>}
      </Tarjeta>

      <Tarjeta className="p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={esAnonimo} onChange={(e) => setEsAnonimo(e.target.checked)} className="h-5 w-5 rounded border-border" />
          Reportar de forma anónima
        </label>
        {!esAnonimo && (
          <div className="mt-4 flex flex-col gap-3">
            <div>
              <Etiqueta htmlFor="reporteroNombre">Tu nombre</Etiqueta>
              <Campo id="reporteroNombre" value={reporteroNombre} onChange={(e) => setReporteroNombre(e.target.value)} />
            </div>
            <div>
              <Etiqueta htmlFor="reporteroTelefono">Tu teléfono de contacto</Etiqueta>
              <Campo id="reporteroTelefono" type="tel" value={reporteroTelefono} onChange={(e) => setReporteroTelefono(e.target.value)} />
            </div>
          </div>
        )}
      </Tarjeta>

      <CheckboxPrivacidad checked={aceptaPrivacidad} onChange={setAceptaPrivacidad} />

      <Boton type="submit" variante="emergencia" disabled={enviando || subiendoFotos || !aceptaPrivacidad}>
        {enviando ? "Enviando…" : subiendoFotos ? "Subiendo fotos…" : "Enviar reporte de emergencia"}
      </Boton>
    </form>
  );
}
