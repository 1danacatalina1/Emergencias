import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Protección contra denegación de servicio (DoS) en los endpoints públicos,
 * requerida por la UNGRD. Usa Upstash Redis (compatible con el runtime Edge
 * del proxy) para llevar la cuenta de solicitudes por IP entre invocaciones.
 *
 * Si Redis no está configurado (por ejemplo, en desarrollo local sin las
 * variables KV_REST_API_URL/KV_REST_API_TOKEN), el límite simplemente no se
 * aplica en vez de romper la aplicación.
 */
const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
    : null;

function crearLimitador(maximo: number, ventana: `${number} ${"s" | "m" | "h"}`, prefijo: string) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maximo, ventana),
    prefix: `rl:${prefijo}`,
    analytics: false,
  });
}

// Formularios públicos de reporte (emergencias, ayuda, traslados, desaparecidos, mascotas, donaciones).
const limiteFormularios = crearLimitador(8, "1 m", "formulario");
// Inicio de sesión del panel: más estricto para dificultar fuerza bruta de contraseñas.
const limiteLogin = crearLimitador(10, "5 m", "login");
// Subida de archivos.
const limiteSubidas = crearLimitador(20, "1 m", "upload");
// API externa para integraciones (además del control por token de acceso).
const limiteApiExterna = crearLimitador(60, "1 m", "external");

export function obtenerIpDeSolicitud(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "desconocida";
}

// Si Upstash no responde a tiempo (o falla), la solicitud se deja pasar en vez de
// quedarse esperando indefinidamente: en una plataforma de emergencias, que el
// panel deje de responder es mucho peor que perder momentáneamente este control.
const TIEMPO_MAXIMO_MS = 1200;

async function aplicarLimite(limiter: Ratelimit | null, ip: string, mensaje: string): Promise<NextResponse | null> {
  if (!limiter) return null;

  let resultado: { success: boolean; reset: number } | "tiempoAgotado";
  try {
    resultado = await Promise.race([
      limiter.limit(ip),
      new Promise<"tiempoAgotado">((resolve) => setTimeout(() => resolve("tiempoAgotado"), TIEMPO_MAXIMO_MS)),
    ]);
  } catch (error) {
    console.error("Rate limit: error consultando Upstash, se permite la solicitud.", error);
    return null;
  }

  if (resultado === "tiempoAgotado") {
    console.error("Rate limit: Upstash no respondió a tiempo, se permite la solicitud.");
    return null;
  }

  if (resultado.success) return null;

  const segundosEspera = Math.max(1, Math.ceil((resultado.reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: mensaje },
    { status: 429, headers: { "Retry-After": String(segundosEspera) } },
  );
}

const RUTAS_FORMULARIO_PUBLICO = new Set([
  "/api/incidents",
  "/api/aid-requests",
  "/api/transfers",
  "/api/missing-persons",
  "/api/pets",
  "/api/donations",
  "/api/donation-points",
]);

/** Evalúa si la solicitud debe limitarse según su ruta y método. Null = continuar normalmente. */
export async function limitarSiCorresponde(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  const ip = obtenerIpDeSolicitud(request);

  if (pathname === "/api/auth/callback/credentials" && request.method === "POST") {
    return aplicarLimite(limiteLogin, ip, "Demasiados intentos de inicio de sesión. Espera unos minutos e inténtalo de nuevo.");
  }
  if (pathname === "/api/upload" && request.method === "POST") {
    return aplicarLimite(limiteSubidas, ip, "Demasiadas subidas de archivos en poco tiempo. Espera un momento.");
  }
  if (pathname.startsWith("/api/external/")) {
    return aplicarLimite(limiteApiExterna, ip, "Límite de solicitudes excedido para esta integración.");
  }
  if (RUTAS_FORMULARIO_PUBLICO.has(pathname) && request.method === "POST") {
    return aplicarLimite(limiteFormularios, ip, "Demasiadas solicitudes desde esta conexión. Espera un minuto antes de volver a intentarlo.");
  }
  return null;
}
