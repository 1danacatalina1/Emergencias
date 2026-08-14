"use client";

import { useState } from "react";
import { Boton, Campo, Etiqueta, Tarjeta } from "@/components/ui/campos";

export default function CambiarContrasenaPanel() {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmar, setPasswordConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setExito(false);

    if (passwordNueva !== passwordConfirmar) {
      setError("La confirmación no coincide con la nueva contraseña");
      return;
    }

    setEnviando(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passwordActual, passwordNueva }),
    });
    const data = await res.json();
    setEnviando(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo cambiar la contraseña");
      return;
    }

    setExito(true);
    setPasswordActual("");
    setPasswordNueva("");
    setPasswordConfirmar("");
  }

  return (
    <Tarjeta className="mt-5 max-w-md p-4">
      <p className="text-sm font-semibold">Cambiar mi contraseña</p>
      {error && <div className="mt-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{error}</div>}
      {exito && <div className="mt-2 rounded-xl bg-green-50 p-3 text-sm font-medium text-success">Contraseña actualizada correctamente.</div>}
      <form onSubmit={guardar} className="mt-3 flex flex-col gap-3">
        <div>
          <Etiqueta htmlFor="password-actual">Contraseña actual</Etiqueta>
          <Campo
            id="password-actual"
            type="password"
            autoComplete="current-password"
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            required
          />
        </div>
        <div>
          <Etiqueta htmlFor="password-nueva">Nueva contraseña</Etiqueta>
          <Campo
            id="password-nueva"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            required
          />
        </div>
        <div>
          <Etiqueta htmlFor="password-confirmar">Confirmar nueva contraseña</Etiqueta>
          <Campo
            id="password-confirmar"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={passwordConfirmar}
            onChange={(e) => setPasswordConfirmar(e.target.value)}
            required
          />
        </div>
        <Boton type="submit" variante="secundario" disabled={enviando}>
          {enviando ? "Guardando…" : "Cambiar contraseña"}
        </Boton>
      </form>
    </Tarjeta>
  );
}
