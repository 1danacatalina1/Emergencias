"use client";

import { useState } from "react";
import Link from "next/link";
import { Boton, Campo, AreaTexto, Etiqueta, ErrorCampo, Seleccion, Tarjeta } from "@/components/ui/campos";
import { CheckboxPrivacidad } from "@/components/AvisoPrivacidad";
import SelectorUbicacion from "@/components/mapa/SelectorUbicacionDinamico";
import { TIPOS_COLABORADOR, TIPOS_COLABORADOR_ORGANIZACION, TIPOS_VEHICULO } from "@/lib/catalogos";

interface CamposVehiculoProps {
  placa: string;
  setPlaca: (v: string) => void;
  tipo: string;
  setTipo: (v: string) => void;
  marcaModelo: string;
  setMarcaModelo: (v: string) => void;
  capacidadPersonas: string;
  setCapacidadPersonas: (v: string) => void;
  capacidadCarga: string;
  setCapacidadCarga: (v: string) => void;
  paraPersonas: boolean;
  setParaPersonas: (v: boolean) => void;
  paraInsumos: boolean;
  setParaInsumos: (v: boolean) => void;
  cubreRutaNacional: boolean;
  setCubreRutaNacional: (v: boolean) => void;
  cubreRutaUrbana: boolean;
  setCubreRutaUrbana: (v: boolean) => void;
  rutasCubiertas: string;
  setRutasCubiertas: (v: string) => void;
  cedula: string;
  setCedula: (v: string) => void;
  errorVehiculo?: string;
}

