# Fase 6: Pruebas

## Qué se construyó

- **104 pruebas automáticas** en tres grupos:

  | Grupo                   | Comando        | Pruebas | Necesita         |
  | ----------------------- | -------------- | ------- | ---------------- |
  | API unitarias y GraphQL | `pnpm test`    | 37      | nada             |
  | Web (jsdom)             | `pnpm test`    | 58      | nada             |
  | API contra PostgreSQL   | `pnpm test:db` | 9       | Docker encendido |

- **API**:
  - servicios: validaciones, percentil, orden de `compare`, conversión a pesos;
  - caché de la TRM con un reloj controlado por la prueba;
  - proveedor de la TRM con un `fetch` falso;
  - queries GraphQL de punta a punta con `yoga.fetch`: errores visibles frente a errores ocultos, DataLoader en un solo lote, `priceCop` sin tasa.
- **Consultas de Prisma** contra la base `motocompare_test`: filtros, precios null al final, desempate por `id` y paginación sin huecos.
- **Web**:
  - funciones puras: parámetros del catálogo, bandeja, URL de comparación, métricas, teclado y anuncios del arrastre, `useSlowLoading`;
  - componentes: botón "Comparar" con la bandeja (incluidos `localStorage` y la sincronización entre pestañas), catálogo, ficha de detalle y página de comparación en todos sus estados.

## Cómo encaja todo

```
pnpm test ──┬─ api: vitest --project unit
            │     servicios ──► repositorios en memoria (src/test/fakes.ts)
            │     app.test.ts ─► createApp(fakes) ─► yoga.fetch('http://test/graphql')
            └─ web: vitest (jsdom, setup.ts)
                  renderWithProviders(<Página />, { route, mocks })
                    └─ MockedProvider (Apollo) + MemoryRouter + tema + bandeja + dnd

pnpm test:db ─ api: vitest --project integration
                  global setup: prisma migrate deploy  (base *_test)
                  cada archivo: TRUNCATE + datos propios ─► repositorio real de Prisma
```

## Decisiones clave y por qué

| Decisión                                                   | Por qué                                                                                                                                                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`createApp` recibe sus dependencias**                    | Es inversión de dependencias (la "D" de SOLID). La app depende de interfaces (repositorios, proveedor de la TRM), así que las pruebas le pasan versiones en memoria sin tocar la red ni la base. |
| **Fakes en vez de mocks automáticos** (`vi.mock`)          | Un fake implementa la misma interfaz que el repositorio real, así que TypeScript avisa si se desincronizan. Los mocks de módulos acoplan la prueba a cómo se importa el código.                  |
| **Pruebas de caja negra con `yoga.fetch`**                 | Prueban el contrato que ve el cliente (schema, resolvers, errores) sin levantar un servidor HTTP.                                                                                                |
| **Consultas por rol y nombre accesible** (Testing Library) | `getByRole('button', { name: 'Comparar …' })` busca la página igual que un usuario o un lector de pantalla, no por clases CSS. Si la accesibilidad se rompe, la prueba también.                  |
| **`MockedProvider` de Apollo**                             | Responde a las consultas reales de la página (mismo documento y mismas variables), así que una consulta mal formada no pasa.                                                                     |
| **Solo se reemplaza Chart.js**                             | jsdom no dibuja en `<canvas>`. Nuestro código (configuración, hook, canvas accesible) se sigue ejecutando; solo la librería de dibujo es falsa.                                                  |
| **El arrastre se prueba como lógica**                      | jsdom no calcula posiciones (todo mide 0). Se prueban la función del teclado, los anuncios y el botón alternativo.                                                                               |
| **Base `_test` aparte con `migrate deploy` + `TRUNCATE`**  | `migrate deploy` solo aplica migraciones pendientes y nunca borra. Cada archivo vacía y llena sus propias tablas, y el código se niega a tocar una base cuyo nombre no termine en `_test`.       |
| **Dos proyectos de Vitest en la API**                      | `pnpm test` sigue siendo rápido y autosuficiente; las pruebas con Docker van aparte (`pnpm test:db`).                                                                                            |

## Alternativas descartadas

- **Solo fakes (opción A)**: no habría probado el SQL. La mutación de quitar `nulls: 'last'` solo la detecta la prueba contra PostgreSQL.
- **`prisma migrate reset` en el setup**: Prisma bloquea ese comando cuando lo lanza un agente de IA, porque borra la base entera. `migrate deploy` + `TRUNCATE` logra lo mismo sin un comando destructivo.
- **happy-dom en vez de jsdom**: es más rápido, pero tiene más huecos de compatibilidad. Con pocas pruebas la velocidad no compensa.
- **Reporte de cobertura**: se dejó para más adelante (YAGNI). Las mutaciones manuales demostraron mejor que las pruebas detectan errores.

## Lo que encontraron las pruebas (y lo que no era un bug)

- **Dos copias de `graphql` en Vitest ("dual package hazard")**: graphql 17 trae una compilación aparte para la condición `development`. Vitest la elegía, pero `graphql-yoga` (cargado por Node) recibía la normal, así que había dos clases `GraphQLError` distintas y `instanceof` fallaba. Se resolvió indicando a Vitest las mismas condiciones que usa Node (`api/vitest.config.ts`).
- **`pg` no cargaba al forzar la condición `import`**: Vite le daba la versión ESM de `pg-pool` a un `require()`. Vite ya elige `import` o `require` según el caso, así que no hay que forzarlo.
- **"CompararYamaha MT-07"**: el nombre accesible calculado en jsdom no tenía espacio. Antes de "arreglarlo" se comprobó en el árbol de accesibilidad real de Chromium, que sí decía "Comparar Yamaha MT-07". Era una diferencia de la librería de pruebas, no un bug de la app.
- **Las pruebas funcionan**: se rompió el código a propósito en 3 lugares (precios null al final, orden de `compare`, ocultar errores del catálogo) y en los tres casos una prueba falló.

## Comandos que vale la pena recordar

```bash
pnpm test                                         # todas las pruebas sin base de datos
pnpm test:db                                      # consultas de Prisma contra motocompare_test
pnpm --filter web exec vitest                     # modo watch: repite las pruebas al guardar
pnpm --filter web exec vitest run CatalogPage     # solo los archivos cuyo nombre coincide
pnpm --filter api exec vitest run --project unit  # un solo proyecto de Vitest
```

## Para estudiar más

1. **Dobles de prueba**: diferencias entre fake, stub, mock y spy, y por qué un fake con la misma interfaz da pruebas menos frágiles.
2. **Mutation testing**: qué mide (si las pruebas detectan cambios en el código) frente a la cobertura (si el código se ejecuta). Stryker lo automatiza.
3. **Condiciones de `exports` en `package.json`**: `import`, `require`, `node`, `module-sync`, `development`, y cómo los empaquetadores pueden cargar dos copias de un mismo paquete.
