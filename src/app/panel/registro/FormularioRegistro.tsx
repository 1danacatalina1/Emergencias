"use client";

import { useState } from "react";
import Link from "next/link";
import { Boton, Campo, Etiqueta, ErrorCampo, Seleccion, Tarjeta } from "@/components/ui/campos";
import { CheckboxPrivacidad } from "@/components/AvisoPrivacidad";
import SelectorUbicacion from "@/components/mapa/SelectorUbicacionDinamico";
import { TIPOS_COLABORADOR } from "@/lib/catalogos";

export default function FormularioRegistro() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccionFisica, setDireccionFisica] = useState("");
  const [contactoEmergenciaNombre, setContactoEmergenciaNombre] = useState("");
  const [contactoEmergenciaTelefono, setContactoEmergenciaTelefono] = useState("");
  const [tipoColaborador, setTipoColaborador] = useState<string>(TIPOS_COLABORADOR[0].value);

  const [lugarDireccion, setLugarDireccion] = useState("");
  const [lugarMunicipio, setLugarMunicipio] = useState("");
  const [lugarDepartamento, setLugarDepartamento] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErrores({});
    setErrorGeneral(null);
    setEnviando(true);

    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          telefono,
          direccionFisica,
          contactoEmergenciaNombre,
          contactoEmergenciaTelefono,
          tipoColaborador,
          lugarAccionDireccion: lugarDireccion,
          lugarAccionMunicipio: lugarMunicipio,
          lugarAccionDepartamento: lugarDepartamento,
          lugarAccionLat: lat,
          lugarAccionLng: lng,
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
        setErrorGeneral(data.error ?? "No pudimos completar tu registro. Intenta de nuevo.");
        return;
      }

      setEnviado(true);
    } catch {
      setErrorGeneral("Ocurrió un error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <Tarjeta className="p-6 text-center">
        <p className="text-4xl">✅</p>
        <h2 className="mt-3 text-lg font-bold">Solicitud enviada</h2>
        <p className="mt-2 text-sm text-muted">
          Tu registro quedó pendiente de aprobación. Cuando el equipo administrador confirme tu acceso,
          podrás iniciar sesión con el correo y la contraseña que registraste.
        </p>
        <Link href="/" className="mt-6 block">
          <Boton type="button" variante="secundario">Volver al inicio</Boton>
        </Link>
      </Tarjeta>
    );
  }

  return (
    <Tarjeta className="p-5">
      <form onSubmit={enviar} className="flex flex-col gap-5">
        {errorGeneral && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{errorGeneral}</div>}

        <div>
          <h3 className="mb-3 font-bold">Tus datos</h3>
          <div className="flex flex-col gap-3">
            <div>
              <Etiqueta htmlFor="tipo-colaborador">¿Cómo vas a colaborar? *</Etiqueta>
              <Seleccion id="tipo-colaborador" value={tipoColaborador} onChange={(e) => setTipoColaborador(e.target.value)}>
                {TIPOS_COLABORADOR.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Seleccion>
            </div>
            <div>
              <Etiqueta htmlFor="name">Nombre completo *</Etiqueta>
              <Campo id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              <ErrorCampo mensaje={errores.name} />
            </div>
            <div>
              <Etiqueta htmlFor="email">Correo electrónico *</Etiqueta>
              <Campo id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <ErrorCampo mensaje={errores.email} />
            </div>
            <div>
              <Etiqueta htmlFor="password">Contraseña *</Etiqueta>
              <Campo id="password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <ErrorCampo mensaje={errores.password} />
            </div>
            <div>
              <Etiqueta htmlFor="telefono">Teléfono de contacto *</Etiqueta>
              <Campo id="telefono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
              <ErrorCampo mensaje={errores.telefono} />
            </div>
            <div>
              <Etiqueta htmlFor="direccionFisica">Dirección física (residencia) *</Etiqueta>
              <Campo id="direccionFisica" value={direccionFisica} onChange={(e) => setDireccionFisica(e.target.value)} required />
              <ErrorCampo mensaje={errores.direccionFisica} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-bold">Contacto de emergencia</h3>
          <p className="mb-2 text-xs text-muted">
            A quién contactar si algo te ocurre durante el trabajo de campo.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Etiqueta htmlFor="contactoNombre">Nombre *</Etiqueta>
              <Campo id="contactoNombre" value={contactoEmergenciaNombre} onChange={(e) => setContactoEmergenciaNombre(e.target.value)} required />
              <ErrorCampo mensaje={errores.contactoEmergenciaNombre} />
            </div>
            <div>
              <Etiqueta htmlFor="contactoTelefono">Teléfono *</Etiqueta>
              <Campo id="contactoTelefono" type="tel" value={contactoEmergenciaTelefono} onChange={(e) => setContactoEmergenciaTelefono(e.target.value)} required />
              <ErrorCampo mensaje={errores.contactoEmergenciaTelefono} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-bold">Lugar donde vas a colaborar</h3>
          <SelectorUbicacion
            lat={lat}
            lng={lng}
            onChange={(la, lo) => { setLat(la); setLng(lo); }}
            onDireccionEncontrada={(d) => {
              if (!lugarDireccion && d.direccion) setLugarDireccion(d.direccion);
              if (!lugarMunicipio && d.municipio) setLugarMunicipio(d.municipio);
              if (!lugarDepartamento && d.departamento) setLugarDepartamento(d.departamento);
            }}
          />
          <ErrorCampo mensaje={errores.lugarAccionLat} />
          <div className="mt-3">
            <Etiqueta htmlFor="lugarDireccion">Dirección o punto de referencia *</Etiqueta>
            <Campo id="lugarDireccion" value={lugarDireccion} onChange={(e) => setLugarDireccion(e.target.value)} required />
            <ErrorCampo mensaje={errores.lugarAccionDireccion} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Etiqueta htmlFor="lugarMunicipio">Municipio *</Etiqueta>
              <Campo id="lugarMunicipio" value={lugarMunicipio} onChange={(e) => setLugarMunicipio(e.target.value)} required />
              <ErrorCampo mensaje={errores.lugarAccionMunicipio} />
            </div>
            <div>
              <Etiqueta htmlFor="lugarDepartamento">Departamento *</Etiqueta>
              <Campo id="lugarDepartamento" value={lugarDepartamento} onChange={(e) => setLugarDepartamento(e.target.value)} required />
              <ErrorCampo mensaje={errores.lugarAccionDepartamento} />
            </div>
          </div>
        </div>

        <CheckboxPrivacidad checked={aceptaPrivacidad} onChange={setAceptaPrivacidad} />

        <Boton type="submit" variante="primario" disabled={enviando || !aceptaPrivacidad}>
          {enviando ? "Enviando…" : "Enviar solicitud de registro"}
        </Boton>

        <p className="text-center text-xs text-muted">
          Tu solicitud debe ser aprobada por el equipo administrador antes de poder ingresar.
        </p>
      </form>
    </Tarjeta>
  );
}
