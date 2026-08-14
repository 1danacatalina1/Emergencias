import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { limitarSiCorresponde } from "@/lib/ratelimit";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const respuestaLimite = await limitarSiCorresponde(req);
  if (respuestaLimite) return respuestaLimite;

  const { pathname } = req.nextUrl;
  const RUTAS_PANEL_PUBLICAS = new Set(["/panel/login", "/panel/registro"]);
  const esRutaPanel = pathname.startsWith("/panel") && !RUTAS_PANEL_PUBLICAS.has(pathname);
  if (esRutaPanel && !req.auth?.user) {
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = "/panel/login";
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/panel/:path*",
    "/api/incidents",
    "/api/aid-requests",
    "/api/transfers",
    "/api/missing-persons",
    "/api/pets",
    "/api/donations",
    "/api/donation-points",
    "/api/registro",
    "/api/upload",
    "/api/auth/callback/credentials",
    "/api/external/:path*",
  ],
};
