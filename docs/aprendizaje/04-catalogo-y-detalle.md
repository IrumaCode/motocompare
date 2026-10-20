# Fase 4: Catálogo, detalle e imágenes

## Qué se construyó

- **Fotos reales**: 28 de las 30 motos tienen una foto de Wikimedia Commons con licencia libre (CC BY, CC BY-SA o CC0). Se eligieron a mano, se recortaron a 16:10 y se convirtieron a WebP de 960×600 px, unos 2,7 MB en total, en `web/public/motos/`. La KLX230 S y la 990 Duke muestran una silueta porque no había foto libre del modelo correcto.
- **Migración de Prisma** con 5 columnas nuevas en `motorcycles`: `image_path`, `image_author`, `image_license`, `image_license_url` e `image_source_url`. El seed las llena desde `seed-data/motorcycles.ts`.
- **API GraphQL**:
  - `Motorcycle.image`: ruta, autor, licencia y enlaces, o `null` si no hay foto.
  - `Motorcycle.powerPercentile`: qué porcentaje del resto del catálogo tiene menos potencia.
- **Catálogo `/motos`**:
  - tarjetas con foto;
  - filtros con chips: marca, categoría y rangos de cilindrada y precio;
  - 6 formas de ordenar y paginación numerada;
  - en el móvil, los filtros van en un panel inferior (`<dialog>`).
- **Detalle `/motos/:slug`**:
  - foto con su crédito;
  - 4 cifras clave y el precio en US$ y COP;
  - medidor de potencia;
  - especificaciones agrupadas en Motor, Transmisión y Chasis;
  - botón "Volver" que conserva los filtros, y 404 si la moto no existe.
- **Identidad visual**:
  - iconos de Phosphor en toda la interfaz;
  - la moto del loader convertida en el componente `MotoIllustration`, con tres variantes: animada (loader), estática (sin foto, catálogo vacío, 404 y medidor) y "marca" (logo y favicon).

## Cómo encaja todo

```
/motos?marca=ktm&orden=potencia-desc
  └─ CatalogPage
      ├─ useCatalogParams()      URL ⇄ CatalogParams (funciones puras)
      ├─ useQuery(CatalogFilterOptions)   marcas y categorías (una vez, luego caché)
      ├─ useQuery(CatalogMotorcycles)     filtro + orden + página
      ├─ CatalogFilters  (barra lateral en escritorio / FiltersDialog en móvil)
      └─ MotorcycleCard ×12 + Pagination

/motos/yamaha-mt-07-2024
  └─ MotorcycleDetailPage → useQuery(MotorcycleDetail)
      ├─ MotorcyclePhoto + PhotoCredit
      ├─ KeyFigures, precio, PowerMeter
      └─ SpecGroups

API: resolver Motorcycle.powerPercentile
  → DataLoader (una consulta por petición) → MotorcycleService.powerPercentiles
  → MotorcycleRepository.listPowerHp()
```

## Decisiones clave y por qué

| Decisión                                               | Por qué                                                                                                                                                                                   |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Filtros en la URL** (`?marca=…&pagina=2`)            | La URL es la única fuente de verdad: se puede compartir, sobrevive a recargar y el botón "atrás" deshace un filtro. Las funciones que traducen URL ⇄ estado son puras, fáciles de probar. |
| **Chips con rangos predefinidos**                      | Un toque en el móvil y sin librerías. Los rangos de precio van en US$ porque en pesos cambiarían cada día con la TRM.                                                                     |
| **`powerPercentile` calculado en la API**              | La regla de negocio vive en un servicio, no en React. Un DataLoader hace que pedirlo para 12 motos cueste una sola consulta (evita N+1).                                                  |
| **Columnas planas para la foto** (no una tabla aparte) | Son 5 datos que siempre van juntos con la moto. Otra tabla exigiría un join o un loader más, sin ganar nada (YAGNI).                                                                      |
| **Ruta relativa** `/motos/<slug>.webp`                 | La web sirve las fotos desde su propio dominio, así que funciona aunque la API se aloje aparte en la Fase 8.                                                                              |
| **`<dialog>` nativo** para los filtros en móvil        | `showModal()` ya da la trampa de foco, Esc para cerrar, fondo inerte y foco de vuelta al botón. Sin librerías.                                                                            |
| **Enlace "estirado"** en la tarjeta                    | Toda la tarjeta es clicable, pero el lector de pantalla oye un enlace corto (el nombre) en vez de toda la tarjeta.                                                                        |
| **`previousData` de Apollo**                           | Al cambiar un filtro se siguen viendo los resultados anteriores (atenuados) hasta que llegan los nuevos, en vez de un parpadeo de esqueletos.                                             |
| **`sharp-cli` con `pnpm dlx`**                         | La conversión a WebP se hace una sola vez. Se ejecuta sin quedar como dependencia del proyecto.                                                                                           |

## Alternativas descartadas

- **Sliders de doble punto** para los rangos: hay que construirlos a mano y con el dedo son incómodos.
- **"Cargar más"** en vez de paginación numerada: la página no quedaría en la URL.
- **Calcular el percentil en el navegador** pidiendo todas las potencias: lleva lógica de negocio a React y descarga datos de más.
- **Recorte automático "attention" de sharp**: en varias fotos cortaba la moto. El recorte centrado funcionó mejor, revisándolas una por una.

## Comandos que vale la pena recordar

```bash
pnpm --filter api exec prisma migrate dev --name add_motorcycle_image   # nueva migración
pnpm --filter api db:seed                                               # recarga las fotos y créditos
pnpm dlx sharp-cli -i foto.jpg -o foto.webp -f webp -q 72 resize 960 600 --fit cover --position centre
```

Ojo: `pnpm --filter api db:migrate -- --name x` **no** funciona. pnpm pasa el `--` literal a Prisma, que entonces pide el nombre de forma interactiva y se queda esperando.

## Para estudiar más

1. **Licencias Creative Commons**: qué exige CC BY-SA al recortar una foto ("obra derivada") y en qué se diferencia de CC0.
2. **El elemento `<dialog>`** y la "top layer" del navegador: por qué ya no hacen falta librerías de modales.
3. **DataLoader más allá de "buscar por id"**: agrupar cualquier cálculo por petición, como el percentil de potencia.
