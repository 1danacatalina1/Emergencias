"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Boton, Campo, Etiqueta, ErrorCampo, Tarjeta } from "@/components/ui/campos";

function FormularioLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/panel";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("Correo o contraseña incorrectos.");
      setEnviando(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-primary px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-white">
          <p className="text-3xl">📊</p>
          <h1 className="mt-2 text-xl font-bold">Panel de gestión</h1>
          <p className="mt-1 text-sm text-white/70">Sistema de Gestión de Emergencias</p>
        </div>
        <Tarjeta className="p-5">
          <form onSubmit={enviar} className="flex flex-col gap-4">
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{error}</div>}
            <div>
              <Etiqueta htmlFor="email">Correo electrónico</Etiqueta>
              <Campo id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Etiqueta htmlFor="password">Contraseña</Etiqueta>
              <Campo id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <ErrorCampo />
            </div>
            <Boton type="submit" variante="primario" disabled={enviando}>
              {enviando ? "Ingresando…" : "Ingresar"}
            </Boton>
          </form>
        </Tarjeta>
        <Link href="/" className="mt-4 block text-center text-sm font-medium text-white/80">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <FormularioLogin />
    </Suspense>
  );
}
