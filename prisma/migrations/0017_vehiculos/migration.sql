-- CreateEnum
CREATE TYPE "TipoVehiculo" AS ENUM ('CARRO', 'CAMIONETA', 'BUS_BUSETA', 'MOTO', 'CAMION', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoVehiculo" AS ENUM ('DISPONIBLE', 'EN_USO', 'MANTENIMIENTO', 'NO_DISPONIBLE');

-- CreateEnum
CREATE TYPE "EstadoNecesidadVehiculo" AS ENUM ('PENDIENTE', 'CUBIERTA');

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "tipo" "TipoVehiculo" NOT NULL DEFAULT 'CARRO',
    "marcaModelo" TEXT,
    "capacidadPersonas" INTEGER,
    "capacidadCargaDescripcion" TEXT,
    "paraPersonas" BOOLEAN NOT NULL DEFAULT true,
    "paraInsumos" BOOLEAN NOT NULL DEFAULT true,
    "municipioBase" TEXT,
    "departamentoBase" TEXT,
    "estado" "EstadoVehiculo" NOT NULL DEFAULT 'DISPONIBLE',
    "observaciones" TEXT,
    "registradoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculo_conductores" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehiculo_conductores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculo_pasajeros" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehiculo_pasajeros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "necesidades_economicas_vehiculo" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "montoEstimado" DOUBLE PRECISION,
    "descripcion" TEXT,
    "estado" "EstadoNecesidadVehiculo" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "necesidades_economicas_vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_placa_key" ON "vehiculos"("placa");

-- CreateIndex
CREATE INDEX "vehiculos_estado_idx" ON "vehiculos"("estado");

-- CreateIndex
CREATE INDEX "vehiculos_tipo_idx" ON "vehiculos"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculo_conductores_vehiculoId_usuarioId_key" ON "vehiculo_conductores"("vehiculoId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculo_pasajeros_vehiculoId_usuarioId_key" ON "vehiculo_pasajeros"("vehiculoId", "usuarioId");

-- CreateIndex
CREATE INDEX "necesidades_economicas_vehiculo_vehiculoId_idx" ON "necesidades_economicas_vehiculo"("vehiculoId");

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculo_conductores" ADD CONSTRAINT "vehiculo_conductores_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculo_conductores" ADD CONSTRAINT "vehiculo_conductores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculo_pasajeros" ADD CONSTRAINT "vehiculo_pasajeros_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculo_pasajeros" ADD CONSTRAINT "vehiculo_pasajeros_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "necesidades_economicas_vehiculo" ADD CONSTRAINT "necesidades_economicas_vehiculo_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
