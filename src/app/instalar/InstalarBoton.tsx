"use client";

import { useEffect, useState } from "react";
import { Boton } from "@/components/ui/campos";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstalarBoton() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);

  useEffect(() => {
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

  if (instalado) {
    return <p className="text-sm font-semibold text-success">✅ Ya tienes la app instalada en este dispositivo.</p>;
  }

  if (!evento) return null;

  return (
    <Boton
      type="button"
      className="w-auto px-5"
      onClick={async () => {
        await evento.prompt();
        await evento.userChoice;
        setEvento(null);
      }}
    >
      📲 Instalar app ahora
    </Boton>
  );
}
