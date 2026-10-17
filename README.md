# MotoCompare

Aplicación para comparar especificaciones de motocicletas: catálogo con filtros, ficha de detalle y comparador de 2 a 4 motos con gráficos.

Proyecto personal de portafolio ([sneyderla.dev](https://sneyderla.dev)) construido por fases.

> **Estado:** Fase 1, base de datos modelada con Prisma y poblada con 30 motos de 5 marcas. Aún no hay API ni interfaz.

## Stack

- **Monorepo:** pnpm workspaces (`api/` y `web/`)
- **Lenguaje:** TypeScript estricto
- **API:** Node.js + GraphQL Yoga + Prisma 7 + PostgreSQL
- **Web:** React + Vite + Tailwind CSS + Chart.js
- **Calidad:** ESLint, Prettier, Vitest
- **Infra local:** Docker Compose (PostgreSQL 18)

## Requisitos

- Node.js 24 o superior
- pnpm 10 (`corepack enable` usa la versión fijada en `package.json`)
- Docker Desktop

## Puesta en marcha

```bash
cp .env.example .env            # variables de entorno locales
pnpm install                    # instala dependencias y genera el cliente de Prisma
docker compose up -d            # levanta PostgreSQL en segundo plano
pnpm --filter api db:migrate    # aplica las migraciones
pnpm --filter api db:seed       # carga las motos de ejemplo
```

## Scripts

| Comando                        | Qué hace                                       |
| ------------------------------ | ---------------------------------------------- |
| `pnpm lint`                    | Revisa el código con ESLint                    |
| `pnpm typecheck`               | Comprueba los tipos en cada paquete            |
| `pnpm format`                  | Formatea el código con Prettier                |
| `pnpm format:check`            | Verifica el formato sin modificar archivos     |
| `pnpm --filter api db:migrate` | Crea y aplica migraciones a partir del schema  |
| `pnpm --filter api db:seed`    | Carga o actualiza los datos de ejemplo         |
| `pnpm --filter api db:studio`  | Abre Prisma Studio para explorar la base       |
| `pnpm --filter api db:reset`   | Borra la base y reaplica todas las migraciones |

## Datos

Las especificaciones de las motos (modelo 2024) se curaron a mano a partir de las fichas oficiales de cada fabricante, sin scraping. Los datos se verificaron en octubre de 2026. La potencia se expresa en hp y el peso en orden de marcha. Los precios son el MSRP base en EE. UU., sin gastos de envío; si no se pudo confirmar un precio oficial, el campo queda vacío.

## Estructura

```
motocompare/
├── api/
│   ├── prisma/           # schema, migraciones y seed
│   └── src/db/           # cliente de Prisma
├── web/                  # App React
├── docs/aprendizaje/     # notas de aprendizaje por fase
└── docker-compose.yml    # PostgreSQL local
```
