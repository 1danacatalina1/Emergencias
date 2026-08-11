"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton, Campo, Etiqueta, Tarjeta } from "@/components/ui/campos";

type Vista = "activo" | "inactivo" | "enrolando" | "codigosRespaldo" | "desactivando";

export default function SeguridadPanel({
  totpEnabledInicial,
  email,
}: {
  totpEnabledInicial: boolean;
  email: string;
}) {
  const router = useRouter();
  const [vista, setVista] = useState<Vista>(totpEnabledInicial ? "activo" : "inactivo");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secreto, setSecreto] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [codigosRespaldo, setCodigosRespaldo] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function iniciarActivacion() {
    setCargando(true);
    setError(null);
    const res = await fetch("/api/mfa/enroll", { method: "POST" });
    const data = await res.json();
    setCargando(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo iniciar la activación");
      return;
    }
    setQrDataUrl(data.qrDataUrl);
    setSecreto(data.secret);
    setVista("enrolando");
  }

  async function confirmarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    const res = await fetch("/api/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: codigo }),
    });
    const data = await res.json();
    setCargando(false);
    if (!res.ok) {
      setError(data.error ?? "Código incorrecto");
      return;
    }
    setCodigosRespaldo(data.codigosRespaldo);
    setCodigo("");
    setVista("codigosRespaldo");
  }

  function terminarActivacion() {
    setVista("activo");
    router.refresh();
  }

  async function desactivar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    const res = await fetch("/api/mfa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setCargando(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo desactivar");
      return;
    }
    setPassword("");
    setVista("inactivo");
    router.refresh();
  }

  return (
    <div className="mt-5 max-w-md">
      {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{error}</div>}

      {vista === "inactivo" && (
        <Tarjeta className="p-4">
          <p className="text-sm font-semibold text-emergency">⚠️ La verificación en dos pasos está desactivada</p>
          <p className="mt-1 text-sm text-muted">
            Al activarla, además de tu contraseña necesitarás un código de 6 dígitos generado por una
            aplicación como Google Authenticator o Microsoft Authenticator para ingresar al panel.
          </p>
          <Boton className="mt-4" onClick={iniciarActivacion} disabled={cargando}>
            {cargando ? "Generando…" : "Activar verificación en dos pasos"}
          </Boton>
        </Tarjeta>
      )}

      {vista === "enrolando" && qrDataUrl && (
        <Tarjeta className="p-4">
          <p className="text-sm font-semibold">1. Escanea este código QR</p>
          <p className="mt-1 text-sm text-muted">
            Ábrelo con Google Authenticator, Microsoft Authenticator o una app similar en tu teléfono.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Código QR para configurar la verificación en dos pasos" className="mx-auto mt-3 h-48 w-48" />
          {secreto && (
            <p className="mt-2 break-all rounded-lg bg-black/[.03] p-2 text-center text-xs text-muted">
              ¿No puedes escanear? Ingresa manualmente: <span className="font-mono font-semibold">{secreto}</span>
            </p>
          )}
          <form onSubmit={confirmarCodigo} className="mt-4">
            <Etiqueta htmlFor="codigo">2. Ingresa el código de 6 dígitos que muestra la app</Etiqueta>
            <Campo
              id="codigo"
              inputMode="numeric"
              maxLength={6}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
            />
            <Boton type="submit" className="mt-3" disabled={cargando || codigo.length !== 6}>
              {cargando ? "Verificando…" : "Confirmar y activar"}
            </Boton>
          </form>
        </Tarjeta>
      )}

      {vista === "codigosRespaldo" && (
        <Tarjeta className="p-4">
          <p className="text-sm font-semibold text-success">✅ Verificación en dos pasos activada</p>
          <p className="mt-1 text-sm text-muted">
            Guarda estos códigos de respaldo en un lugar seguro. Cada uno se puede usar una sola vez para
            ingresar si pierdes acceso a tu aplicación de autenticación. No se volverán a mostrar.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-black/[.03] p-3 font-mono text-sm">
            {codigosRespaldo.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <Boton className="mt-4" onClick={terminarActivacion}>
            Ya guardé mis códigos de respaldo
          </Boton>
        </Tarjeta>
      )}

      {vista === "activo" && (
        <Tarjeta className="p-4">
          <p className="text-sm font-semibold text-success">✅ La verificación en dos pasos está activada</p>
          <p className="mt-1 text-sm text-muted">
            Cuenta: <span className="font-medium text-foreground">{email}</span>
          </p>
          <Boton variante="secundario" className="mt-4" onClick={() => setVista("desactivando")}>
            Desactivar verificación en dos pasos
          </Boton>
        </Tarjeta>
      )}

      {vista === "desactivando" && (
        <Tarjeta className="p-4">
          <p className="text-sm font-semibold">Confirma tu contraseña para desactivar</p>
          <p className="mt-1 text-sm text-muted">
            Por seguridad, ingresa tu contraseña actual para desactivar la verificación en dos pasos.
          </p>
          <form onSubmit={desactivar} className="mt-3">
            <Campo
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña actual"
              required
            />
            <div className="mt-3 flex gap-2">
              <Boton type="button" variante="secundario" onClick={() => setVista("activo")}>
                Cancelar
              </Boton>
              <Boton type="submit" variante="emergencia" disabled={cargando}>
                {cargando ? "Desactivando…" : "Desactivar"}
              </Boton>
            </div>
          </form>
        </Tarjeta>
      )}
    </div>
  );
}
