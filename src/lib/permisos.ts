/**
 * Modelo de permisos por rol (RBAC), alineado a los perfiles requeridos por
 * la UNGRD: Ciudadano (sin sesión, solo puede crear reportes públicos),
 * Operador (gestiona reportes), Administrador/Coordinador (control total).
 */

export type Rol = "ADMIN" | "COORDINADOR" | "OPERADOR" | "CONSULTA";

/** CONSULTA es de solo lectura: puede ver el panel pero no crear ni modificar nada. */
export function puedeEscribir(rol?: string | null): boolean {
  return rol === "ADMIN" || rol === "COORDINADOR" || rol === "OPERADOR";
}

/** Eliminar o descartar reportes queda reservado a perfiles de mayor responsabilidad. */
export function puedeEliminar(rol?: string | null): boolean {
  return rol === "ADMIN" || rol === "COORDINADOR";
}

/** Exportar la base completa y ver la bitácora de auditoría son acciones sensibles. */
export function puedeAuditarYExportar(rol?: string | null): boolean {
  return rol === "ADMIN" || rol === "COORDINADOR";
}

/** Emitir o revocar credenciales de integración (tokens de API) es exclusivo del Administrador. */
export function puedeGestionarIntegraciones(rol?: string | null): boolean {
  return rol === "ADMIN";
}

/** Crear, editar o desactivar cuentas del panel es exclusivo del Administrador. */
export function puedeGestionarUsuarios(rol?: string | null): boolean {
  return rol === "ADMIN";
}
