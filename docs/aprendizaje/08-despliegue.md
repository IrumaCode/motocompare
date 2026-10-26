# Fase 8: Despliegue en planes gratuitos

## Qué se construyó

- **Demo pública** en [motocompare.sneyderla.dev](https://motocompare.sneyderla.dev), sin costo:

  | Pieza         | Proveedor                          | Límite gratuito que importa                                       |
  | ------------- | ---------------------------------- | ----------------------------------------------------------------- |
  | Web estática  | Cloudflare Workers (static assets) | Las peticiones a archivos estáticos son gratis y sin límite       |
  | API GraphQL   | Render (web service Free)          | Se duerme tras 15 min sin tráfico; despierta en ~1 min; 750 h/mes |
  | PostgreSQL 18 | Neon Free                          | 1 GB por proyecto; 100 CU-horas/mes; se duerme tras 5 min         |

- **Cambios en el código**:
  - CORS configurable con `CORS_ORIGINS`: en producción la API solo acepta a la web.
  - Build de producción de la API (`tsconfig.build.json` → `api/dist`) y scripts `build`, `start` y `db:deploy`.
  - `.node-version`: una sola versión de Node para el CI, Render y Cloudflare.
  - `wrangler.jsonc`: la web como Worker que solo sirve archivos, con modo SPA.

## Cómo encaja todo

```
push a main ─┬─► GitHub Actions: lint, tipos, formato, pruebas (solo verifica)
             ├─► Render:     pnpm install → db:deploy (migraciones) → build → start
             └─► Cloudflare: pnpm install → web build (con VITE_API_URL) → wrangler deploy

navegador ─► motocompare.sneyderla.dev (archivos) ─► motocompare.onrender.com/graphql ─► Neon
```

## Decisiones clave y por qué

| Decisión                                     | Por qué                                                                                                                                                                                       |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Render para la API**                       | `server.ts` funciona tal cual. Workers tiene 10 ms de CPU por petición en el plan gratis (justo para Yoga + Prisma) y la guía de Prisma para Workers ya es de Prisma 8.                       |
| **Workers en vez de Pages para la web**      | Cloudflare marca Pages como flujo "legacy". Workers con static assets es el camino actual, igual que el portafolio, y la configuración queda versionada en `wrangler.jsonc`.                  |
| **Compilar la API a JS**                     | `tsx` es una herramienta de desarrollo. En producción se ejecuta JS ya compilado: arranca más rápido y no depende de devDependencies.                                                         |
| **`migrate deploy` en el build de Render**   | Solo aplica migraciones pendientes y nunca borra. Así una migración nueva llega a producción con el mismo push que el código que la usa.                                                      |
| **URL directa de Neon, no la del pooler**    | El pooler sirve a funciones serverless que abren miles de conexiones cortas. Render es un servidor siempre encendido con su propio pool (`pg`), y las migraciones necesitan conexión directa. |
| **CORS con lista de orígenes**               | El navegador solo deja que la web lea respuestas de la API si esta lo permite. Fuera de la lista, Yoga responde `null` y el navegador bloquea.                                                |
| **`VITE_API_URL` como variable de build**    | La web son archivos estáticos sin servidor: Vite incrusta la URL al compilar. Si cambia, hay que volver a desplegar.                                                                          |
| **Sin pings para mantener despierta la API** | Despertarían también a Neon: 0,25 CU × 744 h ≈ 186 CU-horas al mes, casi el doble de las 100 gratuitas. Se acepta la espera y la web la explica (`ColdStartNotice`).                          |

## Alternativas descartadas

- **Cloudflare Workers para la API**: sin arranque en frío, pero con riesgo de pasar los 10 ms de CPU y con más trabajo de adaptación de Prisma 7.
- **Cloudflare Pages**: funciona y es gratis, pero empezar un proyecto nuevo sobre un flujo legacy es deuda desde el primer día.
- **Base de datos de Render o Supabase**: la de Render caduca a los 30 días y Supabase se pausa tras 7 días sin uso.
- **Desplegar desde GitHub Actions**: más control (desplegar solo si el CI pasa), pero exige guardar tokens como _secrets_. Las integraciones con Git de cada proveedor bastan por ahora.

## Lo que falló por el camino (y qué enseña)

- **`corepack enable` en Render → `EROFS: read-only file system`**: el sistema del build es compartido y de solo lectura. No hacía falta, porque pnpm 10 ya cambia solo a la versión de `packageManager`.
- **Wrangler "detection logic … root of a workspace"**: Cloudflare compiló un commit sin `wrangler.jsonc`. Primero era `main` (la rama por defecto); luego, al pulsar _Retry_, repetía el mismo commit antiguo. _Retry_ repite un build; para código nuevo hace falta un push.
- **`--config wrangler.jsonc`**: al indicar el archivo, el error pasó de ser confuso a decir claramente "file not found". Hacer explícito lo implícito mejora los mensajes de error.
- **Acceso de GitHub por repo**: Cloudflare solo veía el portafolio porque su app de GitHub tenía acceso a repos seleccionados. Es mínimo privilegio, no un problema de repo privado.

## Comandos que vale la pena recordar

```bash
pnpm --filter api build                  # compila la API a api/dist
pnpm --filter api start                  # ejecuta la API compilada
pnpm --filter api db:deploy              # migraciones pendientes (producción)
pnpm dlx wrangler deploy --config wrangler.jsonc --dry-run# valida wrangler.jsonc sin publicar nada
curl -i -X OPTIONS <api>/graphql -H "origin: <web>" -H "access-control-request-method: POST"  # prueba el CORS
```

```powershell
$env:DATABASE_URL = "<url de Neon>"; pnpm --filter api db:seed; Remove-Item Env:DATABASE_URL
```

## Para estudiar más

1. **CORS a fondo**: peticiones _preflight_ (`OPTIONS`), qué protege (al usuario en el navegador, no a la API) y por qué `curl` lo ignora.
2. **Variables de build frente a variables de runtime**: por qué un frontend estático no puede leer secretos y qué nunca debe ir en una variable `VITE_`.
3. **Despliegue continuo con condiciones**: desplegar solo si el CI pasa (GitHub Actions con _secrets_, o la opción de Render de esperar a los checks) y entornos de _preview_ por pull request.
