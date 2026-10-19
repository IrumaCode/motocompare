# Fase 2: API GraphQL

## Qué se construyó

- **Servidor GraphQL Yoga** en `api/src/`. Se levanta con `pnpm --filter api dev` y abre el playground (GraphiQL) en `http://localhost:4000/graphql`.
- **Queries:**
  - `motorcycles`: listado con filtros, orden y paginación.
  - `motorcycle(slug)`: detalle de una moto.
  - `compare(slugs)`: de 2 a 4 motos, en el orden pedido.
  - `brands` y `categories`.
  - `exchangeRate`: la tasa del dólar usada para convertir precios.
- **Precio en pesos** (`priceCop`): `priceUsd` × la TRM oficial del día, consultada en datos.gov.co y guardada en caché por 6 horas.
- **DataLoader** para la marca y la categoría de cada moto: listar 30 motos hace **4 consultas SQL en vez de 62**.
- **Tipos generados** con GraphQL Code Generator: los resolvers están tipados a partir del esquema.

## La arquitectura en capas

```
petición HTTP
  └─ server.ts                  (Node: solo abre el puerto)
      └─ app.ts                 (Yoga: arma todo, sin APIs de Node)
          └─ graphql/resolvers  (delgados: reciben argumentos y delegan)
              └─ services/      (reglas: validaciones, límites, conversión de precio)
                  └─ repositories/ (Prisma: traducir filtros a SQL)
```

| Archivo                            | Responsabilidad                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| `graphql/type-defs.ts`             | El esquema (SDL): el contrato que verá el frontend                              |
| `graphql/resolvers/*.ts`           | Una línea por campo: llaman a un servicio o a un loader                         |
| `graphql/loaders.ts`               | DataLoaders de marca y categoría, nuevos en cada petición                       |
| `services/motorcycle-service.ts`   | Página ≥ 1, `pageSize` máximo 50, rangos válidos, reglas de `compare`           |
| `services/price-service.ts`        | Convierte USD → COP; si no hay tasa, devuelve `null` sin romper la consulta     |
| `repositories/*.ts`                | Única capa que conoce Prisma: filtros `where`, `orderBy`, `skip` y `take`       |
| `exchange-rate/trm-provider.ts`    | Adapter: lee el JSON de datos.gov.co y lo convierte en un `ExchangeRate` limpio |
| `exchange-rate/cached-provider.ts` | Decorator: añade caché a cualquier proveedor sin modificarlo                    |
| `config.ts`                        | Lee y valida las variables de entorno al arrancar (falla rápido si falta algo)  |

## Decisiones clave y por qué

| Decisión                                       | Por qué                                                                                                                                                                                                                       |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Schema-first** + Codegen                     | El SDL es el contrato y se lee de un vistazo. Codegen genera los tipos de los resolvers, así TypeScript avisa si un resolver devuelve algo que no cumple el esquema. La alternativa code-first (Pothos) añadía otra librería. |
| SDL en un `.ts`, no en un `.graphql`           | Leer un `.graphql` exige `node:fs`, que no existe en Cloudflare Workers. El comentario `/* GraphQL */` permite que Codegen y el editor lo reconozcan igual.                                                                   |
| `mappers` en Codegen                           | El "padre" que recibe el resolver de `Motorcycle` es el modelo de Prisma (con `brandId`), no el tipo GraphQL (con `brand`). Así Codegen sabe qué campos hay que resolver con código.                                          |
| `enumsAsTypes`                                 | Los enums de GraphQL se generan como uniones de strings, iguales a los de Prisma. No hace falta convertir `'V_TWIN'` de un lado a otro.                                                                                       |
| **Paginación por offset** (`page`, `pageSize`) | Con ~30 motos y una UI de "página N de M", los cursores de Relay solo añadían complejidad. `totalCount` se calcula con el mismo filtro, en paralelo.                                                                          |
| Orden estable                                  | Siempre se desempata por `id`. Sin eso, dos motos con el mismo precio podrían aparecer en dos páginas o en ninguna.                                                                                                           |
| Precio `null` al final                         | `nulls: 'last'` en los dos sentidos. En PostgreSQL, por defecto los null van primero al ordenar de mayor a menor.                                                                                                             |
| Orden por nombre = marca + modelo              | `NAME` ordena por marca y luego por modelo, como se lee "Honda CB500F". Ordenar solo por modelo mezclaba marcas ("390 Duke" primero).                                                                                         |
| `pageSize` grande se recorta, no falla         | Pedir 500 devuelve 50 e informa `pageSize: 50`. Es más amable que un error y protege la base.                                                                                                                                 |
| Valores por defecto en el SDL                  | `page: Int! = 1`: el `!` impide que un cliente mande `null` explícito, y el playground muestra los valores por defecto.                                                                                                       |
| `InputError` + `maskError`                     | Yoga oculta los mensajes de error por seguridad ("Unexpected error"). Los errores de entrada del usuario sí se muestran, con código `BAD_USER_INPUT`. Los servicios no importan nada de GraphQL.                              |
| **TRM oficial** (datos.gov.co)                 | Es la tasa de referencia en Colombia, gratis, sin clave ni atribución obligatoria. Frankfurter (BCE) se descartó porque no tiene COP.                                                                                         |
| Interfaz `ExchangeRateProvider`                | Hay una frontera externa (HTTP) que puede cambiar. Cambiar de fuente sería escribir otro adapter, sin tocar servicios ni resolvers.                                                                                           |
| Caché _stale-while-revalidate_                 | Solo la primera petición espera a datos.gov.co. Cuando la tasa vence, se sigue devolviendo la anterior al instante y se refresca en segundo plano. Si la fuente cae, se reintenta pasado 1 minuto.                            |
| `priceCop` es `null` si no hay tasa            | Mejor un campo vacío que una consulta rota: el catálogo sigue funcionando aunque datos.gov.co no responda.                                                                                                                    |
| Factory functions + interfaces                 | `createMotorcycleService(repository)` recibe sus dependencias (inyección). En la Fase 6 se le podrá pasar un repositorio falso para probarlo sin base de datos.                                                               |
| `app.ts` separado de `server.ts`               | `app.ts` solo usa la Fetch API (portable). `server.ts` es lo único atado a Node. Para Workers bastaría otro archivo de entrada de pocas líneas.                                                                               |
| Un cliente de Prisma por proceso               | Un cliente = un pool de conexiones. Crear uno por petición agotaría las conexiones de PostgreSQL.                                                                                                                             |
| `--env-file-if-exists` de Node                 | Carga el `.env` de la raíz sin `dotenv`. Si no existe (producción), no falla: las variables las pone la plataforma.                                                                                                           |

