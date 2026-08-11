import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeAuditarYExportar } from "@/lib/permisos";
import { Tarjeta } from "@/components/ui/campos";
import { formatearFechaHora } from "@/lib/fecha";

export const dynamic = "force-dynamic";

const ETIQUETAS_ACCION: Record<string, string> = {
  CREAR: "Creó",
  ACTUALIZAR: "Actualizó",
  ELIMINAR: "Eliminó",
  LOGIN: "Inició sesión",
  EXPORTAR: "Exportó",
  VER: "Consultó",
  MFA_ACTIVADA: "Activó su verificación en dos pasos",
  MFA_DESACTIVADA: "Desactivó su verificación en dos pasos",
};

// Acciones referidas al propio usuario: no tiene sentido mostrar "en User #..."
const ACCIONES_SIN_ENTIDAD = new Set(["LOGIN", "MFA_ACTIVADA", "MFA_DESACTIVADA"]);

export default async function AuditoriaPage() {
  const session = await auth();
  if (!puedeAuditarYExportar(session?.user?.role)) {
    return (
      <div>
        <h1 className="text-xl font-bold">Bitácora de auditoría</h1>
        <Tarjeta className="mt-4 p-4">
          <p className="text-sm text-muted">
            Tu rol ({session?.user?.role}) no tiene permiso para ver la bitácora de auditoría. Esta
            sección está restringida a Administradores y Coordinadores.
          </p>
        </Tarjeta>
      </div>
    );
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Bitácora de auditoría</h1>
      <p className="mt-1 text-sm text-muted">Historial de cambios realizados en el sistema.</p>

      <div className="mt-4 flex flex-col gap-2">
        {logs.map((log) => (
          <Tarjeta key={log.id} className="p-3.5">
            <p className="text-sm">
              <span className="font-bold">{log.usuarioNombre ?? "Anónimo"}</span>{" "}
              {ETIQUETAS_ACCION[log.accion] ?? log.accion}{" "}
              {!ACCIONES_SIN_ENTIDAD.has(log.accion) && (
                <>
                  <span className="font-semibold">{log.entidad}</span>{" "}
                  <span className="font-mono text-xs text-muted">#{log.entidadId.slice(0, 8)}</span>
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-muted">{formatearFechaHora(log.createdAt)} {log.ip && `· ${log.ip}`}</p>
          </Tarjeta>
        ))}
        {logs.length === 0 && <p className="text-sm text-muted">Aún no hay registros de auditoría.</p>}
      </div>
    </div>
  );
}
