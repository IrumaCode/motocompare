# Fase 5: Comparador y gráficos

## Qué se construyó

- **Bandeja de comparación**: barra fija abajo con hasta 4 motos.
  - Muestra chips con "Quitar", huecos libres y el botón "Ver comparación" (se activa con 2 motos).
  - Se guarda en `localStorage`: sobrevive a recargar y a navegar, y las pestañas abiertas se sincronizan entre sí.
- **Dos formas de añadir una moto**:
  - el botón **"Comparar"** de cada tarjeta y de la ficha de detalle;
  - **arrastrar** la tarjeta desde su asa (⋮⋮) hasta la bandeja, con mouse, dedo o teclado (espacio para tomarla, flecha → para llevarla a la bandeja, espacio para soltarla).
- **Página `/comparar?moto=a&moto=b`**: la URL define qué se compara, así que el enlace se puede compartir. Tiene:
  - columnas con foto y "Quitar";
  - la **carrera de potencia por kilo** (hp/kg): cada moto en su carril;
  - **gráfico de radar** (perfil de cada moto) y **barras** (potencia, torque, peso y precio);
  - **ficha técnica** lado a lado, con un trofeo en el mejor valor de cada fila.
- **Estados**: menos de 2 motos, enlace con una moto que no existe (404), error de red con "Reintentar" y carga lenta (cold start).
- **La API no cambió**: la query `compare(slugs)` ya existía desde la Fase 2.

## Cómo encaja todo

```
AppLayout
  └─ ComparisonProvider        estado de la bandeja + localStorage + evento "storage"
      └─ ComparisonDnd         DndContext de @dnd-kit (sensores, anuncios, DragOverlay)
          ├─ páginas → ComparableMotorcycleCard
          │     └─ MotorcycleCard + actions: DragHandle (useDraggable) + CompareToggle
          └─ ComparisonTray    useDroppable: la zona donde se suelta

/comparar?moto=…  (cargada con React.lazy: Chart.js solo se descarga aquí)
  └─ ComparePage → useQuery(CompareMotorcycles)
      ├─ ComparedMotorcycles
      ├─ PowerToWeightRace ┐
      ├─ RadarChart        ├─ todos leen comparison-metrics.ts (una sola definición)
      ├─ MetricBarCharts   │
      └─ SpecComparisonTable ┘
```

## Decisiones clave y por qué