## Qué es el problema N+1 (y cómo lo resuelve DataLoader)

Sin DataLoader, al pedir 30 motos con su marca: 1 consulta para las motos + 30 consultas, una por marca (de ahí "N+1"), y otras 30 para las categorías. DataLoader espera a que todos los resolvers del mismo "tick" pidan su marca, junta los ids (`[1, 3, 5, ...]`) y hace **una** consulta `WHERE id IN (...)`. Además recuerda lo que ya cargó durante esa petición. Por eso los loaders se crean **en cada petición**: si fueran globales, su caché serviría datos viejos para siempre.

## Revisión de diseño (agente `clean-code-reviewer`)

El veredicto fue "listo con sugerencias", sin hallazgos de gravedad alta.

**Se aplicaron:**

- **Caché.** Antes, cada 6 horas las peticiones esperaban la respuesta de datos.gov.co (hasta 5 s). Ahora la tasa vieja se devuelve al instante mientras se actualiza en segundo plano, lo que también encaja mejor con Cloudflare Workers.
- **Rango de precio vacío.** `priceUsd: {}` excluía las motos sin precio sin necesidad; ahora no filtra nada. Se corrigió también la descripción del SDL.

**No se aplicó:** el revisor marcó que las opciones `now`, `logger` y `fetchFn` existen solo para probar el código, y aún no hay tests. Se mantienen porque la Fase 6 son justamente los tests: la caché y el servicio de motos son los primeros candidatos.

**Pendiente para la Fase 8:** en Workers, el refresco en segundo plano debería usar `ctx.waitUntil` o la Cache API.

## Alternativas descartadas

- **Code-first con Pothos**: tipos sin generar código, pero otra dependencia y el esquema queda repartido en el código.
- **Paginación por cursor (Relay)**: ideal para scroll infinito y listas que cambian mucho; aquí sobraba.
- **open.er-api.com**: exige atribución visible. **fawazahmed0 (jsDelivr)**: no es oficial.
- **Cadena de proveedores de respaldo**: si cae la TRM se podría consultar otra fuente. Por YAGNI, de momento basta con la caché.
- **zod para validar el `.env`**: dos variables no justifican otra dependencia.

## Comandos que vale la pena recordar

```bash
pnpm --filter api dev       # API en http://localhost:4000/graphql (se reinicia al guardar)
pnpm --filter api codegen   # regenerar tipos tras editar type-defs.ts (también corre en pnpm install)
```

Ejemplo para pegar en el playground:

```graphql
{
  motorcycles(
    filter: { brandSlugs: ["yamaha", "kawasaki"], displacementCc: { min: 300, max: 700 } }
    sort: { field: PRICE_USD, direction: DESC }
  ) {
    totalCount
    items {
      name
      priceUsd
      priceCop
      brand {
        name
      }
    }
  }
  exchangeRate {
    copPerUsd
    validFrom
  }
}
```

## Limitación conocida

PostgreSQL ordena el texto según la _collation_ de la base. Aunque la base local declara `en_US.utf8`, la imagen `postgres:18-alpine` usa la librería musl, que ignora esa regla y compara bytes. Por eso "KTM" aparece antes que "Kawasaki": las mayúsculas van antes que las minúsculas. En Neon (Fase 8) el orden puede salir distinto. Con 5 marcas no molesta; si importa, se puede fijar una _collation_ ICU con una migración.

## Para estudiar más

1. **El ciclo de vida de una petición en GraphQL**: parseo, validación contra el esquema y ejecución campo a campo. Es lo que explica por qué existe el N+1 y por qué DataLoader agrupa por "tick".
2. **Patrones Adapter y Decorator**: cómo `withCache(createTrmProvider())` compone comportamiento sin herencia, y en qué se diferencia de meter la caché dentro del proveedor.
3. **Seguridad de una API GraphQL pública**: límites de profundidad y de complejidad de las queries, y _rate limiting_. Serán relevantes al publicar la API en la Fase 8.