function CamposVehiculo({
  placa, setPlaca, tipo, setTipo, marcaModelo, setMarcaModelo,
  capacidadPersonas, setCapacidadPersonas, capacidadCarga, setCapacidadCarga,
  paraPersonas, setParaPersonas, paraInsumos, setParaInsumos,
  cubreRutaNacional, setCubreRutaNacional, cubreRutaUrbana, setCubreRutaUrbana,
  rutasCubiertas, setRutasCubiertas, cedula, setCedula, errorVehiculo,
}: CamposVehiculoProps) {
  return (
    <div className="flex flex-col gap-3">
      {errorVehiculo && <ErrorCampo mensaje={errorVehiculo} />}
      <div>
        <Etiqueta htmlFor="vehiculoPlaca">Placa *</Etiqueta>
        <Campo id="vehiculoPlaca" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} required />
      </div>
      <div>
        <Etiqueta htmlFor="vehiculoTipo">Tipo de vehículo *</Etiqueta>
        <Seleccion id="vehiculoTipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS_VEHICULO.map((t) => (
            <option key={t.value} value={t.value}>{t.icono} {t.label}</option>
          ))}
        </Seleccion>
      </div>
      <div>
        <Etiqueta htmlFor="vehiculoMarcaModelo">Marca / modelo (opcional)</Etiqueta>
        <Campo id="vehiculoMarcaModelo" value={marcaModelo} onChange={(e) => setMarcaModelo(e.target.value)} placeholder="Ej. Toyota Hilux 2018" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Etiqueta htmlFor="vehiculoCapacidadPersonas">Capacidad (personas)</Etiqueta>
          <Campo id="vehiculoCapacidadPersonas" type="number" min={0} value={capacidadPersonas} onChange={(e) => setCapacidadPersonas(e.target.value)} />
        </div>
        <div>
          <Etiqueta htmlFor="vehiculoCapacidadCarga">Capacidad de carga</Etiqueta>
          <Campo id="vehiculoCapacidadCarga" value={capacidadCarga} onChange={(e) => setCapacidadCarga(e.target.value)} placeholder="Ej. 500 kg" />
        </div>
      </div>

      <p className="text-sm font-semibold">¿Para qué se puede usar?</p>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={paraPersonas} onChange={(e) => setParaPersonas(e.target.checked)} />
          Movilizar personal / voluntarios entre ciudades
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={paraInsumos} onChange={(e) => setParaInsumos(e.target.checked)} />
          Llevar insumos a puntos de acopio
        </label>
      </div>

      <p className="text-sm font-semibold">¿Qué tipo de ruta puede cubrir?</p>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={cubreRutaNacional} onChange={(e) => setCubreRutaNacional(e.target.checked)} />
          Nacional (de ciudad a ciudad)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={cubreRutaUrbana} onChange={(e) => setCubreRutaUrbana(e.target.checked)} />
          Urbana (interna en una ciudad)
        </label>
      </div>
      <div>
        <Etiqueta htmlFor="vehiculoRutasCubiertas">Rutas específicas (opcional)</Etiqueta>
        <Campo
          id="vehiculoRutasCubiertas"
          value={rutasCubiertas}
          onChange={(e) => setRutasCubiertas(e.target.value)}
          placeholder="Ej. Bogotá - Cali, o dentro de Bogotá"
        />
      </div>

      <div>
        <Etiqueta htmlFor="vehiculoCedula">Tu número de cédula *</Etiqueta>
        <p className="mb-1 text-xs text-muted">
          Se usa para tramitar las cartas de permiso de ingreso a zonas afectadas cuando conduces este vehículo.
        </p>
        <Campo id="vehiculoCedula" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
      </div>
    </div>
  );
}

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

  const [disponibilidadTiempo, setDisponibilidadTiempo] = useState("");
  const [disponibilidadDesplazamiento, setDisponibilidadDesplazamiento] = useState(false);
  const [zonasDesplazamiento, setZonasDesplazamiento] = useState("");
  const [experticia, setExperticia] = useState("");
  const [comoPuedeAyudar, setComoPuedeAyudar] = useState("");

  const [tieneVehiculo, setTieneVehiculo] = useState(false);
  const [vehiculoPlaca, setVehiculoPlaca] = useState("");
  const [vehiculoTipo, setVehiculoTipo] = useState("CARRO");
  const [vehiculoMarcaModelo, setVehiculoMarcaModelo] = useState("");
  const [vehiculoCapacidadPersonas, setVehiculoCapacidadPersonas] = useState("");
  const [vehiculoCapacidadCarga, setVehiculoCapacidadCarga] = useState("");
  const [vehiculoParaPersonas, setVehiculoParaPersonas] = useState(true);
  const [vehiculoParaInsumos, setVehiculoParaInsumos] = useState(true);
  const [vehiculoCubreRutaNacional, setVehiculoCubreRutaNacional] = useState(false);
  const [vehiculoCubreRutaUrbana, setVehiculoCubreRutaUrbana] = useState(false);
  const [vehiculoRutasCubiertas, setVehiculoRutasCubiertas] = useState("");
  const [vehiculoCedula, setVehiculoCedula] = useState("");

  const esOrganizacion = TIPOS_COLABORADOR_ORGANIZACION.includes(tipoColaborador);
  const esVehiculoRol = tipoColaborador === "VEHICULO_DISPONIBLE";

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
          disponibilidadTiempo: (esOrganizacion || esVehiculoRol) ? undefined : disponibilidadTiempo || undefined,
          disponibilidadDesplazamiento: (esOrganizacion || esVehiculoRol) ? undefined : disponibilidadDesplazamiento,
          zonasDesplazamiento: (esOrganizacion || esVehiculoRol) ? undefined : zonasDesplazamiento || undefined,
          experticia: (esOrganizacion || esVehiculoRol) ? undefined : experticia || undefined,
          comoPuedeAyudar: (esOrganizacion || esVehiculoRol) ? undefined : comoPuedeAyudar || undefined,
          vehiculo: (esVehiculoRol || tieneVehiculo)
            ? {
                placa: vehiculoPlaca,
                tipo: vehiculoTipo,
                marcaModelo: vehiculoMarcaModelo || undefined,
                capacidadPersonas: vehiculoCapacidadPersonas ? Number(vehiculoCapacidadPersonas) : undefined,
                capacidadCargaDescripcion: vehiculoCapacidadCarga || undefined,
                paraPersonas: vehiculoParaPersonas,
                paraInsumos: vehiculoParaInsumos,
                cubreRutaNacional: vehiculoCubreRutaNacional,
                cubreRutaUrbana: vehiculoCubreRutaUrbana,
                rutasCubiertas: vehiculoRutasCubiertas || undefined,
                cedulaConductor: vehiculoCedula,
              }
            : undefined,
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

        {esVehiculoRol && (
          <div>
            <h3 className="mb-3 font-bold">Datos del vehículo</h3>
            <p className="mb-2 text-xs text-muted">
              Registra tu vehículo para que el equipo sepa que está disponible para movilizar
              personal o insumos.
            </p>
            <CamposVehiculo
              placa={vehiculoPlaca} setPlaca={setVehiculoPlaca}
              tipo={vehiculoTipo} setTipo={setVehiculoTipo}
              marcaModelo={vehiculoMarcaModelo} setMarcaModelo={setVehiculoMarcaModelo}
              capacidadPersonas={vehiculoCapacidadPersonas} setCapacidadPersonas={setVehiculoCapacidadPersonas}
              capacidadCarga={vehiculoCapacidadCarga} setCapacidadCarga={setVehiculoCapacidadCarga}
              paraPersonas={vehiculoParaPersonas} setParaPersonas={setVehiculoParaPersonas}
              paraInsumos={vehiculoParaInsumos} setParaInsumos={setVehiculoParaInsumos}
              cubreRutaNacional={vehiculoCubreRutaNacional} setCubreRutaNacional={setVehiculoCubreRutaNacional}
              cubreRutaUrbana={vehiculoCubreRutaUrbana} setCubreRutaUrbana={setVehiculoCubreRutaUrbana}
              rutasCubiertas={vehiculoRutasCubiertas} setRutasCubiertas={setVehiculoRutasCubiertas}
              cedula={vehiculoCedula} setCedula={setVehiculoCedula}
              errorVehiculo={errores.vehiculo}
            />
          </div>
        )}

        {!esOrganizacion && !esVehiculoRol && (
          <div>
            <h3 className="mb-3 font-bold">Disponibilidad y experticia</h3>
            <p className="mb-2 text-xs text-muted">
              Nos ayuda a saber a quién llamar según lo que se necesite en cada momento.
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <Etiqueta htmlFor="disponibilidadTiempo">¿Cuánto tiempo puedes aportar? (opcional)</Etiqueta>
                <Campo
                  id="disponibilidadTiempo"
                  value={disponibilidadTiempo}
                  onChange={(e) => setDisponibilidadTiempo(e.target.value)}
                  placeholder="Ej. Fines de semana, 10 horas semanales, tiempo completo…"
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={disponibilidadDesplazamiento}
                  onChange={(e) => setDisponibilidadDesplazamiento(e.target.checked)}
                  className="h-5 w-5 rounded border-border"
                />
                Puedo desplazarme a zonas afectadas
              </label>

              {disponibilidadDesplazamiento && (
                <div>
                  <Etiqueta htmlFor="zonasDesplazamiento">¿A qué zonas podrías desplazarte? (opcional)</Etiqueta>
                  <Campo
                    id="zonasDesplazamiento"
                    value={zonasDesplazamiento}
                    onChange={(e) => setZonasDesplazamiento(e.target.value)}
                    placeholder="Ej. Bogotá y municipios cercanos, todo Cundinamarca…"
                  />
                </div>
              )}

              <div>
                <Etiqueta htmlFor="experticia">¿Cuál es tu experticia o especialidad? (opcional)</Etiqueta>
                <AreaTexto
                  id="experticia"
                  value={experticia}
                  onChange={(e) => setExperticia(e.target.value)}
                  placeholder="Ej. Medicina de urgencias, cirugía veterinaria, ingeniería estructural…"
                />
              </div>

              <div>
                <Etiqueta htmlFor="comoPuedeAyudar">¿En qué consideras que puedes ayudar? (opcional)</Etiqueta>
                <AreaTexto
                  id="comoPuedeAyudar"
                  value={comoPuedeAyudar}
                  onChange={(e) => setComoPuedeAyudar(e.target.value)}
                  placeholder="Ej. Atención de heridas leves, evaluación estructural de edificaciones dañadas, revisión de mascotas afectadas…"
                />
              </div>
            </div>
          </div>
        )}

        {!esVehiculoRol && (
          <div>
            <h3 className="mb-3 font-bold">Vehículo</h3>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={tieneVehiculo}
                onChange={(e) => setTieneVehiculo(e.target.checked)}
                className="h-5 w-5 rounded border-border"
              />
              🚗 Tengo un vehículo disponible para apoyar
            </label>

            {tieneVehiculo && (
              <div className="mt-3 rounded-xl border border-border p-3">
                <CamposVehiculo
                  placa={vehiculoPlaca} setPlaca={setVehiculoPlaca}
                  tipo={vehiculoTipo} setTipo={setVehiculoTipo}
                  marcaModelo={vehiculoMarcaModelo} setMarcaModelo={setVehiculoMarcaModelo}
                  capacidadPersonas={vehiculoCapacidadPersonas} setCapacidadPersonas={setVehiculoCapacidadPersonas}
                  capacidadCarga={vehiculoCapacidadCarga} setCapacidadCarga={setVehiculoCapacidadCarga}
                  paraPersonas={vehiculoParaPersonas} setParaPersonas={setVehiculoParaPersonas}
                  paraInsumos={vehiculoParaInsumos} setParaInsumos={setVehiculoParaInsumos}
                  cubreRutaNacional={vehiculoCubreRutaNacional} setCubreRutaNacional={setVehiculoCubreRutaNacional}
                  cubreRutaUrbana={vehiculoCubreRutaUrbana} setCubreRutaUrbana={setVehiculoCubreRutaUrbana}
                  rutasCubiertas={vehiculoRutasCubiertas} setRutasCubiertas={setVehiculoRutasCubiertas}
                  cedula={vehiculoCedula} setCedula={setVehiculoCedula}
                  errorVehiculo={errores.vehiculo}
                />
              </div>
            )}
          </div>
        )}

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
