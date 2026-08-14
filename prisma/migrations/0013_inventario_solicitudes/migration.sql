-- CreateEnum
CREATE TYPE "EstadoSolicitudInsumo" AS ENUM ('ABIERTA', 'RESUELTA', 'CANCELADA');

-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "insumo" TEXT;

-- AlterTable
ALTER TABLE "envios" ADD COLUMN     "solicitudInsumoId" TEXT;

-- CreateTable
CREATE TABLE "inventario_items" (
    "id" TEXT NOT NULL,
    "donationPointId" TEXT NOT NULL,
    "insumo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "unidad" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventario_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_insumo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "donationPointId" TEXT NOT NULL,
    "insumo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "unidad" TEXT,
    "notas" TEXT,
    "estado" "EstadoSolicitudInsumo" NOT NULL DEFAULT 'ABIERTA',
    "creadoPorId" TEXT,
    "resueltaEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_insumo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventario_items_donationPointId_idx" ON "inventario_items"("donationPointId");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_items_donationPointId_insumo_key" ON "inventario_items"("donationPointId", "insumo");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_insumo_codigo_key" ON "solicitudes_insumo"("codigo");

-- CreateIndex
CREATE INDEX "solicitudes_insumo_donationPointId_idx" ON "solicitudes_insumo"("donationPointId");

-- CreateIndex
CREATE INDEX "solicitudes_insumo_estado_idx" ON "solicitudes_insumo"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "envios_solicitudInsumoId_key" ON "envios"("solicitudInsumoId");

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_solicitudInsumoId_fkey" FOREIGN KEY ("solicitudInsumoId") REFERENCES "solicitudes_insumo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_items" ADD CONSTRAINT "inventario_items_donationPointId_fkey" FOREIGN KEY ("donationPointId") REFERENCES "donation_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_insumo" ADD CONSTRAINT "solicitudes_insumo_donationPointId_fkey" FOREIGN KEY ("donationPointId") REFERENCES "donation_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_insumo" ADD CONSTRAINT "solicitudes_insumo_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

