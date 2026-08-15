"use client";

import { useEffect, useState } from "react";
import { Boton } from "@/components/ui/campos";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Plataforma = "ios" | "android" | "otro";

function detectarPlataforma(): Plataforma {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "otro";
}

const PASOS: Record<Plataforma, { titulo: string; pasos: string[] }> = {
  ios: {
    titulo: "📲 En tu iPhone",
    pasos: [
      "Toca el ícono de compartir ⬆️ en la barra de abajo del navegador.",
      "Busca y toca “Añadir a pantalla de inicio”.",
      "Toca “Añadir” arriba a la derecha. Listo.",
    ],
  },
  android: {
    titulo: "📲 En tu Android",
    pasos: [
      "Toca el menú ⋮ arriba a la derecha del navegador.",
      "Toca “Instalar app” o “Agregar a pantalla de inicio”. Listo.",
    ],
  },
  otro: {
    titulo: "📲 En tu computador",
    pasos: [
      "Busca el ícono de instalar ⊕ en la barra de direcciones, arriba.",
      "Si no lo ves, abre el menú ⋮ y toca “Instalar app”. Listo.",
    ],
  },
};

export default function InstalarBoton() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);
  const [plataforma, setPlataforma] = useState<Plataforma>("otro");
  const [mostrarPasos, setMostrarPasos] = useState(false);

  useEffect(() => {
    function inicializar() {
      setPlataforma(detectarPlataforma());
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setInstalado(true);
      }
    }
    inicializar();

    function alDetectarInstalable(e: Event) {
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
    }
    function alInstalar() {
      setInstalado(true);
      setEvento(null);
    }
    window.addEventListener("beforeinstallprompt", alDetectarInstalable);
    window.addEventListener("appinstalled", alInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", alDetectarInstalable);
      window.removeEventListener("appinstalled", alInstalar);
    };
  }, []);

  async function alTocarBoton() {
    if (evento) {
      await evento.prompt();
      await evento.userChoice;
      setEvento(null);
      return;
    }
    setMostrarPasos(true);
  }

  if (instalado) {
    return <p className="text-sm font-semibold text-success">✅ Ya tienes la app instalada en este dispositivo.</p>;
  }

  const info = PASOS[plataforma];

  return (
    <>
      <Boton type="button" className="w-auto px-6" onClick={alTocarBoton}>
        📲 Instalar en pantalla de inicio
      </Boton>

      {mostrarPasos && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-sm rounded-t-2xl bg-surface p-5 sm:rounded-2xl">
            <h2 className="text-lg font-bold">{info.titulo}</h2>
            <ol className="mt-3 flex flex-col gap-3">
              {info.pasos.map((paso, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{paso}</span>
                </li>
              ))}
            </ol>
            <Boton type="button" variante="secundario" className="mt-5" onClick={() => setMostrarPasos(false)}>
              Entendido
            </Boton>
          </div>
        </div>
      )}
    </>
  );
}
