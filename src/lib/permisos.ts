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

/**
 * Crear, aprobar, editar o desactivar cuentas de voluntarios/rescatistas está
 * disponible para Administrador y Coordinador. Las cuentas de Administrador
 * en sí mismas solo las gestiona otro Administrador (ver esAdministrador).
 */
export function puedeGestionarUsuarios(rol?: string | null): boolean {
  return rol === "ADMIN" || rol === "COORDINADOR";
}

/** Asignar el rol Administrador, o editar/desactivar una cuenta que ya es Administrador, es exclusivo del propio Administrador. */
export function esAdministrador(rol?: string | null): boolean {
  return rol === "ADMIN";
}

/**
 * Ver la bitácora de campo y la ubicación en tiempo real de todo el equipo es
 * información sensible sobre el personal en terreno: reservada a quienes
 * coordinan la respuesta, no a todos los perfiles con sesión.
 */
export function puedeVerEquipoDeCampo(rol?: string | null): boolean {
  return rol === "ADMIN" || rol === "COORDINADOR";
}
