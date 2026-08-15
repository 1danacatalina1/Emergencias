-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoColaborador" ADD VALUE 'PROFESIONAL_SALUD';
ALTER TYPE "TipoColaborador" ADD VALUE 'PROFESIONAL_VETERINARIA';
ALTER TYPE "TipoColaborador" ADD VALUE 'PROFESIONAL_INGENIERIA_ARQUITECTURA';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "comoPuedeAyudar" TEXT,
ADD COLUMN     "disponibilidadDesplazamiento" BOOLEAN,
ADD COLUMN     "disponibilidadTiempo" TEXT,
ADD COLUMN     "experticia" TEXT,
ADD COLUMN     "zonasDesplazamiento" TEXT;

