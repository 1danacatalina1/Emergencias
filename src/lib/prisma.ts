import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
  var __pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está configurada");
}

const pool =
  global.__pgPool ??
  new Pool({
    connectionString,
    max: 10,
  });

// Requerido por node-postgres: sin este listener, un error asíncrono en una
// conexión inactiva del pool (p. ej. un corte de red transitorio) lanza una
// excepción no controlada en el proceso de Node en lugar de solo esa consulta.
pool.on("error", (err) => {
  console.error("Error inesperado en una conexión inactiva del pool de PostgreSQL", err);
});

const adapter = new PrismaPg(pool);

export const prisma =
  global.__prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
  global.__pgPool = pool;
}
