-- CreateEnum
CREATE TYPE "TipoAlertaSOS" AS ENUM ('PERSONAL', 'LABOR');

-- CreateEnum
CREATE TYPE "EstadoAlertaSOS" AS ENUM ('ACTIVA', 'ATENDIDA');

-- CreateTable
CREATE TABLE "alertas_sos" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAlertaSOS" NOT NULL,
    "nota" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "estado" "EstadoAlertaSOS" NOT NULL DEFAULT 'ACTIVA',
    "autorId" TEXT NOT NULL,
    "atendidaPorId" TEXT,
    "atendidaEn" TIMESTAMP(3),
    "correoEnviado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_sos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alertas_sos_autorId_idx" ON "alertas_sos"("autorId");

-- CreateIndex
CREATE INDEX "alertas_sos_estado_idx" ON "alertas_sos"("estado");

-- CreateIndex
CREATE INDEX "alertas_sos_createdAt_idx" ON "alertas_sos"("createdAt");

-- AddForeignKey
ALTER TABLE "alertas_sos" ADD CONSTRAINT "alertas_sos_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_sos" ADD CONSTRAINT "alertas_sos_atendidaPorId_fkey" FOREIGN KEY ("atendidaPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

