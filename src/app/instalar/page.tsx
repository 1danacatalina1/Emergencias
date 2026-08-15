import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import QRCode from "qrcode";
import InstalarBoton from "./InstalarBoton";
import CopiarEnlace from "./CopiarEnlace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Instala la app — Sistema de Gestión de Emergencias",
  description: "Agrega la plataforma a la pantalla de inicio de tu celular para acceder más rápido.",
};

function Paso({ numero, children }: { numero: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
        {numero}
      </span>
      <span className="text-sm text-foreground">{children}</span>
    </li>
  );
}

export default async function InstalarPage() {
  const listaCabeceras = await headers();
  const host = listaCabeceras.get("host") ?? "emergencias-psi.vercel.app";
  const protocolo = listaCabeceras.get("x-forwarded-proto") ?? "https";
  const url = `${protocolo}://${host}/instalar`;
  const qr = await QRCode.toDataURL(url, { margin: 1, width: 280 });

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background pb-16">
      <header className="bg-primary px-5 pb-6 pt-8 text-white">
        <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-white/80">
          ← Volver al inicio
        </Link>
        <h1 className="text-xl font-bold">📲 Instala la app en tu celular</h1>
        <p className="mt-1 text-sm text-white/80">
          Accede más rápido y ayuda a que la ubicación en tiempo real funcione mejor en segundo plano.
        </p>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-5 pt-6">
        <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-5 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Código QR para instalar la app" width={200} height={200} className="rounded-lg" />
          <p className="mt-3 text-xs text-muted">
            Escanea este código con la cámara de tu celular, o comparte el enlace:
          </p>
          <div className="mt-2 flex w-full items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg bg-black/[.03] p-2 text-left text-xs">{url}</code>
            <CopiarEnlace url={url} />
          </div>
          <div className="mt-4">
            <InstalarBoton />
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-base font-bold text-foreground">Android (Chrome)</h2>
          <ol className="mt-2 flex flex-col gap-2">
            <Paso numero={1}>Abre este enlace en Chrome y toca el botón &ldquo;Instalar app ahora&rdquo; de arriba.</Paso>
            <Paso numero={2}>
              Si no aparece, abre el menú <span className="font-semibold">⋮</span> (arriba a la derecha) y toca{" "}
              <span className="font-semibold">&ldquo;Instalar app&rdquo;</span> o{" "}
              <span className="font-semibold">&ldquo;Agregar a pantalla de inicio&rdquo;</span>.
            </Paso>
          </ol>
        </section>

        <section className="mt-6">
          <h2 className="text-base font-bold text-foreground">iPhone (Safari)</h2>
          <ol className="mt-2 flex flex-col gap-2">
            <Paso numero={1}>
              Toca el ícono de compartir <span className="font-semibold">⬆️</span> en la barra inferior del navegador.
            </Paso>
            <Paso numero={2}>
              Desplázate y toca <span className="font-semibold">&ldquo;Añadir a pantalla de inicio&rdquo;</span>.
            </Paso>
            <Paso numero={3}>
              Toca <span className="font-semibold">&ldquo;Añadir&rdquo;</span> arriba a la derecha.
            </Paso>
          </ol>
          <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            En iPhone, Apple no permite que ninguna app web siga enviando ubicación una vez la pantalla se
            bloquea — es una restricción del sistema operativo. Instalarla igual ayuda a que abras la app
            más rápido y a que funcione mientras la tienes activa en pantalla.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-base font-bold text-foreground">Computador (Chrome / Edge)</h2>
          <ol className="mt-2 flex flex-col gap-2">
            <Paso numero={1}>
              Busca el ícono de instalar <span className="font-semibold">⊕</span> en la barra de direcciones, o abre
              el menú <span className="font-semibold">⋮</span>.
            </Paso>
            <Paso numero={2}>
              Toca <span className="font-semibold">&ldquo;Instalar Sistema de Gestión de Emergencias…&rdquo;</span>.
            </Paso>
          </ol>
        </section>
      </main>
    </div>
  );
}
