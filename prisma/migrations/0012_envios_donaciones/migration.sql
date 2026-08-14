-- CreateEnum
CREATE TYPE "EstadoEnvio" AS ENUM ('PREPARADO', 'EN_TRANSITO', 'ENTREGADO');

-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "cantidad" INTEGER,
ADD COLUMN     "unidad" TEXT;

-- CreateTable
CREATE TABLE "envios" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "donationPointId" TEXT NOT NULL,
    "destinatarioNombre" TEXT NOT NULL,
    "destinatarioTelefono" TEXT,
    "destinoLugar" TEXT NOT NULL,
    "destinoMunicipio" TEXT,
    "destinoDepartamento" TEXT,
    "responsable" TEXT NOT NULL,
    "responsableTelefono" TEXT,
    "vehiculo" TEXT,
    "vehiculoPlaca" TEXT,
    "conductorNombre" TEXT,
    "conductorTelefono" TEXT,
    "notas" TEXT,
    "estado" "EstadoEnvio" NOT NULL DEFAULT 'PREPARADO',
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "envios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envio_items" (
    "id" TEXT NOT NULL,
    "envioId" TEXT NOT NULL,
    "insumo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "unidad" TEXT,

    CONSTRAINT "envio_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "envios_codigo_key" ON "envios"("codigo");

-- CreateIndex
CREATE INDEX "envios_donationPointId_idx" ON "envios"("donationPointId");

-- CreateIndex
CREATE INDEX "envios_estado_idx" ON "envios"("estado");

-- CreateIndex
CREATE INDEX "envio_items_envioId_idx" ON "envio_items"("envioId");

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_donationPointId_fkey" FOREIGN KEY ("donationPointId") REFERENCES "donation_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio_items" ADD CONSTRAINT "envio_items_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "envios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

