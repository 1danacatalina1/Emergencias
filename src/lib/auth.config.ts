import type { NextAuthConfig } from "next-auth";

/**
 * Configuración "edge-safe" sin el provider de credenciales (que depende de Prisma/pg,
 * incompatibles con el runtime Edge). Se usa en el Proxy para decidir redirecciones,
 * y se extiende en auth.ts con el provider completo para el resto de la app.
 */
export const authConfig = {
  pages: {
    signIn: "/panel/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const esRutaPanel = pathname.startsWith("/panel") && pathname !== "/panel/login";
      if (esRutaPanel) return Boolean(auth?.user);
      return true;
    },
  },
} satisfies NextAuthConfig;
