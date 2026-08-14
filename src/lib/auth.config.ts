import type { NextAuthConfig } from "next-auth";

/**
 * Configuración "edge-safe" sin el provider de credenciales (que depende de Prisma/pg,
 * incompatibles con el runtime Edge). Se extiende en auth.ts con el provider completo
 * para el resto de la app.
 *
 * El Proxy (src/proxy.ts) usa esta config con su propia función envolvente, donde decide
 * las redirecciones de /panel y aplica el límite de solicitudes por IP explícitamente
 * (por eso no hay un callback `authorized` aquí: al pasar una función envolvente a
 * `auth()`, NextAuth deja de aplicar automáticamente ese callback).
 */
export const authConfig = {
  pages: {
    signIn: "/panel/login",
  },
  providers: [],
} satisfies NextAuthConfig;
