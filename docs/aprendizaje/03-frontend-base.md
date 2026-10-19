# Fase 3: Frontend base

## Qué se construyó

- **App React en `web/`** con Vite 8, React 19, TypeScript estricto y Tailwind CSS 4.
- **Cliente GraphQL Apollo Client 4** conectado a la API. En desarrollo, Vite reenvía `/graphql` a `localhost:4000` (proxy), así que no hace falta configurar CORS.
- **Tipos generados de punta a punta**: GraphQL Code Generator lee el esquema de la API y las queries de la web, y genera los tipos. Si una query pide un campo que no existe, falla el type-check.
- **Sistema de diseño "Racing Dark"**: colores semánticos, tema claro y oscuro, tipografías Syncopate (títulos) e Inter (texto).
- **Layout** (cabecera con botón de tema y pie), **rutas** con React Router (inicio y 404) y una **home** con estadísticas y las 6 motos más potentes, con datos reales.
- **Estados de carga y error**: esqueletos mientras llegan los datos; si la carga pasa de 3 s, un loader animado de una moto de carrera ("Calentando motores…"), y un mensaje con botón "Reintentar" si la API no responde.

## Cómo encaja todo

```
main.tsx
  └─ ThemeProvider (tema claro/oscuro, una sola fuente de verdad)
      └─ ApolloProvider (cliente GraphQL + caché)
          └─ BrowserRouter (rutas)
              └─ App → AppLayout (Header + <Outlet/> + Footer)
                  ├─ "/"  → HomePage → useQuery(HomePage) → StatsStrip + MotorcycleCard ×6
                  └─ "*"  → NotFoundPage
```

| Carpeta                     | Qué contiene                                                              |
| --------------------------- | ------------------------------------------------------------------------- |
| `src/app/`                  | El "esqueleto" de la app: rutas, layout, cabecera, pie, tema              |
| `src/features/home/`        | Todo lo de la página de inicio                                            |
| `src/features/motorcycles/` | Piezas de motos reutilizables (tarjeta, esqueleto, fragmento GraphQL)     |
| `src/components/ui/`        | Componentes genéricos sin lógica de negocio: botón, esqueleto, error      |
| `src/lib/`                  | Utilidades sin React: cliente Apollo, configuración, formato de números   |
| `src/generated/`            | Tipos generados por Codegen (ignorado en git; se crea con `pnpm install`) |

Organizar por **funcionalidad** (`features/`) y no por tipo de archivo (`components/`, `hooks/`, `pages/`) hace que en las Fases 4 y 5 el catálogo y el comparador tengan su propia carpeta, sin mezclarse.

## Decisiones clave y por qué

| Decisión                                       | Por qué                                                                                                                                                                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Apollo Client 4**                            | Es el cliente más usado. Su caché normalizada guarda cada moto una sola vez (por `__typename` + `id`), así una moto cargada en el catálogo ya está disponible en el detalle y el comparador.                       |
| **React Router** en modo declarativo           | `<Routes>` y `<Route>` dentro de la app. El "modo framework" (con su propio servidor y build) sería otra forma de construir la app; aquí basta con un SPA.                                                         |
| Codegen lee el **SDL de la API** directamente  | No hace falta tener la API corriendo para generar tipos, y en la CI (Fase 7) funcionará sin base de datos.                                                                                                         |
| **Fragmentos colocados**                       | La tarjeta declara sus campos en `fragment MotorcycleCard`. Las páginas solo escriben `...MotorcycleCard`. Si la tarjeta necesita un campo nuevo, se cambia en un solo sitio.                                      |
| Fragment masking **desactivado**               | Con masking, el padre no puede leer los campos del fragmento y hay que "desenmascararlos". Es útil en equipos grandes, pero añade un concepto más; se puede activar después.                                       |
| Fragmento en un `.ts` aparte                   | La regla `react-refresh` exige que un `.tsx` solo exporte componentes (si no, el recargado en caliente pierde el estado). La tarjeta saca su tipo del fragmento con `DocumentType<typeof motorcycleCardFragment>`. |
| **Una sola query** para la home                | Una petición, un estado de carga y un estado de error. Tres queries separadas darían tres esqueletos que terminan a destiempo.                                                                                     |
| **Tailwind 4** con `@theme`                    | La configuración vive en CSS, sin `tailwind.config.js`. Los colores semánticos (`bg-surface`, `text-ink-muted`) apuntan a variables CSS; cambiar de tema solo cambia las variables.                                |
| Tema con `data-theme` + script en `index.html` | El script corre antes de pintar la página. Sin él, quien usa tema claro vería un "flash" oscuro al cargar.                                                                                                         |
| Sigue al sistema hasta que eliges              | Si nunca tocas el botón, la web sigue la preferencia del sistema operativo (y cambia con ella). Al elegir, tu opción se guarda en `localStorage` y manda.                                                          |
| Rojo distinto para texto y para botones        | `#DC2626` sobre el fondo oscuro tiene un contraste de 3,7:1 (WCAG pide 4,5:1 para texto). Se usa como relleno de botones (texto blanco encima: 4,8:1) y un rojo más claro (`#F87171`) para texto.                  |
| Esqueletos con el tamaño final                 | La página no "salta" cuando llegan los datos. En producción la API puede tardar en despertar (arranque en frío) y el usuario ve una estructura en lugar de una pantalla vacía.                                     |
| `motion-safe:animate-pulse`                    | El parpadeo de los esqueletos solo corre si el sistema no pide reducir el movimiento.                                                                                                                              |
| Precios con convenciones colombianas           | "US$ 18.990" y "$ 60.286.983": el mismo separador de miles en ambas monedas evita confusiones.                                                                                                                     |
| Cifras en fuente mono con `tabular-nums`       | Los números tienen el mismo ancho, así las columnas de especificaciones quedan alineadas (será clave en la tabla comparativa).                                                                                     |
| Iconos SVG en línea                            | Solo hacen falta tres (sol, luna, alerta). Una librería de iconos llegará si de verdad se necesitan más.                                                                                                           |
| `@graphql-typed-document-node/core`            | Solo aporta tipos. El código generado lo importa y pnpm no deja usar dependencias que no estén declaradas en el `package.json` del paquete.                                                                        |

