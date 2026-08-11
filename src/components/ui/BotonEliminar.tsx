"use client";

import { useState } from "react";

export default function BotonEliminar({
  endpoint,
  mensajeConfirmacion,
  onEliminado,
}: {
  endpoint: string;
  mensajeConfirmacion: string;
  onEliminado: () => void;
}) {
  const [eliminando, setEliminando] = useState(false);

  async function eliminar() {
    if (!window.confirm(mensajeConfirmacion)) return;
    setEliminando(true);
    const res = await fetch(endpoint, { method: "DELETE" });
    setEliminando(false);
    if (res.ok) {
      onEliminado();
    } else {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error ?? "No se pudo eliminar");
    }
  }

  return (
    <button
      type="button"
      onClick={eliminar}
      disabled={eliminando}
      title="Eliminar de forma definitiva"
      className="rounded-lg p-2 text-emergency hover:bg-red-50 disabled:opacity-50"
    >
      {eliminando ? "…" : "🗑️"}
    </button>
  );
}
