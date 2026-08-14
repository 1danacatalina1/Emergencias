-- CreateTable
CREATE TABLE "seguimientos_equipo" (
    "id" TEXT NOT NULL,
    "coordinadorId" TEXT NOT NULL,
    "voluntarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seguimientos_equipo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "seguimientos_equipo_coordinadorId_idx" ON "seguimientos_equipo"("coordinadorId");

-- CreateIndex
CREATE UNIQUE INDEX "seguimientos_equipo_coordinadorId_voluntarioId_key" ON "seguimientos_equipo"("coordinadorId", "voluntarioId");

-- AddForeignKey
ALTER TABLE "seguimientos_equipo" ADD CONSTRAINT "seguimientos_equipo_coordinadorId_fkey" FOREIGN KEY ("coordinadorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos_equipo" ADD CONSTRAINT "seguimientos_equipo_voluntarioId_fkey" FOREIGN KEY ("voluntarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

