-- AlterTable
ALTER TABLE "vehiculos" ADD COLUMN "cubreRutaNacional" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "vehiculos" ADD COLUMN "cubreRutaUrbana" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "vehiculos" ADD COLUMN "rutasCubiertas" TEXT;
