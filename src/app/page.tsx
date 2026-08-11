import Link from "next/link";

const ACCIONES = [
  {
    href: "/reportar",
    icono: "🆘",
    titulo: "Reportar emergencia",
    descripcion: "Estructuras colapsadas, personas atrapadas, desaparecidas o fallecidas",
    clase: "bg-emergency text-white",
  },
  {
    href: "/desaparecidos",
    icono: "🔍",
    titulo: "Persona desaparecida",
    descripcion: "Reporta a alguien desaparecido o ayuda a identificar a los ya reportados",
    clase: "bg-violet-700 text-white",
  },
  {
    href: "/ayuda",
    icono: "🏠",
    titulo: "Solicitar ayuda",
    descripcion: "Alimentos, agua, refugio, medicamentos y otras ayudas humanitarias",
    clase: "bg-primary text-white",
  },
  {
    href: "/traslado",
    icono: "🚑",
    titulo: "Reportar traslado",
    descripcion: "Registra el traslado de una persona a un centro médico",
    clase: "bg-warning text-white",
  },
  {
    href: "/donar",
    icono: "🎁",
    titulo: "Donar",
    descripcion: "Dona artículos o registra un punto de acopio para donaciones",
    clase: "bg-success text-white",
  },
  {
    href: "/mascotas",
    icono: "🐾",
    titulo: "Mascotas",
    descripcion: "Reporta una mascota perdida o avisa que encontraste una",
    clase: "bg-teal-700 text-white",
  },
  {
    href: "/mapa",
    icono: "📍",
    titulo: "Ver mapa",
    descripcion: "Consulta los incidentes activos georreferenciados",
    clase: "bg-surface text-foreground border border-border",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header
        className="relative overflow-hidden px-5 pb-8 pt-10 text-white"
        style={{
          background:
            "linear-gradient(to bottom, #FCD116 0%, #FCD116 50%, #003893 50%, #003893 75%, #CE1126 75%, #CE1126 100%)",
        }}
      >
        <div className="absolute inset-0 bg-black/40" aria-hidden />
        <div className="relative">
          <p className="text-sm font-medium uppercase tracking-wide text-white/80">Colombia · Atención de emergencias</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight drop-shadow-sm">Sistema de Gestión de Emergencias</h1>
          <p className="mt-2 text-sm text-white/90">
            Reporta y consulta información durante una emergencia o desastre. Actúa ahora.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-10 pt-5">
        <div className="flex flex-col gap-3">
          {ACCIONES.map((accion) => (
            <Link
              key={accion.href}
              href={accion.href}
              className={`flex items-center gap-4 rounded-2xl p-5 shadow-md transition active:scale-[0.98] ${accion.clase}`}
            >
              <span className="text-4xl leading-none" aria-hidden>
                {accion.icono}
              </span>
              <span className="flex-1">
                <span className="block text-lg font-bold">{accion.titulo}</span>
                <span className="mt-0.5 block text-sm opacity-90">{accion.descripcion}</span>
              </span>
              <span aria-hidden className="text-2xl opacity-70">
                →
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/panel"
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface p-4 text-sm font-semibold text-muted transition hover:bg-black/[.02]"
        >
          📊 Panel de gestión
        </Link>

        <p className="mt-8 text-center text-xs text-muted">
          Si tu vida o la de alguien más está en peligro inmediato, comunícate primero con la línea de emergencias 123.
        </p>
        <p className="mt-3 text-center text-xs text-muted">
          <Link href="/privacidad" className="underline">Aviso de privacidad y tratamiento de datos personales</Link>
        </p>
      </main>
    </div>
  );
}
