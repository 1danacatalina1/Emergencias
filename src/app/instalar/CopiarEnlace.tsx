"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/campos";

export default function CopiarEnlace({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <Boton
      type="button"
      variante="secundario"
      className="!w-auto shrink-0 px-3 py-1.5 text-xs"
      onClick={() =>
        navigator.clipboard.writeText(url).then(() => {
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2000);
        })
      }
    >
      {copiado ? "Copiado ✓" : "Copiar enlace"}
    </Boton>
  );
}
