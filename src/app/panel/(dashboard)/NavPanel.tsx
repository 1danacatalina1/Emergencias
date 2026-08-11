"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { puedeAuditarYExportar, puedeGestionarIntegraciones } from "@/lib/permisos";

const ENLACES_BASE = [
  { href: "/panel", label: "Inicio", icono: "📊" },
  { href: "/panel/incidentes", label: "Incidentes", icono: "🆘" },
  { href: "/panel/personas", label: "Personas", icono: "🧍" },
  { href: "/panel/traslados", label: "Traslados", icono: "🚑" },
  { href: "/panel/ayudas", label: "Ayudas", icono: "🏠" },
  { href: "/panel/donaciones", label: "Donaciones", icono: "🎁" },
  { href: "/panel/mascotas", label: "Mascotas", icono: "🐾" },
  { href: "/panel/seguridad", label: "Seguridad", icono: "🔒" },
];

const ENLACE_AUDITORIA = { href: "/panel/auditoria", label: "Auditoría", icono: "🕵️" };
const ENLACE_INTEGRACIONES = { href: "/panel/integraciones", label: "Integraciones", icono: "🔌" };

export default function NavPanel({ usuario }: { usuario: { name: string; role: string } }) {
  const pathname = usePathname();
  let ENLACES = puedeAuditarYExportar(usuario.role) ? [...ENLACES_BASE, ENLACE_AUDITORIA] : ENLACES_BASE;
  if (puedeGestionarIntegraciones(usuario.role)) ENLACES = [...ENLACES, ENLACE_INTEGRACIONES];

  return (
    <>
      <header className="flex items-center justify-between gap-3 bg-primary-dark px-4 py-3 text-white md:hidden">
        <Link href="/panel" className="font-bold">📊 Panel de gestión</Link>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm font-medium text-white/80">
          Salir
        </button>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-2 py-2 md:hidden">
        {ENLACES.map((enlace) => (
          <Link
            key={enlace.href}
            href={enlace.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${
              pathname === enlace.href ? "bg-primary text-white" : "text-muted"
            }`}
          >
            <span>{enlace.icono}</span>
            {enlace.label}
          </Link>
        ))}
      </nav>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface p-4 md:flex">
        <Link href="/panel" className="mb-6 block text-lg font-bold text-primary">📊 Panel de gestión</Link>
        <nav className="flex flex-1 flex-col gap-1">
          {ENLACES.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                pathname === enlace.href ? "bg-primary text-white" : "text-foreground hover:bg-black/[.03]"
              }`}
            >
              <span>{enlace.icono}</span>
              {enlace.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-sm font-semibold">{usuario.name}</p>
          <p className="text-xs text-muted">{usuario.role}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm font-semibold text-emergency hover:bg-red-50"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
