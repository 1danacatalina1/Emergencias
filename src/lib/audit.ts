import { prisma } from "@/lib/prisma";
import type { AccionAuditoria } from "@/generated/prisma/enums";

interface RegistrarAuditoriaParams {
  entidad: string;
  entidadId: string;
  accion: AccionAuditoria;
  usuarioId?: string | null;
  usuarioNombre?: string | null;
  cambios?: unknown;
  ip?: string | null;
}

export async function registrarAuditoria(params: RegistrarAuditoriaParams) {
  await prisma.auditLog.create({
    data: {
      entidad: params.entidad,
      entidadId: params.entidadId,
      accion: params.accion,
      usuarioId: params.usuarioId ?? null,
      usuarioNombre: params.usuarioNombre ?? null,
      cambios: params.cambios ? JSON.parse(JSON.stringify(params.cambios)) : undefined,
      ip: params.ip ?? null,
    },
  });
}

export function obtenerIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip");
}
