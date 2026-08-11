-- CreateEnum
CREATE TYPE "EstadoPuntoAcopio" AS ENUM ('ACTIVO', 'PAUSADO', 'CERRADO');

-- CreateEnum
CREATE TYPE "EstadoDonacion" AS ENUM ('OFRECIDA', 'CONFIRMADA', 'RECIBIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "donation_points" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tiposAceptados" "TipoAyuda"[],
    "direccion" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "responsable" TEXT,
    "telefonoContacto" TEXT NOT NULL,
    "horario" TEXT,
    "estado" "EstadoPuntoAcopio" NOT NULL DEFAULT 'ACTIVO',
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donation_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "donationPointId" TEXT,
    "nombreDonante" TEXT NOT NULL,
    "telefonoDonante" TEXT NOT NULL,
    "tipoAyuda" "TipoAyuda" NOT NULL DEFAULT 'OTRO',
    "descripcion" TEXT NOT NULL,
    "direccion" TEXT,
    "municipio" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "estado" "EstadoDonacion" NOT NULL DEFAULT 'OFRECIDA',
    "creadoPorId" TEXT,
    "actualizadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donation_points_codigo_key" ON "donation_points"("codigo");

-- CreateIndex
CREATE INDEX "donation_points_estado_idx" ON "donation_points"("estado");

-- CreateIndex
CREATE INDEX "donation_points_municipio_idx" ON "donation_points"("municipio");

-- CreateIndex
CREATE UNIQUE INDEX "donations_codigo_key" ON "donations"("codigo");

-- CreateIndex
CREATE INDEX "donations_estado_idx" ON "donations"("estado");

-- CreateIndex
CREATE INDEX "donations_tipoAyuda_idx" ON "donations"("tipoAyuda");

-- CreateIndex
CREATE INDEX "donations_municipio_idx" ON "donations"("municipio");

-- AddForeignKey
ALTER TABLE "donation_points" ADD CONSTRAINT "donation_points_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donationPointId_fkey" FOREIGN KEY ("donationPointId") REFERENCES "donation_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_actualizadoPorId_fkey" FOREIGN KEY ("actualizadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

