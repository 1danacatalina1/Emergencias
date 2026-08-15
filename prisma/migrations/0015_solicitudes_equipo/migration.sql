-- CreateEnum
CREATE TYPE "EstadoSeguimientoEquipo" AS ENUM ('ACEPTADO', 'PENDIENTE', 'RECHAZADO');

-- AlterTable
ALTER TABLE "seguimientos_equipo" ADD COLUMN "estado" "EstadoSeguimientoEquipo" NOT NULL DEFAULT 'ACEPTADO';

-- CreateIndex
CREATE INDEX "seguimientos_equipo_voluntarioId_idx" ON "seguimientos_equipo"("voluntarioId");

-- CreateIndex
CREATE INDEX "seguimientos_equipo_estado_idx" ON "seguimientos_equipo"("estado");
