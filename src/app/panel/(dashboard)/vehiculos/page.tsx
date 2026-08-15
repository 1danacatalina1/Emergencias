import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeVerMapaYProfesionales, puedeAuditarYExportar } from "@/lib/permisos";
import { Boton, Seleccion, Tarjeta } from "@/components/ui/campos";
import { TIPOS_VEHICULO, ESTADOS_VEHICULO } from "@/lib/catalogos";

export const dynamic = "force-dynamic";

function etiqueta(lista: readonly { value: string; label: string }[], value: string) {
  return lista.find((o) => o.value === value)?.label ?? value;
}

const COLORES_ESTADO_VEHICULO: Record<string, string> = {
  DISPONIBLE: "bg-emerald-100 text-emerald-800",
  EN_USO: "bg-amber-100 text-amber-800",
  MANTENIMIENTO: "bg-orange-100 text-orange-800",
  NO_DISPONIBLE: "bg-slate-200 text-slate-600",
};

export default async function VehiculosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; tipo?: string }>;
}) {
  const session = await auth();

  if (!puedeVerMapaYProfesionales(session?.user?.role)) {
    return (
      <div>
        <h1 className="text-xl font-bold">Vehículos</h1>
        <Tarjeta className="mt-4 p-4">
          <p className="text-sm text-muted">Esta sección está restringida a cuentas aprobadas del panel.</p>
        </Tarjeta>
      </div>
    );
  }

  const { estado, tipo } = await searchParams;
  const puedeExportar = puedeAuditarYExportar(session?.user?.role);

  const vehiculos = await prisma.vehiculo.findMany({
    where: {
      estado: estado ? (estado as never) : undefined,
      tipo: tipo ? (tipo as never) : undefined,
    },
    include: {
      conductores: { select: { id: true } },
      pasajeros: { select: { id: true } },
      necesidades: { select: { estado: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Vehículos ({vehiculos.length})</h1>
          <p className="mt-1 text-sm text-muted">
            Carros y vehículos disponibles para movilizar personal entre ciudades o llevar insumos a
            los puntos de acopio.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {puedeExportar && (
            <a href="/api/export/vehiculos">
              <Boton type="button" variante="secundario" className="w-auto px-4 py-2 text-sm">
                ⬇️ Exportar a Excel
              </Boton>
            </a>
          )}
          <Link href="/panel/vehiculos/nuevo">
            <Boton type="button" variante="primario" className="w-auto px-4 py-2 text-sm">
              🚗 Registrar vehículo
            </Boton>
          </Link>
        </div>
      </div>

      <form className="mt-4 flex flex-col gap-2 sm:flex-row" method="get">
        <Seleccion name="estado" defaultValue={estado ?? ""} className="sm:flex-1">
          <option value="">Todos los estados</option>
          {ESTADOS_VEHICULO.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </Seleccion>
        <Seleccion name="tipo" defaultValue={tipo ?? ""} className="sm:flex-1">
          <option value="">Todos los tipos</option>
          {TIPOS_VEHICULO.map((t) => <option key={t.value} value={t.value}>{t.icono} {t.label}</option>)}
        </Seleccion>
        <button type="submit" className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white sm:w-auto">
          Filtrar
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-2">
        {vehiculos.map((v) => {
          const necesidadesPendientes = v.necesidades.filter((n) => n.estado === "PENDIENTE").length;
          return (
            <Link key={v.id} href={`/panel/vehiculos/${v.id}`}>
              <Tarjeta className="flex items-center justify-between gap-3 p-3.5 transition hover:border-primary/40">
                <div className="min-w-0">
                  <p className="text-sm font-bold">
                    {TIPOS_VEHICULO.find((t) => t.value === v.tipo)?.icono ?? "🚗"} {v.placa} — {etiqueta(TIPOS_VEHICULO, v.tipo)}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {v.marcaModelo ? `${v.marcaModelo} · ` : ""}
                    {v.paraPersonas && v.paraInsumos ? "Personal e insumos" : v.paraPersonas ? "Personal" : v.paraInsumos ? "Insumos" : "Sin uso definido"}
                    {v.municipioBase ? ` · ${v.municipioBase}` : ""}
                  </p>
                  {(v.cubreRutaNacional || v.cubreRutaUrbana) && (
                    <p className="truncate text-xs text-muted">
                      {[v.cubreRutaNacional && "🛣️ Nacional", v.cubreRutaUrbana && "🏙️ Urbana"].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    👤 {v.conductores.length} conductor(es) · 🧍 {v.pasajeros.length} en el grupo
                    {necesidadesPendientes > 0 && (
                      <span className="ml-1 font-semibold text-emergency">· 💰 {necesidadesPendientes} necesidad(es) pendiente(s)</span>
                    )}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${COLORES_ESTADO_VEHICULO[v.estado] ?? "bg-slate-100 text-slate-700"}`}>
                  {etiqueta(ESTADOS_VEHICULO, v.estado)}
                </span>
              </Tarjeta>
            </Link>
          );
        })}
        {vehiculos.length === 0 && <p className="mt-4 text-sm text-muted">No se encontraron vehículos registrados.</p>}
      </div>
    </div>
  );
}
