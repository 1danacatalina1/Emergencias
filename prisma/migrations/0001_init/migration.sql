-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'COORDINADOR', 'OPERADOR', 'CONSULTA');

-- CreateEnum
CREATE TYPE "NivelPrioridad" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "EstadoIncidente" AS ENUM ('REPORTADO', 'EN_ATENCION', 'EN_PROCESO', 'RESUELTO', 'CERRADO', 'DESCARTADO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CC', 'TI', 'CE', 'PASAPORTE', 'RC', 'NUIP', 'SIN_DOCUMENTO');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO', 'NO_INFORMA');

-- CreateEnum
CREATE TYPE "EstadoPersona" AS ENUM ('DESAPARECIDA', 'BUSQUEDA', 'LOCALIZADA', 'ILESA', 'HERIDA', 'ATRAPADA', 'TRASLADADA', 'FALLECIDA', 'ATENDIDA');

-- CreateEnum
CREATE TYPE "TipoTraslado" AS ENUM ('AMBULANCIA', 'VEHICULO_PARTICULAR', 'HELICOPTERO', 'A_PIE', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoTraslado" AS ENUM ('SOLICITADO', 'EN_RUTA', 'TRASLADADO', 'ATENDIDO_EN_CENTRO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoAyuda" AS ENUM ('ALIMENTOS', 'AGUA', 'REFUGIO_ALOJAMIENTO', 'MEDICAMENTOS', 'ATENCION_MEDICA', 'ROPA_ABRIGO', 'RESCATE', 'ELEMENTOS_ASEO', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoAyuda" AS ENUM ('SOLICITADA', 'EN_PROCESO', 'ENTREGADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "AccionAuditoria" AS ENUM ('CREAR', 'ACTUALIZAR', 'ELIMINAR', 'LOGIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "RolUsuario" NOT NULL DEFAULT 'OPERADOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_types" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "incident_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "incidentTypeId" TEXT NOT NULL,
    "subtipo" TEXT,
    "descripcion" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "precisionUbicacion" DOUBLE PRECISION,
    "nivelPrioridad" "NivelPrioridad" NOT NULL DEFAULT 'MEDIA',
    "estado" "EstadoIncidente" NOT NULL DEFAULT 'REPORTADO',
    "fechaEvento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaReporte" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporteroNombre" TEXT,
    "reporteroTelefono" TEXT,
    "esAnonimo" BOOLEAN NOT NULL DEFAULT false,
    "creadoPorId" TEXT,
    "actualizadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL DEFAULT 'SIN_DOCUMENTO',
    "numeroDocumento" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "edad" INTEGER,
    "sexo" "Sexo" NOT NULL DEFAULT 'NO_INFORMA',
    "telefono" TEXT,
    "estadoPersona" "EstadoPersona" NOT NULL DEFAULT 'DESAPARECIDA',
    "condicionSalud" TEXT,
    "direccionResidencia" TEXT,
    "contactoNombre" TEXT,
    "contactoTelefono" TEXT,
    "contactoParentesco" TEXT,
    "observaciones" TEXT,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "incidentId" TEXT,
    "centroMedico" TEXT NOT NULL,
    "tipoTraslado" "TipoTraslado" NOT NULL DEFAULT 'AMBULANCIA',
    "motivo" TEXT NOT NULL,
    "estadoTraslado" "EstadoTraslado" NOT NULL DEFAULT 'SOLICITADO',
    "fechaTraslado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehiculoPlaca" TEXT,
    "responsable" TEXT,
    "observaciones" TEXT,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aid_requests" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "incidentId" TEXT,
    "nombreSolicitante" TEXT NOT NULL,
    "telefonoSolicitante" TEXT NOT NULL,
    "tipoAyuda" "TipoAyuda" NOT NULL DEFAULT 'OTRO',
    "descripcion" TEXT NOT NULL,
    "cantidadPersonas" INTEGER NOT NULL DEFAULT 1,
    "direccion" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "prioridad" "NivelPrioridad" NOT NULL DEFAULT 'MEDIA',
    "estado" "EstadoAyuda" NOT NULL DEFAULT 'SOLICITADA',
    "creadoPorId" TEXT,
    "actualizadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aid_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nombreArchivo" TEXT,
    "tipoMime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "accion" "AccionAuditoria" NOT NULL,
    "usuarioId" TEXT,
    "usuarioNombre" TEXT,
    "cambios" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sequence_counters" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sequence_counters_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "incident_types_nombre_key" ON "incident_types"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "incident_types_slug_key" ON "incident_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_codigo_key" ON "incidents"("codigo");

-- CreateIndex
CREATE INDEX "incidents_estado_idx" ON "incidents"("estado");

-- CreateIndex
CREATE INDEX "incidents_nivelPrioridad_idx" ON "incidents"("nivelPrioridad");

-- CreateIndex
CREATE INDEX "incidents_municipio_idx" ON "incidents"("municipio");

-- CreateIndex
CREATE INDEX "incidents_incidentTypeId_idx" ON "incidents"("incidentTypeId");

-- CreateIndex
CREATE INDEX "persons_incidentId_idx" ON "persons"("incidentId");

-- CreateIndex
CREATE INDEX "persons_estadoPersona_idx" ON "persons"("estadoPersona");

-- CreateIndex
CREATE INDEX "persons_numeroDocumento_idx" ON "persons"("numeroDocumento");

-- CreateIndex
CREATE INDEX "transfers_personId_idx" ON "transfers"("personId");

-- CreateIndex
CREATE INDEX "transfers_incidentId_idx" ON "transfers"("incidentId");

-- CreateIndex
CREATE INDEX "transfers_estadoTraslado_idx" ON "transfers"("estadoTraslado");

-- CreateIndex
CREATE UNIQUE INDEX "aid_requests_codigo_key" ON "aid_requests"("codigo");

-- CreateIndex
CREATE INDEX "aid_requests_estado_idx" ON "aid_requests"("estado");

-- CreateIndex
CREATE INDEX "aid_requests_tipoAyuda_idx" ON "aid_requests"("tipoAyuda");

-- CreateIndex
CREATE INDEX "aid_requests_municipio_idx" ON "aid_requests"("municipio");

-- CreateIndex
CREATE INDEX "attachments_incidentId_idx" ON "attachments"("incidentId");

-- CreateIndex
CREATE INDEX "audit_logs_entidad_entidadId_idx" ON "audit_logs"("entidad", "entidadId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_incidentTypeId_fkey" FOREIGN KEY ("incidentTypeId") REFERENCES "incident_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_actualizadoPorId_fkey" FOREIGN KEY ("actualizadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aid_requests" ADD CONSTRAINT "aid_requests_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aid_requests" ADD CONSTRAINT "aid_requests_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aid_requests" ADD CONSTRAINT "aid_requests_actualizadoPorId_fkey" FOREIGN KEY ("actualizadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

