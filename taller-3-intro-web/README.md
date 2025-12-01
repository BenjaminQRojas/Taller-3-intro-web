# Taller 3 — Intro Web (Next.js + Prisma)

Proyecto Next.js con Prisma 7 y PostgreSQL. Incluye generación de datos de prueba (seed) y un cliente de Prisma generado en una ruta personalizada.

## Requisitos

- Node.js 18+ (recomendado LTS)
- PostgreSQL accesible con una `DATABASE_URL`

## Configuración inicial

1. Copia `.env.example` a `.env` y completa `DATABASE_URL`:

```env
DATABASE_URL=postgres://usuario:password@localhost:5432/nombre_basedatos
NODE_ENV=development
```

2. Instala dependencias:

```bash
npm install
```

3. Genera el cliente de Prisma (se genera en `app/generated/prisma`):

```bash
npx prisma generate
```

4. (Opcional) Ejecuta migraciones si aún no existen o si hiciste cambios en el esquema:

```bash
# Crear una nueva migración (desarrollo)
npx prisma migrate dev --name <nombre_migracion>

# Aplicar migraciones en producción
npx prisma migrate deploy
```

## Semillas de datos (seed)

Este proyecto incluye un script para poblar la base con ventas falsas.

Ejecútalo con tsx:

```bash
npx tsx prisma/seed.ts
```

El cliente de Prisma se genera en una ruta personalizada definida en `prisma/schema.prisma`:

```prisma
generator client {
	provider = "prisma-client"
	output   = "../app/generated/prisma"
}
```

Por eso, en `prisma/seed.ts` importamos desde:

```ts
import { PrismaClient } from '../app/generated/prisma/client';
```

Además, Prisma 7 requiere un adaptador o Accelerate. Usamos el adaptador oficial de `pg`:

```ts
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
```

## Modificar el esquema de Prisma

1. Edita `prisma/schema.prisma` y ajusta tus modelos (por ejemplo, `Sale`).
2. Genera el cliente nuevamente:

```bash
npx prisma generate
```

3. Crea/aplica migraciones según el entorno:

```bash
# Desarrollo (crea archivos en prisma/migrations)
npx prisma migrate dev --name <nombre_migracion>

# Producción (aplica migraciones ya creadas)
npx prisma migrate deploy
```

Notas importantes (Prisma 7):

- La URL de la base ya no se define en `schema.prisma`. Se toma desde `prisma.config.ts` y variables de entorno (`.env`).
- Si cambias `DATABASE_URL`, asegúrate de regenerar el cliente y, si corresponde, volver a correr migraciones.

## Desarrollo

Arranca el servidor de desarrollo:

```bash
npm run dev
```

Accede a `http://localhost:3000`.

## Scripts útiles

- `npm run dev`: Arranca el servidor de desarrollo
- `npm run build`: Compila la app
- `npm run start`: Sirve la app compilada
- `npm run lint`: Linter
- `npm run seed`: (propuesto) Ejecuta el seed `npx tsx prisma/seed.ts`

## Estructura relevante

- `prisma/schema.prisma`: Modelos de datos (Prisma)
- `prisma/seed.ts`: Script de semillas (ventas falsas)
- `prisma.config.ts`: Configuración de Prisma 7 (lee `DATABASE_URL`)
- `app/generated/prisma`: Cliente de Prisma generado

## Troubleshooting

- Error: "Module '@prisma/client' has no exported member 'PrismaClient'"
	- Este proyecto usa una ruta de salida personalizada para el cliente (`app/generated/prisma`). Importa desde `../app/generated/prisma/client`.
- Error de validación por `url` en `schema.prisma`
	- En Prisma 7, la propiedad `url` se define en `prisma.config.ts` y `.env`, no dentro del `schema.prisma`.
