# Sistema de Gestión de Emergencias

Plataforma web de extremo a extremo para reportar y gestionar emergencias, personas afectadas, traslados y ayuda humanitaria. Mobile-first, pensada para reportarse desde el teléfono durante una emergencia.

## Funcionalidades

- **Reportar emergencia** — estructuras colapsadas, personas atrapadas/desaparecidas/fallecidas, con ubicación en mapa, fotos y registro de personas afectadas.
- **Solicitar ayuda** — alimentos, agua, refugio, medicamentos, atención médica, etc.
- **Reportar traslado** — traslado de una persona a un centro médico (crea automáticamente un incidente si no existe uno).
- **Mapa de incidentes** — visualización pública georreferenciada con OpenStreetMap/Leaflet.
- **Panel de gestión** (autenticado) — administración de incidentes, personas, traslados y ayudas; cambio de estados; bitácora de auditoría; exportación a Excel.
- **Auditoría** — registro de quién creó/actualizó cada entidad y cuándo.
- **Datos sensibles protegidos** — los datos de contacto del reportero y del panel solo son visibles para usuarios autenticados; el mapa público solo expone campos no sensibles.

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, React 19) |
| Estilos | Tailwind CSS v4 |
| Base de datos | PostgreSQL |
| ORM | Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Validación | Zod |
| Autenticación | Auth.js / NextAuth v5 (credenciales + JWT) |
| Mapas | Leaflet + React-Leaflet + OpenStreetMap |
| Almacenamiento de archivos | Vercel Blob |
| Exportación a Excel | ExcelJS (generado en servidor) |

## Estructura de datos

Entidades principales (`prisma/schema.prisma`): `Incident` (código automático `EMG-2026-000001`), `Person`, `Transfer`, `AidRequest` (código `AYU-2026-000001`), `IncidentType` (catálogo configurable), `Attachment`, `User`, `AuditLog`.

## Desarrollo local

```bash
npm install

# Copia el archivo de variables de entorno y complétalo
cp .env.example .env.local

# Aplica el esquema a tu base de datos PostgreSQL
npx prisma migrate deploy

# Crea el catálogo de tipos de incidente y el usuario administrador inicial
npx prisma db seed

npm run dev
```

La app queda disponible en `http://localhost:3000`. El panel de gestión está en `/panel/login`.

> Si no tienes PostgreSQL instalado, puedes levantar una base de datos local temporal con `npx prisma dev` y usar el `DATABASE_URL` que imprime en consola.

## Despliegue en Vercel

1. **Importa el repositorio** en Vercel (framework detectado automáticamente: Next.js).
2. **Base de datos**: crea una base de datos Postgres (Vercel Postgres, Neon o Supabase) y copia su cadena de conexión a la variable de entorno `DATABASE_URL` del proyecto en Vercel.
3. **Almacenamiento**: en el dashboard de Vercel, agrega un Blob Store (Storage → Blob) y copia el token generado a `BLOB_READ_WRITE_TOKEN`.
4. **Autenticación**: genera un secreto con `openssl rand -base64 32` y agrégalo como `AUTH_SECRET`. Define `NEXTAUTH_URL` con la URL pública de tu despliegue.
5. **Variables del usuario administrador inicial**: define `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` (cambia la contraseña después del primer ingreso).
6. **Migraciones y seed**: tras el primer despliegue, ejecuta una sola vez desde tu máquina (apuntando a la base de datos de producción) o mediante el CLI de Vercel:
   ```bash
   DATABASE_URL="<url-de-produccion>" npx prisma migrate deploy
   DATABASE_URL="<url-de-produccion>" npx prisma db seed
   ```
7. Vercel ejecuta automáticamente `prisma generate` (`postinstall`) y `next build`.

## Integración futura con Microsoft Excel / OneDrive

El código de exportación (`src/app/api/export/xlsx/route.ts`) genera archivos `.xlsx` estándar que pueden abrirse directamente en Excel o subirse a OneDrive. Para sincronización automática con OneDrive vía Microsoft Graph, agrega una app registrada en Azure AD y las variables `MICROSOFT_GRAPH_CLIENT_ID`, `MICROSOFT_GRAPH_CLIENT_SECRET` y `MICROSOFT_GRAPH_TENANT_ID` (ver `.env.example`); la ruta de exportación es el punto de partida para subir el archivo generado a una carpeta de OneDrive mediante la API `PUT /me/drive/root:/ruta/archivo.xlsx:/content`.

## Seguridad

- Contraseñas con hash `bcrypt`.
- Rutas `/panel/*` protegidas por `proxy.ts` (Proxy/Middleware) + verificación de sesión en cada Route Handler.
- Roles: `ADMIN`, `COORDINADOR`, `OPERADOR`, `CONSULTA`.
- Toda creación/actualización/eliminación queda registrada en `AuditLog` con usuario, IP y cambios.