| Decisión                                                | Por qué                                                                                                                                                                                                    |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bandeja en `localStorage`, comparación en la URL**    | Son dos cosas distintas: la bandeja es un borrador personal y la comparación es algo que se comparte. Abrir un enlace ajeno no pisa tu bandeja.                                                            |
| **`@dnd-kit/core`** y no `@dnd-kit/react`               | `core` es estable (6.x). `react` es su sucesor, pero sigue en 0.x con la API cambiando. Solo 3 archivos lo usan, así que migrar después sería fácil.                                                       |
| **Arrastrar solo desde un asa**                         | `touch-none` va solo en el asa, así que con el dedo el resto de la tarjeta sigue haciendo scroll.                                                                                                          |
| **Teclado: → lleva a la bandeja**                       | El `KeyboardSensor` hace scroll de la página con ↑/↓ cerca del borde, y la bandeja fija no se mueve con el scroll, así que nunca se alcanzaría. Con un solo destino, "saltar" a él es más claro.           |
| **Siempre hay un botón**                                | WCAG 2.2 (2.5.7) exige una alternativa sin arrastrar. El botón usa `aria-pressed` y, con la bandeja llena, `aria-disabled` en vez de `disabled`: así sigue recibiendo foco y explica por qué no hace nada. |
| **Un solo módulo de métricas**                          | Etiqueta, unidad y "qué valor gana" viven en `comparison-metrics.ts`. La tabla, la carrera y los gráficos no pueden contradecirse (DRY).                                                                   |
| **Radar normalizado contra la mejor de la comparación** | Responde "¿cuál gana aquí y por cuánto?" sin pedir nada nuevo a la API. Usa proporciones (`valor / máximo`) y no min-max, porque min-max pondría a la peor en 0 y exageraría diferencias pequeñas.         |
| **Chart.js directo con un hook propio** (`useChart`)    | 40 líneas en vez de la dependencia `react-chartjs-2`. Se ve el ciclo de vida: crear el gráfico en un efecto y destruirlo en la limpieza.                                                                   |
| **Registro selectivo de Chart.js**                      | Solo se registran los controladores de radar y barras, en vez de `chart.js/auto`, que incluye todos los tipos.                                                                                             |
| **`useLayoutEffect` en `ThemeProvider`**                | React ejecuta los efectos de los hijos antes que los del padre. Con `useEffect`, el gráfico leía los colores del tema anterior. Todos los efectos de layout terminan antes que cualquier efecto normal.    |
| **Color + forma + línea por moto**                      | Círculo, triángulo, cuadrado y rombo, con líneas distintas en el radar. Las series se distinguen sin depender del color (daltonismo, impresión en gris).                                                   |
| **Carrera con CSS puro**                                | Las keyframes solo declaran el inicio. El final es la posición propia de cada carril, así que una sola animación sirve para todos. Con "reducir movimiento" no se anima y las estelas quedan como barras.  |
| **`React.lazy` para `/comparar`**                       | El bundle principal bajó de 243 kB a 175 kB (gzip). Chart.js (69 kB) solo se descarga al abrir la comparación.                                                                                             |
| **`previousData` al quitar una columna**                | La nueva lista de slugs no está en caché. Mientras llega, se muestran las motos que quedan en vez de un esqueleto.                                                                                         |

## Alternativas descartadas

- **`react-chartjs-2`**: ahorra el hook, pero es otra dependencia y oculta justo lo que valía la pena aprender.
- **Normalizar el radar contra todo el catálogo**: exigía un campo nuevo en la API para algo que la comparación no necesita (YAGNI).
- **Guardar la comparación solo en la URL**: la bandeja se perdería al navegar por el catálogo.
- **Animar la carrera con `requestAnimationFrame`**: más código y más trabajo del hilo principal para algo que CSS hace solo.
- **Clonar la tarjeta completa al arrastrar**: un chip pequeño (`DragOverlay`) es más ligero en el móvil y tapa menos.

## Errores que aparecieron y cómo se resolvieron

- **La página se desbordaba de lado en el móvil**: los textos `sr-only` (posición absoluta) de la tabla se salían del contenedor con scroll. Ese contenedor no estaba posicionado, así que no era su "containing block". Se arregló con `relative`.
- **Las keyframes de la carrera no movían nada**: Tailwind v4 usa las propiedades CSS `translate` y `scale`, no `transform`. Las animaciones tienen que animar esas mismas propiedades.
- **Clases que no se pisan**: `px-3` en `className` no cambiaba un botón que ya tenía `px-4`. En CSS gana la clase que se define después en la hoja, no la que se escribe después en el atributo. Por eso el tamaño ahora es una opción del botón (`size="compact"`).

## Comandos que vale la pena recordar

```bash
pnpm --filter web add @dnd-kit/core chart.js   # dependencias de esta fase
pnpm --filter web build                        # muestra el tamaño de cada chunk (gzip incluido)
pnpm view @dnd-kit/react version               # consultar la última versión de un paquete sin instalarlo
```

## Para estudiar más

1. **Containing block en CSS**: qué elemento usa como referencia algo con `position: absolute`, `fixed` o `sticky`. Explica tanto el bug del desbordamiento como por qué la bandeja `sticky` nunca tapa el footer.
2. **Orden de los efectos en React**: `useLayoutEffect` frente a `useEffect`, y por qué los de los hijos corren antes que los de los padres.
3. **Code splitting**: `React.lazy` + `Suspense` e `import()` dinámico, y cómo leer el informe de chunks de Vite para decidir qué separar.
