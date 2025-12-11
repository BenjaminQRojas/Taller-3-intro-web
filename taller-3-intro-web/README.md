# Taller 3 — Intro Web (Next.js + Prisma + Redux + Charts)

Aplicación Next.js (App Router) con Prisma 7 y PostgreSQL que muestra un dashboard interactivo de ventas con filtros globales (Redux Toolkit), 5+ tipos de gráficos (Chart.js), tabla paginada y página de detalle. Persistimos filtros aplicados entre navegaciones y recargas usando `sessionStorage`.

## Requisitos

- Node.js 18+ (recomendado LTS)
- PostgreSQL accesible con una `DATABASE_URL`

## Guía rápida (TL;DR)

Para dejar todo funcionando desde cero:

```bash
# 1) Copiar variables de entorno
cp .env.example .env
# 2) Editar .env y fijar DATABASE_URL
# 3) Instalar dependencias
npm install
# 4) Generar cliente Prisma
npx prisma generate
# 5) Crear/aplicar migraciones (dev)
npx prisma migrate dev --name init
# 6) Poblar datos de ejemplo
npm run seed
# 7) Levantar el servidor
npm run dev
```

Endpoints principales:
- `GET /api/sales` lista y pagina ventas: filtros `category`, `searchTerm`, `startDate`, `endDate`, `page`, `limit`.
- `GET /api/sales/[id]` detalle de una venta.
- `GET /api/metrics/overview` KPIs: revenue, units, AOV, avg price, count.
- `GET /api/metrics/timeseries` series por día.
- `GET /api/metrics/by-category` agregados por categoría.
- `GET /api/metrics/by-region` agregados por región.
- `GET /api/metrics/top-products` top N productos por revenue (respeta filtro de categoría).
- `GET /api/metrics/age-buckets` distribución por rangos de edad.
- `GET /api/categories` categorías distintas.

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

4. Ejecuta migraciones (si es la primera vez o hiciste cambios en el esquema):

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

Ruta principal: `/dashboard`
- Filtros: rango, categoría, fecha específica, búsqueda; botón “Aplicar Filtros” y “Limpiar”.
- Persistencia: al aplicar, se guardan filtros en Redux y `sessionStorage`.
- Gráficos (Chart.js): Line, Bar, Doughnut, Polar Area, Histograma (bins calculados). Todos se actualizan con filtros.
- Tabla de ventas: paginada, IDs clicables a `/detalle/[id]`, búsqueda rápida por ID en el header.

Detalle: `/detalle/[id]`
- Tarjetas de KPIs básicos, gráficas Doughnut y Line, metadatos.
- Botón “Volver al Dashboard”.

## Scripts útiles

- `npm run dev`: Arranca el servidor de desarrollo
- `npm run build`: Compila la app
- `npm run start`: Sirve la app compilada
- `npm run lint`: Linter
- `npm run seed`: (propuesto) Ejecuta el seed `npx tsx prisma/seed.ts`

## Estado global y persistencia

- Redux Toolkit: `store/slices/filtersSlice.ts` maneja filtros actuales y “aplicados”.
- `applyFilters` copia los filtros actuales al snapshot aplicado.
- `sessionStorage`: guardamos los campos aplicados para rehidratarlos al recargar.
- El dashboard usa los filtros aplicados para fetch y cálculo de fechas (local `YYYY-MM-DD` para evitar desfases por zona horaria).

## Estilo y componentes

- Tailwind CSS para diseño responsive (mobile-first).
- Componentes UI (`components/ui`): Card, Button, Select, Popover, Calendar, Input.
- Gráficos en `components/charts/*` con configuración responsive.
- Filtros en `components/filters/*`

## Requisitos del taller (checklist)

- Next.js 14+ con API interna, DB SQL y Prisma ORM: ✅
- Redux Toolkit para estado global y flujo entre filtros/resultados: ✅
- Charts con 5+ tipos y actualización dinámica por filtros: ✅
- Mobile-first y uso de una librería de componentes: ✅
- Entidad principal (Sale), API de lectura con validación y errores, datos desde DB: ✅

## Notas de implementación

- Evitamos desajustes de hidratación añadiendo `suppressHydrationWarning` en el layout.
- Fechas: se manejan como `YYYY-MM-DD` local (sin `Date.toISOString()`), para DD/MM/YYYY en UI sin desfase.

## Troubleshooting

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

- Advertencia de hidratación (React):
	- Si ves `A tree hydrated but some attributes...`, suele ser por extensiones del navegador que alteran el DOM. Se mitiga con `suppressHydrationWarning`.
