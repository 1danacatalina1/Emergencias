import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TIPOS_INCIDENTE = [
  { nombre: "Estructura colapsada", slug: "estructura-colapsada", orden: 1 },
  { nombre: "Persona atrapada", slug: "persona-atrapada", orden: 2 },
  { nombre: "Persona desaparecida", slug: "persona-desaparecida", orden: 3 },
  { nombre: "Persona fallecida", slug: "persona-fallecida", orden: 4 },
  { nombre: "Evacuación", slug: "evacuacion", orden: 5 },
  { nombre: "Inundación", slug: "inundacion", orden: 6 },
  { nombre: "Deslizamiento", slug: "deslizamiento", orden: 7 },
  { nombre: "Incendio", slug: "incendio", orden: 8 },
  { nombre: "Accidente", slug: "accidente", orden: 9 },
  { nombre: "Emergencia médica", slug: "emergencia-medica", orden: 10 },
  { nombre: "Otro", slug: "otro", orden: 99 },
];

async function main() {
  for (const tipo of TIPOS_INCIDENTE) {
    await prisma.incidentType.upsert({
      where: { slug: tipo.slug },
      update: { nombre: tipo.nombre, orden: tipo.orden },
      create: tipo,
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@emergencias.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Emergencias2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seed completado.");
  console.log(`Tipos de incidente: ${TIPOS_INCIDENTE.length}`);
  console.log(`Usuario administrador: ${adminEmail} (cambia la contraseña tras el primer ingreso)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
