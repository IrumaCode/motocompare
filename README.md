# MotoCompare

Aplicación para comparar especificaciones de motocicletas: catálogo con filtros, ficha de detalle y comparador de 2 a 4 motos con gráficos.

Proyecto personal de portafolio ([sneyderla.dev](https://sneyderla.dev)) construido por fases.

> **Estado:** Fase 6, pruebas automáticas con Vitest y Testing Library: servicios y queries GraphQL de la API, consultas de Prisma contra una base de datos de prueba, y los flujos principales de la web (catálogo, ficha, bandeja y comparador). La fase anterior añadió el comparador de 2 a 4 motos con gráficos.

## Stack

- **Monorepo:** pnpm workspaces (`api/` y `web/`)
- **Lenguaje:** TypeScript estricto
- **API:** Node.js + GraphQL Yoga + Prisma 7 + PostgreSQL
- **Web:** React + Vite + Tailwind CSS + Apollo Client + React Router, Chart.js (gráficos) y dnd-kit (arrastrar y soltar)
- **Calidad:** ESLint, Prettier, Vitest + Testing Library (jsdom)
- **Infra local:** Docker Compose (PostgreSQL 18)

## Requisitos

- Node.js 24 o superior
- pnpm 10 (`corepack enable` usa la versión fijada en `package.json`)
- Docker Desktop

## Puesta en marcha

```bash
cp .env.example .env            # variables de entorno locales
pnpm install                    # instala dependencias y genera el cliente de Prisma y los tipos GraphQL
docker compose up -d            # levanta PostgreSQL en segundo plano
pnpm --filter api db:migrate    # aplica las migraciones
pnpm --filter api db:seed       # carga las motos de ejemplo
pnpm --filter api dev           # API y playground en http://localhost:4000/graphql
pnpm --filter web dev           # web en http://localhost:5173 (en otra terminal)
```

## API

GraphQL con estas queries:

- `motorcycles`: catálogo con filtros por marca, categoría, cilindrada y precio; orden y paginación.
- `motorcycle(slug)`: detalle de una moto.
- `compare(slugs)`: de 2 a 4 motos.
- `brands` y `categories`.
- `exchangeRate`: tasa USD → COP.

El campo `priceCop` convierte el precio con la TRM oficial del día, publicada por [datos.gov.co](https://www.datos.gov.co). Se guarda en caché 6 horas; si la fuente no responde, el campo queda vacío.

## Scripts

| Comando                        | Qué hace                                        |
| ------------------------------ | ----------------------------------------------- |
| `pnpm lint`                    | Revisa el código con ESLint                     |
| `pnpm typecheck`               | Comprueba los tipos en cada paquete             |
| `pnpm format`                  | Formatea el código con Prettier                 |
| `pnpm format:check`            | Verifica el formato sin modificar archivos      |
| `pnpm test`                    | Corre las pruebas de la API y de la web         |
| `pnpm test:db`                 | Prueba las consultas contra PostgreSQL (Docker) |
| `pnpm --filter api dev`        | Levanta la API y se reinicia al guardar         |
| `pnpm --filter api codegen`    | Regenera los tipos de GraphQL de la API         |
| `pnpm --filter web dev`        | Levanta la web con recarga en caliente          |
| `pnpm --filter web codegen`    | Regenera los tipos de las queries de la web     |
| `pnpm --filter web build`      | Genera el build de producción en `web/dist`     |
| `pnpm --filter api db:migrate` | Crea y aplica migraciones a partir del schema   |
| `pnpm --filter api db:seed`    | Carga o actualiza los datos de ejemplo          |
| `pnpm --filter api db:studio`  | Abre Prisma Studio para explorar la base        |
| `pnpm --filter api db:reset`   | Borra la base y reaplica todas las migraciones  |

## Pruebas

- `pnpm test` no necesita base de datos ni red. La API se prueba con repositorios en memoria y queries GraphQL de punta a punta; la web, con Testing Library sobre un DOM simulado (jsdom) y Apollo simulado.
- `pnpm test:db` prueba las consultas de Prisma contra la base `motocompare_test` (variable `TEST_DATABASE_URL`, ver `.env.example`). Necesita `docker compose up -d`, aplica las migraciones y vacía sus tablas en cada ejecución: por seguridad, se niega a correr si el nombre de la base no termina en `_test`.

## Datos

Las especificaciones de las motos (modelo 2024) se curaron a mano a partir de las fichas oficiales de cada fabricante, sin scraping. Los datos se verificaron en octubre de 2026. La potencia se expresa en hp y el peso en orden de marcha. Los precios son el MSRP base en EE. UU., sin gastos de envío; si no se pudo confirmar un precio oficial, el campo queda vacío.

Las fotos (`web/public/motos/`) vienen de Wikimedia Commons y tienen licencias libres (CC BY, CC BY-SA o CC0). Se recortaron a 16:10 y se convirtieron a WebP. La ficha de cada moto muestra el autor, la licencia y el enlace al archivo original. Algunas fotos son de otro año o color de la misma generación, y las motos sin foto libre muestran una silueta.

## Estructura

```
motocompare/
├── api/
│   ├── prisma/           # schema, migraciones y seed
│   └── src/
│       ├── graphql/        # esquema, resolvers y DataLoaders
│       ├── services/       # reglas de negocio
│       ├── repositories/   # acceso a datos con Prisma
│       ├── exchange-rate/  # tasa USD → COP con caché
│       └── db/             # cliente de Prisma
├── web/src/
│   ├── app/              # rutas, layout y tema
│   ├── features/         # páginas y piezas por funcionalidad
│   ├── components/ui/    # componentes genéricos
│   └── lib/              # cliente Apollo y utilidades
├── docs/aprendizaje/     # notas de aprendizaje por fase
└── docker-compose.yml    # PostgreSQL local
```
