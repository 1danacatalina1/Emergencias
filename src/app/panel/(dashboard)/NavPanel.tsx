"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { puedeAuditarYExportar, puedeGestionarIntegraciones, puedeGestionarUsuarios, puedeVerEquipoDeCampo } from "@/lib/permisos";
import BotonSOS from "@/components/sos/BotonSOS";
import BotonUbicacion from "@/components/ubicacion/BotonUbicacion";

const REPORTES_CIUDADANIA = [
  { href: "/panel/incidentes", label: "Incidentes", icono: "🆘" },
  { href: "/panel/personas", label: "Personas", icono: "🧍" },
  { href: "/panel/traslados", label: "Traslados", icono: "🚑" },
  { href: "/panel/ayudas", label: "Ayudas", icono: "🏠" },
  { href: "/panel/donaciones", label: "Donaciones", icono: "🎁" },
  { href: "/panel/mascotas", label: "Mascotas", icono: "🐾" },
];

const EQUIPO_INICIO = { href: "/panel", label: "Inicio", icono: "📊" };
const EQUIPO_BITACORA = { href: "/panel/bitacora", label: "Bitácora de campo", icono: "📒" };
const EQUIPO_UBICACION = { href: "/panel/mi-ubicacion", label: "Mi ubicación", icono: "📍" };
const EQUIPO_SOS = { href: "/panel/sos", label: "Alertas SOS", icono: "🆘" };
const EQUIPO_MAPA = { href: "/panel/mapa-equipo", label: "Mapa del equipo", icono: "🛰️" };
const EQUIPO_PROFESIONALES = { href: "/panel/profesionales", label: "Red de profesionales", icono: "🎓" };
const EQUIPO_USUARIOS = { href: "/panel/usuarios", label: "Usuarios", icono: "👥" };
const EQUIPO_AUDITORIA = { href: "/panel/auditoria", label: "Auditoría", icono: "🕵️" };
const EQUIPO_INTEGRACIONES = { href: "/panel/integraciones", label: "Integraciones", icono: "🔌" };
const EQUIPO_SEGURIDAD = { href: "/panel/seguridad", label: "Seguridad", icono: "🔒" };

const ETIQUETAS_ROL: Record<string, string> = {
  ADMIN: "Administrador",
  COORDINADOR: "Coordinador",
  OPERADOR: "Operador",
  CONSULTA: "Consulta",
};

export default function NavPanel({ usuario }: { usuario: { name: string; role: string } }) {
  const pathname = usePathname();
  const [reportesAbierto, setReportesAbierto] = useState(false);

  let ENLACES_EQUIPO = [EQUIPO_INICIO, EQUIPO_BITACORA, EQUIPO_UBICACION];
  if (puedeVerEquipoDeCampo(usuario.role)) ENLACES_EQUIPO = [...ENLACES_EQUIPO, EQUIPO_SOS, EQUIPO_MAPA, EQUIPO_PROFESIONALES];
  if (puedeGestionarUsuarios(usuario.role)) ENLACES_EQUIPO = [...ENLACES_EQUIPO, EQUIPO_USUARIOS];
  if (puedeAuditarYExportar(usuario.role)) ENLACES_EQUIPO = [...ENLACES_EQUIPO, EQUIPO_AUDITORIA];
  if (puedeGestionarIntegraciones(usuario.role)) ENLACES_EQUIPO = [...ENLACES_EQUIPO, EQUIPO_INTEGRACIONES];
  ENLACES_EQUIPO = [...ENLACES_EQUIPO, EQUIPO_SEGURIDAD];

  return (
    <>
      <header className="flex items-center justify-between gap-3 bg-primary-dark px-4 py-3 text-white md:hidden">
        <div className="min-w-0">
          <Link href="/panel" className="block truncate font-bold">📊 Panel de gestión</Link>
          <p className="truncate text-xs text-white/70">
            {usuario.name} · {ETIQUETAS_ROL[usuario.role] ?? usuario.role}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BotonUbicacion oscuro />
          <BotonSOS />
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm font-medium text-white/80">
            Salir
          </button>
        </div>
      </header>

      {/* Pestaña + cajón deslizable de reportes ciudadanos (solo móvil) */}
      <button
        type="button"
        onClick={() => setReportesAbierto(true)}
        aria-label="Ver reportes de la ciudadanía"
        className="fixed left-0 top-[38%] z-30 flex h-16 w-6 items-center justify-center rounded-r-xl bg-primary text-white shadow-md active:scale-95 md:hidden"
      >
        <span aria-hidden>›</span>
      </button>

      {reportesAbierto && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Reportes de la ciudadanía">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReportesAbierto(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-[78%] max-w-xs flex-col overflow-y-auto bg-surface shadow-xl">
            <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Reportes de la ciudadanía</p>
                <p className="mt-0.5 text-sm font-bold">¿Qué reportó la gente?</p>
              </div>
              <button
                type="button"
                onClick={() => setReportesAbierto(false)}
                aria-label="Cerrar"
                className="shrink-0 rounded-lg px-2 py-1 text-lg text-muted"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-2">
              {REPORTES_CIUDADANIA.map((enlace) => (
                <Link
                  key={enlace.href}
                  href={enlace.href}
                  onClick={() => setReportesAbierto(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    pathname === enlace.href ? "bg-primary text-white" : "text-foreground hover:bg-black/[.03]"
                  }`}
                >
                  <span>{enlace.icono}</span>
                  {enlace.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Barra inferior del equipo de voluntarios (solo móvil) */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 flex gap-0.5 overflow-x-auto border-t border-border bg-surface px-1.5 pb-1 pt-1.5 md:hidden">
        {ENLACES_EQUIPO.map((enlace) => {
          const activo = pathname === enlace.href;
          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`flex w-16 shrink-0 flex-col items-center gap-0.5 rounded-lg py-1 text-center ${activo ? "text-primary" : "text-muted"}`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl ${activo ? "bg-primary/10" : ""}`}>
                {enlace.icono}
              </span>
              <span className="text-[10px] font-semibold leading-tight">{enlace.label}</span>
            </Link>
          );
        })}
      </nav>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface p-4 md:flex">
        <Link href="/panel" className="block text-lg font-bold text-primary">📊 Panel de gestión</Link>
        <p className="mt-0.5 truncate text-sm font-semibold text-muted">
          {usuario.name} · {ETIQUETAS_ROL[usuario.role] ?? usuario.role}
        </p>
        <div className="mb-6 mt-3 flex flex-col gap-2">
          <div className="flex items-center justify-center rounded-xl border border-border px-3 py-2">
            <BotonUbicacion />
          </div>
          <BotonSOS className="w-full justify-center" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          <p className="px-2 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wide text-muted">Reportes de la ciudadanía</p>
          {REPORTES_CIUDADANIA.map((enlace) => (
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

          <div className="my-2 border-t border-border" />

          <p className="px-2 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wide text-muted">Equipo de voluntarios</p>
          {ENLACES_EQUIPO.map((enlace) => (
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
          <p className="text-xs text-muted">{ETIQUETAS_ROL[usuario.role] ?? usuario.role}</p>
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
