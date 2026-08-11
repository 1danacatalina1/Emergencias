"use client";

import { useState } from "react";
import Link from "next/link";
import { Boton, Campo, AreaTexto, Seleccion, Etiqueta, ErrorCampo, Tarjeta } from "@/components/ui/campos";
import SelectorUbicacion from "@/components/mapa/SelectorUbicacionDinamico";
import { CheckboxPrivacidad } from "@/components/AvisoPrivacidad";

export default function FormularioDesaparecido({ onCreado }: { onCreado?: () => void }) {
  const [foto, setFoto] = useState<File | null>(null);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("SIN_DOCUMENTO");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("NO_INFORMA");
  const [descripcionFisica, setDescripcionFisica] = useState("");
  const [fechaVisto, setFechaVisto] = useState("");

  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoTelefono, setContactoTelefono] = useState("");
  const [contactoParentesco, setContactoParentesco] = useState("");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);

  async function subirFoto(): Promise<string | undefined> {
    if (!foto) return undefined;
    setSubiendoFoto(true);
    try {
      const formData = new FormData();
      formData.append("file", foto);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        return data.url as string;
      }
      return undefined;
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErrores({});
    setErrorGeneral(null);
    setEnviando(true);
    try {
      const urlFoto = await subirFoto();

      const res = await fetch("/api/missing-persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreCompleto,
          tipoDocumento,
          numeroDocumento: numeroDocumento || undefined,
          edad: edad ? Number(edad) : undefined,
          sexo,
          descripcionFisica: descripcionFisica || undefined,
          fechaVisto: fechaVisto || undefined,
          direccion,
          municipio,
          departamento,
          latitud: lat,
          longitud: lng,
          contactoNombre,
          contactoTelefono,
          contactoParentesco: contactoParentesco || undefined,
          foto: urlFoto,
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
        setErrorGeneral(data.error ?? "No pudimos registrar el reporte. Intenta de nuevo.");
        return;
      }

      const data = await res.json();
      setCodigoGenerado(data.codigoIncidente);
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
        <p className="text-4xl">🔍</p>
        <h2 className="mt-3 text-lg font-bold">Reporte registrado</h2>
        <p className="mt-1 text-sm text-muted">Código de seguimiento:</p>
        <p className="mt-2 rounded-lg bg-primary/5 px-4 py-2 text-xl font-mono font-bold text-primary">{codigoGenerado}</p>
        <p className="mt-3 text-sm text-muted">La persona ya aparece en el listado público para ayudar a encontrarla.</p>
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
        <h3 className="mb-3 font-bold">Datos de la persona</h3>
        <Etiqueta htmlFor="nombreCompleto">Nombre completo *</Etiqueta>
        <Campo id="nombreCompleto" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required />
        <ErrorCampo mensaje={errores.nombreCompleto} />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <Etiqueta htmlFor="tipoDocumento">Tipo de documento</Etiqueta>
            <Seleccion id="tipoDocumento" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
              <option value="SIN_DOCUMENTO">Sin documento</option>
              <option value="CC">Cédula de ciudadanía</option>
              <option value="TI">Tarjeta de identidad</option>
              <option value="RC">Registro civil</option>
              <option value="CE">Cédula de extranjería</option>
              <option value="PASAPORTE">Pasaporte</option>
              <option value="NUIP">NUIP</option>
            </Seleccion>
          </div>
          <div>
            <Etiqueta htmlFor="numeroDocumento">Número (opcional)</Etiqueta>
            <Campo id="numeroDocumento" value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <Etiqueta htmlFor="edad">Edad aproximada</Etiqueta>
            <Campo id="edad" type="number" min={0} value={edad} onChange={(e) => setEdad(e.target.value)} />
          </div>
          <div>
            <Etiqueta htmlFor="sexo">Sexo</Etiqueta>
            <Seleccion id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)}>
              <option value="NO_INFORMA">No informa</option>
              <option value="FEMENINO">Femenino</option>
              <option value="MASCULINO">Masculino</option>
              <option value="OTRO">Otro</option>
            </Seleccion>
          </div>
        </div>

        <div className="mt-4">
          <Etiqueta htmlFor="descripcionFisica">Descripción física y ropa que vestía</Etiqueta>
          <AreaTexto
            id="descripcionFisica"
            value={descripcionFisica}
            onChange={(e) => setDescripcionFisica(e.target.value)}
            placeholder="Estatura, contextura, señas particulares, ropa, etc."
          />
        </div>

        <div className="mt-4">
          <Etiqueta htmlFor="foto">Foto reciente (opcional)</Etiqueta>
          <input
            id="foto"
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
          />
        </div>

        <div className="mt-4">
          <Etiqueta htmlFor="fechaVisto">¿Cuándo fue visto por última vez? (opcional)</Etiqueta>
          <Campo id="fechaVisto" type="datetime-local" value={fechaVisto} onChange={(e) => setFechaVisto(e.target.value)} />
        </div>
      </Tarjeta>

      <Tarjeta className="p-4">
        <h3 className="mb-3 font-bold">Último lugar donde fue visto</h3>
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
        <h3 className="mb-3 font-bold">Contacto (si la encuentran o tienen información)</h3>
        <Etiqueta htmlFor="contactoNombre">Tu nombre *</Etiqueta>
        <Campo id="contactoNombre" value={contactoNombre} onChange={(e) => setContactoNombre(e.target.value)} required />
        <ErrorCampo mensaje={errores.contactoNombre} />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <Etiqueta htmlFor="contactoTelefono">Tu teléfono *</Etiqueta>
            <Campo id="contactoTelefono" type="tel" value={contactoTelefono} onChange={(e) => setContactoTelefono(e.target.value)} required />
            <ErrorCampo mensaje={errores.contactoTelefono} />
          </div>
          <div>
            <Etiqueta htmlFor="contactoParentesco">Parentesco</Etiqueta>
            <Campo id="contactoParentesco" value={contactoParentesco} onChange={(e) => setContactoParentesco(e.target.value)} placeholder="Ej. Madre, hermano…" />
          </div>
        </div>
      </Tarjeta>

      <CheckboxPrivacidad checked={aceptaPrivacidad} onChange={setAceptaPrivacidad} />

      <Boton type="submit" variante="emergencia" disabled={enviando || subiendoFoto || !aceptaPrivacidad}>
        {subiendoFoto ? "Subiendo foto…" : enviando ? "Enviando…" : "Reportar persona desaparecida"}
      </Boton>
    </form>
  );
}
