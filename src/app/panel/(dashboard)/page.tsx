import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeAuditarYExportar } from "@/lib/permisos";
import { Tarjeta, Boton } from "@/components/ui/campos";
import { InsigniaEstado, InsigniaPrioridad } from "@/components/ui/insignias";

export const dynamic = "force-dynamic";

export default async function PanelInicioPage() {
  const session = await auth();
  const puedeExportar = puedeAuditarYExportar(session?.user?.role);

  const [
    totalIncidentes,
    incidentesAbiertos,
    incidentesCriticos,
    totalPersonas,
    personasDesaparecidas,
    personasFallecidas,
    totalTraslados,
    trasladosEnRuta,
    totalAyudas,
    ayudasPendientes,
    puntosAcopioActivos,
    donacionesOfrecidas,
    mascotasActivas,
    totalCoordinadores,
    totalVoluntarios,
    totalProfesionales,
    ultimosIncidentes,
  ] = await prisma.$transaction([
    prisma.incident.count(),
    prisma.incident.count({ where: { estado: { in: ["REPORTADO", "EN_ATENCION", "EN_PROCESO"] } } }),
    prisma.incident.count({ where: { nivelPrioridad: "CRITICA", estado: { notIn: ["RESUELTO", "CERRADO"] } } }),
    prisma.person.count(),
    prisma.person.count({ where: { estadoPersona: { in: ["DESAPARECIDA", "BUSQUEDA"] } } }),
    prisma.person.count({ where: { estadoPersona: "FALLECIDA" } }),
    prisma.transfer.count(),
    prisma.transfer.count({ where: { estadoTraslado: "EN_RUTA" } }),
    prisma.aidRequest.count(),
    prisma.aidRequest.count({ where: { estado: { in: ["SOLICITADA", "EN_PROCESO"] } } }),
    prisma.donationPoint.count({ where: { estado: "ACTIVO" } }),
    prisma.donation.count({ where: { estado: { in: ["OFRECIDA", "CONFIRMADA"] } } }),
    prisma.pet.count({ where: { estado: "ACTIVO" } }),
    prisma.user.count({ where: { active: true, estadoCuenta: "APROBADA", tipoColaborador: "COORDINADOR_VOLUNTARIOS" } }),
    prisma.user.count({ where: { active: true, estadoCuenta: "APROBADA", tipoColaborador: "VOLUNTARIO" } }),
    prisma.user.count({
      where: {
        active: true,
        estadoCuenta: "APROBADA",
        tipoColaborador: { in: ["PROFESIONAL_SALUD", "PROFESIONAL_VETERINARIA", "PROFESIONAL_INGENIERIA_ARQUITECTURA"] },
      },
    }),
    prisma.incident.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { incidentType: true },
    }),
  ]);

  const kpisReportes = [
    { label: "Incidentes activos", valor: incidentesAbiertos, de: totalIncidentes, color: "text-primary" },
    { label: "Críticos sin resolver", valor: incidentesCriticos, color: "text-emergency" },
    { label: "Personas desaparecidas", valor: personasDesaparecidas, de: totalPersonas, color: "text-orange-600" },
    { label: "Personas fallecidas", valor: personasFallecidas, color: "text-slate-800" },
    { label: "Traslados en ruta", valor: trasladosEnRuta, de: totalTraslados, color: "text-warning" },
    { label: "Ayudas pendientes", valor: ayudasPendientes, de: totalAyudas, color: "text-primary" },
    { label: "Puntos de acopio activos", valor: puntosAcopioActivos, color: "text-success" },
    { label: "Donaciones por gestionar", valor: donacionesOfrecidas, color: "text-success" },
    { label: "Mascotas activas", valor: mascotasActivas, color: "text-teal-700" },
  ];

  const kpisEquipo = [
    { label: "Coordinadores", valor: totalCoordinadores, color: "text-indigo-700" },
    { label: "Voluntarios", valor: totalVoluntarios, color: "text-primary" },
    { label: "Profesionales", valor: totalProfesionales, color: "text-violet-700" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Panel de gestión</h1>
        {puedeExportar && (
          <a href="/api/export/xlsx">
            <Boton type="button" variante="secundario" className="w-auto px-4 py-2 text-sm">
              ⬇️ Exportar a Excel
            </Boton>
          </a>
        )}
      </div>

      <p className="mt-1 px-1 text-[11px] font-bold uppercase tracking-wide text-muted">Reportes de la ciudadanía</p>
      <div className="mt-1.5 grid grid-cols-3 gap-2">
        {kpisReportes.map((k) => (
          <Tarjeta key={k.label} className="p-2">
            <p className={`text-base font-extrabold leading-tight ${k.color}`}>
              {k.valor}
              {k.de !== undefined && <span className="text-[11px] font-medium text-muted"> / {k.de}</span>}
            </p>
            <p className="mt-0.5 text-[10px] font-medium leading-tight text-muted">{k.label}</p>
          </Tarjeta>
        ))}
      </div>

      <p className="mt-3 px-1 text-[11px] font-bold uppercase tracking-wide text-muted">Equipo de voluntarios</p>
      <div className="mt-1.5 grid grid-cols-3 gap-2">
        {kpisEquipo.map((k) => (
          <Tarjeta key={k.label} className="p-2">
            <p className={`text-base font-extrabold leading-tight ${k.color}`}>{k.valor}</p>
            <p className="mt-0.5 text-[10px] font-medium leading-tight text-muted">{k.label}</p>
          </Tarjeta>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h2 className="font-bold">Últimos incidentes reportados</h2>
        <Link href="/panel/incidentes" className="text-sm font-semibold text-primary">Ver todos →</Link>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {ultimosIncidentes.map((inc) => (
          <Link key={inc.id} href={`/panel/incidentes/${inc.id}`}>
            <Tarjeta className="flex items-center justify-between gap-3 p-3.5 transition hover:border-primary/40">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{inc.incidentType?.nombre} · {inc.municipio}</p>
                <p className="truncate text-xs text-muted">{inc.codigo} — {inc.descripcion}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <InsigniaPrioridad prioridad={inc.nivelPrioridad} />
                <InsigniaEstado estado={inc.estado} />
              </div>
            </Tarjeta>
          </Link>
        ))}
        {ultimosIncidentes.length === 0 && <p className="text-sm text-muted">Aún no hay incidentes reportados.</p>}
      </div>
    </div>
  );
}
