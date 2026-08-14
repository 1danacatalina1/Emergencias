"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Boton, Campo, AreaTexto, Seleccion, Etiqueta, ErrorCampo, Tarjeta } from "@/components/ui/campos";
import { TIPOS_AYUDA, INSUMOS_SUGERIDOS, UNIDADES_SUGERIDAS } from "@/lib/catalogos";
import { CheckboxPrivacidad } from "@/components/AvisoPrivacidad";

interface PuntoOpcion {
  id: string;
  nombre: string;
  municipio: string;
}

export default function FormularioDonacion() {
  const [puntos, setPuntos] = useState<PuntoOpcion[]>([]);
  const [donationPointId, setDonationPointId] = useState("");
  const [nombreDonante, setNombreDonante] = useState("");
  const [telefonoDonante, setTelefonoDonante] = useState("");
  const [tipoAyuda, setTipoAyuda] = useState("ALIMENTOS");
  const [descripcion, setDescripcion] = useState("");
  const [insumo, setInsumo] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [direccion, setDireccion] = useState("");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/donation-points")
      .then((r) => r.json())
      .then((data) => setPuntos(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErrores({});
    setErrorGeneral(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationPointId: donationPointId || undefined,
          nombreDonante,
          telefonoDonante,
          tipoAyuda,
          descripcion,
          insumo: insumo || undefined,
          cantidad: cantidad || undefined,
          unidad: unidad || undefined,
          direccion: direccion || undefined,
          municipio,
          departamento,
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
        setErrorGeneral(data.error ?? "No pudimos registrar tu donación. Intenta de nuevo.");
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
        <p className="text-4xl">🎁</p>
        <h2 className="mt-3 text-lg font-bold">¡Gracias por tu donación!</h2>
        <p className="mt-1 text-sm text-muted">Tu código de seguimiento es:</p>
        <p className="mt-2 rounded-lg bg-primary/5 px-4 py-2 text-xl font-mono font-bold text-primary">{codigoGenerado}</p>
        <p className="mt-3 text-sm text-muted">Pronto se pondrán en contacto contigo para coordinar la entrega.</p>
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
        <Etiqueta htmlFor="nombreDonante">Tu nombre completo *</Etiqueta>
        <Campo id="nombreDonante" value={nombreDonante} onChange={(e) => setNombreDonante(e.target.value)} required />
        <ErrorCampo mensaje={errores.nombreDonante} />

        <div className="mt-4">
          <Etiqueta htmlFor="telefonoDonante">Teléfono de contacto *</Etiqueta>
          <Campo id="telefonoDonante" type="tel" value={telefonoDonante} onChange={(e) => setTelefonoDonante(e.target.value)} required />
          <ErrorCampo mensaje={errores.telefonoDonante} />
        </div>
      </Tarjeta>

      <Tarjeta className="p-4">
        <Etiqueta htmlFor="tipoAyuda">¿Qué quieres donar? *</Etiqueta>
        <Seleccion id="tipoAyuda" value={tipoAyuda} onChange={(e) => setTipoAyuda(e.target.value)}>
          {TIPOS_AYUDA.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Seleccion>

        <div className="mt-4">
          <Etiqueta htmlFor="descripcion">Descripción *</Etiqueta>
          <AreaTexto
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej. Arroz, cobijas, kits de aseo…"
            required
          />
          <ErrorCampo mensaje={errores.descripcion} />
        </div>

        <div className="mt-4">
          <Etiqueta htmlFor="insumo">Insumo específico (opcional)</Etiqueta>
          <Campo id="insumo" list="insumos-donacion" value={insumo} onChange={(e) => setInsumo(e.target.value)} placeholder="Ej. Arroz, agua embotellada…" />
          <datalist id="insumos-donacion">
            {INSUMOS_SUGERIDOS.map((i) => <option key={i} value={i} />)}
          </datalist>
          <p className="mt-1 text-xs text-muted">Ayuda al punto de acopio a llevar el control exacto de lo que reciben.</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <Etiqueta htmlFor="cantidad">Cantidad (opcional)</Etiqueta>
            <Campo id="cantidad" type="number" min={1} value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Ej. 20" />
            <ErrorCampo mensaje={errores.cantidad} />
          </div>
          <div>
            <Etiqueta htmlFor="unidad">Unidad (opcional)</Etiqueta>
            <Campo id="unidad" list="unidades-donacion" value={unidad} onChange={(e) => setUnidad(e.target.value)} placeholder="kg, cajas…" />
            <datalist id="unidades-donacion">
              {UNIDADES_SUGERIDAS.map((u) => <option key={u} value={u} />)}
            </datalist>
          </div>
        </div>

        {puntos.length > 0 && (
          <div className="mt-4">
            <Etiqueta htmlFor="puntoAcopio">Entregar en un punto de acopio (opcional)</Etiqueta>
            <Seleccion id="puntoAcopio" value={donationPointId} onChange={(e) => setDonationPointId(e.target.value)}>
              <option value="">Aún no sé / me contactan para coordinar</option>
              {puntos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} — {p.municipio}</option>
              ))}
            </Seleccion>
          </div>
        )}
      </Tarjeta>

      <Tarjeta className="p-4">
        <h3 className="mb-3 font-bold">Tu ubicación</h3>
        <div>
          <Etiqueta htmlFor="direccion">Dirección (opcional)</Etiqueta>
          <Campo id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
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
        {enviando ? "Enviando…" : "Registrar donación"}
      </Boton>
    </form>
  );
}
