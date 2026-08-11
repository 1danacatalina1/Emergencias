"use client";

import { useState } from "react";
import Link from "next/link";
import { Boton, Campo, AreaTexto, Seleccion, Etiqueta, ErrorCampo, Tarjeta } from "@/components/ui/campos";
import SelectorUbicacion from "@/components/mapa/SelectorUbicacionDinamico";

interface Props {
  tipo: "PERDIDA" | "ENCONTRADA";
  onCreado?: () => void;
}

export default function FormularioMascota({ tipo, onCreado }: Props) {
  const [foto, setFoto] = useState<File | null>(null);
  const [especie, setEspecie] = useState("PERRO");
  const [nombre, setNombre] = useState("");
  const [raza, setRaza] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");

  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoTelefono, setContactoTelefono] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);

  const esPerdida = tipo === "PERDIDA";

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
      const fotoUrl = await subirFoto();

      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          especie,
          nombre: nombre || undefined,
          raza: raza || undefined,
          descripcion,
          fecha: fecha || undefined,
          direccion,
          municipio,
          departamento,
          latitud: lat,
          longitud: lng,
          contactoNombre,
          contactoTelefono,
          fotoUrl,
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
        <p className="text-4xl">🐾</p>
        <h2 className="mt-3 text-lg font-bold">{esPerdida ? "Reporte registrado" : "¡Gracias por avisar!"}</h2>
        <p className="mt-1 text-sm text-muted">Código de seguimiento:</p>
        <p className="mt-2 rounded-lg bg-primary/5 px-4 py-2 text-xl font-mono font-bold text-primary">{codigoGenerado}</p>
        <p className="mt-3 text-sm text-muted">Ya aparece en el listado público.</p>
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
        <h3 className="mb-3 font-bold">Datos de la mascota</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Etiqueta htmlFor="especie">Especie</Etiqueta>
            <Seleccion id="especie" value={especie} onChange={(e) => setEspecie(e.target.value)}>
              <option value="PERRO">Perro</option>
              <option value="GATO">Gato</option>
              <option value="AVE">Ave</option>
              <option value="OTRO">Otro</option>
            </Seleccion>
          </div>
          <div>
            <Etiqueta htmlFor="nombre">Nombre {esPerdida ? "" : "(si lo sabes)"}</Etiqueta>
            <Campo id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <Etiqueta htmlFor="raza">Raza (opcional)</Etiqueta>
          <Campo id="raza" value={raza} onChange={(e) => setRaza(e.target.value)} />
        </div>

        <div className="mt-4">
          <Etiqueta htmlFor="descripcion">Descripción: color, tamaño, señas particulares *</Etiqueta>
          <AreaTexto
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej. Color café, tamaño mediano, collar rojo, cojea de la pata izquierda…"
            required
          />
          <ErrorCampo mensaje={errores.descripcion} />
        </div>

        <div className="mt-4">
          <Etiqueta htmlFor="foto">Foto (opcional)</Etiqueta>
          <input
            id="foto"
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
          />
        </div>

        <div className="mt-4">
          <Etiqueta htmlFor="fecha">{esPerdida ? "¿Cuándo se perdió?" : "¿Cuándo la encontraste?"} (opcional)</Etiqueta>
          <Campo id="fecha" type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      </Tarjeta>

      <Tarjeta className="p-4">
        <h3 className="mb-3 font-bold">{esPerdida ? "Último lugar donde la viste" : "Dónde la encontraste"}</h3>
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
        <Etiqueta htmlFor="contactoNombre">Tu nombre *</Etiqueta>
        <Campo id="contactoNombre" value={contactoNombre} onChange={(e) => setContactoNombre(e.target.value)} required />
        <ErrorCampo mensaje={errores.contactoNombre} />

        <div className="mt-4">
          <Etiqueta htmlFor="contactoTelefono">Tu teléfono *</Etiqueta>
          <Campo id="contactoTelefono" type="tel" value={contactoTelefono} onChange={(e) => setContactoTelefono(e.target.value)} required />
          <ErrorCampo mensaje={errores.contactoTelefono} />
        </div>
      </Tarjeta>

      <Boton type="submit" variante={esPerdida ? "emergencia" : "primario"} disabled={enviando || subiendoFoto}>
        {subiendoFoto ? "Subiendo foto…" : enviando ? "Enviando…" : esPerdida ? "Reportar mascota perdida" : "Reportar mascota encontrada"}
      </Boton>
    </form>
  );
}
