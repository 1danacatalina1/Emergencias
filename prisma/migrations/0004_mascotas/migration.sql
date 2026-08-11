-- CreateEnum
CREATE TYPE "TipoReporteMascota" AS ENUM ('PERDIDA', 'ENCONTRADA');

-- CreateEnum
CREATE TYPE "EspecieMascota" AS ENUM ('PERRO', 'GATO', 'AVE', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoMascota" AS ENUM ('ACTIVO', 'REUNIDO', 'CERRADO');

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoReporteMascota" NOT NULL,
    "especie" "EspecieMascota" NOT NULL DEFAULT 'OTRO',
    "nombre" TEXT,
    "raza" TEXT,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "direccion" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "contactoNombre" TEXT NOT NULL,
    "contactoTelefono" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "estado" "EstadoMascota" NOT NULL DEFAULT 'ACTIVO',
    "creadoPorId" TEXT,
    "actualizadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pets_codigo_key" ON "pets"("codigo");

-- CreateIndex
CREATE INDEX "pets_tipo_idx" ON "pets"("tipo");

-- CreateIndex
CREATE INDEX "pets_estado_idx" ON "pets"("estado");

-- CreateIndex
CREATE INDEX "pets_municipio_idx" ON "pets"("municipio");

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_actualizadoPorId_fkey" FOREIGN KEY ("actualizadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

