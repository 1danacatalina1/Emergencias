-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "personId" TEXT;

-- AlterTable
ALTER TABLE "persons" ADD COLUMN     "descripcionFisica" TEXT;

-- CreateIndex
CREATE INDEX "attachments_personId_idx" ON "attachments"("personId");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

