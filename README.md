# MotoCompare

Aplicación para comparar especificaciones de motocicletas: catálogo con filtros, ficha de detalle y comparador de 2 a 4 motos con gráficos.

Proyecto personal de portafolio ([sneyderla.dev](https://sneyderla.dev)) construido por fases.

> **Estado:** Fase 0, esqueleto del monorepo y herramientas. Aún no hay API ni interfaz.

## Stack

- **Monorepo:** pnpm workspaces (`api/` y `web/`)
- **Lenguaje:** TypeScript estricto
- **API:** Node.js + GraphQL Yoga + Prisma + PostgreSQL
- **Web:** React + Vite + Tailwind CSS + Chart.js
- **Calidad:** ESLint, Prettier, Vitest
- **Infra local:** Docker Compose (PostgreSQL 18)

## Requisitos

- Node.js 24 o superior
- pnpm 10 (`corepack enable` usa la versión fijada en `package.json`)
- Docker Desktop

## Puesta en marcha

```bash
cp .env.example .env     # variables de entorno locales
pnpm install             # instala dependencias de todos los paquetes
docker compose up -d     # levanta PostgreSQL en segundo plano
```

## Scripts

| Comando             | Qué hace                                   |
| ------------------- | ------------------------------------------ |
| `pnpm lint`         | Revisa el código con ESLint                |
| `pnpm typecheck`    | Comprueba los tipos en cada paquete        |
| `pnpm format`       | Formatea el código con Prettier            |
| `pnpm format:check` | Verifica el formato sin modificar archivos |

## Estructura

```
motocompare/
├── api/                  # API GraphQL
├── web/                  # App React
├── docs/aprendizaje/     # notas de aprendizaje por fase
└── docker-compose.yml    # PostgreSQL local
```
