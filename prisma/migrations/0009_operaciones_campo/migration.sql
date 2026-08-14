-- CreateEnum
CREATE TYPE "EstadoCuentaUsuario" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoColaborador" AS ENUM ('RESCATISTA', 'VOLUNTARIO', 'COORDINADOR_VOLUNTARIOS', 'CENTRO_ACOPIO', 'ENTIDAD', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoRegistroBitacora" AS ENUM ('ACTUALIZACION', 'NECESIDAD');

-- CreateEnum
CREATE TYPE "EstadoNecesidadCampo" AS ENUM ('PENDIENTE', 'ATENDIDA');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AccionAuditoria" ADD VALUE 'APROBAR';
ALTER TYPE "AccionAuditoria" ADD VALUE 'RECHAZAR';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aprobadoEn" TIMESTAMP(3),
ADD COLUMN     "aprobadoPorId" TEXT,
ADD COLUMN     "compartirUbicacion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contactoEmergenciaNombre" TEXT,
ADD COLUMN     "contactoEmergenciaTelefono" TEXT,
ADD COLUMN     "direccionFisica" TEXT,
ADD COLUMN     "estadoCuenta" "EstadoCuentaUsuario" NOT NULL DEFAULT 'APROBADA',
ADD COLUMN     "lugarAccionDepartamento" TEXT,
ADD COLUMN     "lugarAccionDireccion" TEXT,
ADD COLUMN     "lugarAccionLat" DOUBLE PRECISION,
ADD COLUMN     "lugarAccionLng" DOUBLE PRECISION,
ADD COLUMN     "lugarAccionMunicipio" TEXT,
ADD COLUMN     "telefono" TEXT,
ADD COLUMN     "tipoColaborador" "TipoColaborador",
ADD COLUMN     "ubicacionActualizadaEn" TIMESTAMP(3),
ADD COLUMN     "ubicacionLat" DOUBLE PRECISION,
ADD COLUMN     "ubicacionLng" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "registros_bitacora" (
    "id" TEXT NOT NULL,
    "tipo" "TipoRegistroBitacora" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "direccion" TEXT,
    "municipio" TEXT,
    "departamento" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "fotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contactoLugarNombre" TEXT,
    "contactoLugarTelefono" TEXT,
    "estado" "EstadoNecesidadCampo" NOT NULL DEFAULT 'PENDIENTE',
    "autorId" TEXT NOT NULL,
    "atendidaPorId" TEXT,
    "atendidaEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registros_bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registros_bitacora_autorId_idx" ON "registros_bitacora"("autorId");

-- CreateIndex
CREATE INDEX "registros_bitacora_tipo_idx" ON "registros_bitacora"("tipo");

-- CreateIndex
CREATE INDEX "registros_bitacora_estado_idx" ON "registros_bitacora"("estado");

-- CreateIndex
CREATE INDEX "registros_bitacora_createdAt_idx" ON "registros_bitacora"("createdAt");

-- CreateIndex
CREATE INDEX "users_estadoCuenta_idx" ON "users"("estadoCuenta");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_bitacora" ADD CONSTRAINT "registros_bitacora_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_bitacora" ADD CONSTRAINT "registros_bitacora_atendidaPorId_fkey" FOREIGN KEY ("atendidaPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