## Revisión de diseño (agente `clean-code-reviewer`)

El veredicto fue "listo con sugerencias", sin hallazgos de gravedad alta.

**Se aplicaron:**

- **El tema pasó de un hook a un `ThemeProvider` con contexto.** Con el hook, cada componente que lo usaba guardaba su propia copia del tema. En la Fase 5, los gráficos no se habrían enterado del cambio que hace el botón. Ahora hay **una sola fuente de verdad**. Además, el provider lee el tema que ya fijó el script de `index.html` (la regla vive en un solo sitio) y sincroniza las pestañas abiertas con el evento `storage`.
- **Carga accesible.** Un `aria-label` en un `<div>` genérico no tiene efecto. Ahora el esqueleto usa `role="status"` con un texto "Cargando motos…" solo para lectores de pantalla, y los bloques grises van con `aria-hidden`.
- **Aviso de arranque en frío.** Si la carga se alarga, aparece un aviso. Lo resuelve el hook `useSlowLoading`, reutilizable en el catálogo y el comparador. Después se mejoró (ver la sección siguiente).
- **`VITE_API_URL=` vacío** se trata como no definido. Antes, las peticiones se habrían enviado a la propia página.
- Los tipos de Vite se declaraban dos veces; quedó solo el archivo `vite-env.d.ts`.

**Para la Fase 4:** la tarjeta enlazará al detalle con un enlace en el nombre que cubra toda la tarjeta (_stretched link_), y habrá que cuidar la jerarquía de títulos del catálogo.

## Ajustes pedidos tras la revisión (con la skill UI/UX Pro Max)

- **El tema es un interruptor (toggle switch).** Es un `<button role="switch" aria-checked>`: los lectores de pantalla anuncian "Modo oscuro, activado/desactivado". El botón mide 44 px de alto (área táctil cómoda), aunque el carril visible es más pequeño. La bolita roja se desliza con `motion-safe:transition-transform`, así que con "reducir movimiento" cambia sin animación.
- **Loader "Calentando motores…".** Es una moto deportiva carenada con el piloto agachado, en SVG. Las ruedas giran, la moto rebota levemente, hay líneas de velocidad y la carretera se desplaza. Debajo, el texto "Espera unos segundos mientras llegan las motos…". Decisiones:
  - **Dibujo original inspirado en una referencia, no calcado.** La imagen de referencia venía de un banco de fotos con marca de agua (tiene derechos de autor). Se tomó solo el estilo: silueta sólida, cortes "en negativo" que separan las piezas y ruedas gruesas. Los cortes se pintan con el color de la tarjeta (`stroke-surface`), así funcionan en los dos temas.
  - **Solo aparece si la carga pasa de 3 s.** En una carga normal los esqueletos bastan; mostrar un loader que dura medio segundo sería un parpadeo molesto (pauta de la skill: no hacer parpadear indicadores en esperas casi instantáneas).
  - **Solo se animan `transform`, `opacity` y `stroke-dashoffset`.** El navegador los resuelve sin recalcular el diseño de la página, así que la animación es fluida incluso en móviles modestos.
  - **Las animaciones se definen como _tokens_** en `@theme` (`--animate-wheel-spin`...) y se aplican con `motion-safe:`. Con "reducir movimiento" activado, la moto se dibuja quieta y el mensaje basta.
  - **`transform-box: fill-box`** hace que cada rueda gire sobre su propio centro y no sobre la esquina del SVG.
  - El SVG es decorativo (`aria-hidden`); lo que leen los lectores de pantalla es el texto dentro de la región `role="status"`.

## Alternativas descartadas

- **urql**: más ligero (≈10 KB frente a ≈40 KB), pero la caché normalizada requiere un paquete extra.
- **TanStack Router**: rutas 100 % tipadas, pero más conceptos que aprender.
- **Estilos "Bento Data" y "Premium Glass"**: el primero es más neutro; el segundo usa desenfoques costosos en móvil y complica el contraste.
- **Generar tipos por introspección** (preguntándole el esquema a la API en marcha): obliga a tener la API y la base de datos encendidas para compilar la web.

## Comandos que vale la pena recordar

```bash
pnpm --filter api dev       # 1) API en http://localhost:4000/graphql
pnpm --filter web dev       # 2) web en http://localhost:5173
pnpm --filter web codegen   # regenerar tipos tras cambiar una query o el esquema de la API
pnpm --filter web build     # build de producción en web/dist (type-check incluido)
pnpm --filter web preview   # servir el build localmente
```

## Para estudiar más

1. **La caché normalizada de Apollo**: abre Apollo DevTools en el navegador y mira cómo se guarda `Motorcycle:1`. Entender la caché explica por qué cada objeto necesita `id`.
2. **Server state frente a UI state**: los datos de la API los gestiona Apollo; el tema o lo que el usuario está arrastrando (Fase 5) es estado de la interfaz. Mezclarlos es la fuente de muchos bugs.
3. **Contraste y WCAG**: cómo se calcula la relación de contraste y por qué 4,5:1 para texto normal y 3:1 para texto grande o elementos de interfaz.
