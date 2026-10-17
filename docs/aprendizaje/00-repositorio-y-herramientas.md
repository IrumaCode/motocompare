# Fase 0: Repositorio y herramientas

## Qué se construyó

El esqueleto del proyecto. Todavía no hace nada visible, pero define cómo se trabaja de aquí en adelante:

- **Repositorio git** con rama por fase (`phase-0-repo-setup`). `main` todavía no tiene commits: nace cuando se fusione esta rama.
- **Monorepo con pnpm workspaces**: un solo repositorio con dos paquetes, `api/` y `web/`, que comparten herramientas y un único `pnpm-lock.yaml`.
- **TypeScript estricto compartido**: `tsconfig.base.json` en la raíz y un `tsconfig.json` por paquete que lo extiende.
- **ESLint + Prettier**: una sola configuración en la raíz para todo el monorepo.
- **PostgreSQL 18 en Docker** con `docker-compose.yml`, volumen persistente y _healthcheck_.
- **Skill `ui-ux-pro-max`** para las fases de frontend. Se instaló en `.claude/skills/`, que es solo local y no se sube.

## Decisiones clave y por qué

| Decisión                                               | Por qué                                                                                                                                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.gitattributes` con `eol=lf`                          | En Windows git convierte a CRLF por defecto. Forzar LF evita diffs fantasma y choques con Prettier.                                                                                  |
| `packageManager` y `engines` en `package.json`         | Dejan escrita la versión exacta de pnpm y la mínima de Node. Corepack avisa si alguien usa otra.                                                                                     |
| `tsconfig.base.json` + extensión por paquete           | Las reglas de rigor (`strict`, `noUncheckedIndexedAccess`…) se definen una vez. Cada paquete solo cambia lo que le es propio: la API usa `NodeNext` y la web usa `Bundler` y el DOM. |
| `noUncheckedIndexedAccess`                             | `lista[0]` pasa a ser `T \| undefined`. Obliga a manejar el caso "no existe", que es una fuente común de errores.                                                                    |
| `verbatimModuleSyntax`                                 | Obliga a escribir `import type` para los tipos. Así queda claro qué se borra al compilar y funciona igual con `tsc`, Vite o esbuild.                                                 |
| ESLint `strictTypeChecked`                             | ESLint usa la información de tipos de TypeScript. Detecta `any`, promesas sin `await` y accesos inseguros, no solo estilo.                                                           |
| `eslint-config-prettier` al final                      | Apaga las reglas de ESLint que opinan de formato. Formato = Prettier, calidad = ESLint, sin peleas.                                                                                  |
| **TypeScript 6.0 en vez de 7.0**                       | TypeScript 7 (el compilador nuevo en Go) ya salió, pero `typescript-eslint` solo soporta hasta la 6.0.x. Sin esa compatibilidad, el lint con tipos no funcionaría.                   |
| `postgres:18-alpine`                                   | Neon (producción) usa Postgres 18 por defecto desde junio de 2026. Usar la misma versión en local evita sorpresas. La variante _alpine_ pesa menos.                                  |
| Volumen montado en `/var/lib/postgresql`               | Desde Postgres 18 la imagen oficial guarda los datos en `/var/lib/postgresql/18/...`. La ruta antigua (`.../data`) ya no es la correcta.                                             |
| Variables obligatorias en compose (`${VAR:?mensaje}`)  | Si falta `.env`, Docker falla con un mensaje claro en vez de arrancar con valores vacíos.                                                                                            |
| Archivos de prueba en `api/` y `web/`                  | Le dan a `tsc` y ESLint algo real que revisar. Se reemplazan en las fases 2 y 3.                                                                                                     |
| pnpm 10.34.7 y no 12                                   | Es el último parche de la línea 10: solo trae correcciones, sin cambios de comportamiento. La 12 era un salto de dos versiones mayores y su última versión tenía un día de vida.     |
| `CLAUDE.md`, `.claude/` y `skills-lock.json` ignorados | Son configuración personal del asistente, no del proyecto. Se quedan solo en local (el roadmap vive en `.claude/ROADMAP.md`).                                                        |

### Lección: reescribir historia ya publicada

Esos archivos se subieron por error a GitHub. Un `git rm --cached` en un commit nuevo los deja de rastrear, pero **siguen visibles en el historial**. Para borrarlos de verdad hubo que reescribir los commits (`git filter-branch --index-filter ... --prune-empty`) y reemplazar la rama remota con `git push --force-with-lease`.

Esto solo es aceptable porque la rama era nueva y nadie más la usaba. En una rama compartida, reescribir la historia rompe el trabajo de los demás. `--force-with-lease` es la versión segura de `--force`: falla si alguien subió algo nuevo desde tu último `fetch`. Si alguna vez se sube un **secreto** (contraseña, token), además de reescribir hay que **rotarlo**, porque puede haber copias en cachés o clones.

## Alternativas descartadas

- **npm / yarn workspaces**: descartados por la regla del proyecto, que usa pnpm. pnpm además es más rápido y estricto: un paquete no puede usar dependencias que no declaró.
- **Turborepo / Nx**: orquestadores de monorepos con caché de tareas. Para dos paquetes es complejidad sin beneficio.
- **Paquete `packages/tsconfig` compartido**: útil con muchos paquetes; con dos basta un archivo base.
- **Biome** en lugar de ESLint + Prettier: más rápido y en una sola herramienta, pero con menos reglas que aprovechen los tipos.
- **PostgreSQL instalado en Windows**: funciona, pero ensucia el sistema y no es reproducible. Con Docker, `docker compose down -v` deja todo limpio.
- **`@types/node` desde ya**: no hace falta hasta la Fase 2, y la API debe mantenerse portable.

## Comandos que vale la pena recordar

```bash
pnpm add -D -w <paquete>          # dependencia de desarrollo en la raíz (-w = workspace root)
pnpm --filter api add <paquete>   # dependencia solo en el paquete api
pnpm -r <script>                  # ejecuta un script en todos los paquetes
pnpm view <paquete> version       # última versión publicada
pnpm view <paquete> peerDependencies  # con qué versiones es compatible

docker compose up -d              # levantar servicios en segundo plano
docker compose ps                 # estado (busca "healthy")
docker compose logs -f postgres   # ver logs en vivo
docker compose exec -T postgres psql -U motocompare -d motocompare   # consola SQL
docker compose down               # parar (los datos se conservan)
docker compose down -v            # parar y BORRAR los datos (-v = volúmenes)

git check-ignore -v .env          # comprobar qué regla ignora un archivo
```

## Para estudiar más

1. **Peer dependencies**: por qué `typescript-eslint` declara qué versiones de TypeScript soporta y cómo leer esos rangos (`>=4.8.4 <6.1.0`).
2. **`module` / `moduleResolution` en TypeScript**: diferencias entre `NodeNext` (exige extensiones `.js` en imports relativos) y `Bundler` (lo que asume Vite).
3. **Volúmenes de Docker**: diferencia entre volúmenes con nombre y _bind mounts_, y por qué los datos sobreviven a `docker compose down`.
