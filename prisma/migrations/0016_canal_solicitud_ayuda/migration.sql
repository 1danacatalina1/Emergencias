-- CreateEnum
CREATE TYPE "CanalSolicitud" AS ENUM ('PLATAFORMA', 'WHATSAPP', 'LLAMADA', 'PRESENCIAL', 'OTRO');

-- AlterTable
ALTER TABLE "aid_requests" ADD COLUMN "canal" "CanalSolicitud" NOT NULL DEFAULT 'PLATAFORMA';
