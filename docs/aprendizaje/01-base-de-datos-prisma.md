# Fase 1: Base de datos con Prisma

## Qué se construyó

- **Schema de Prisma** (`api/prisma/schema.prisma`) con tres tablas: `brands`, `categories` y `motorcycles`, más tres _enums_: tipo de motor, refrigeración y transmisión.
- **Primera migración** (`api/prisma/migrations/..._init/migration.sql`): el SQL que crea todo. Se versiona en git.
- **Configuración de Prisma 7** (`api/prisma.config.ts`): rutas del schema, migraciones, seed y URL de la base.
- **Cliente reutilizable** (`api/src/db/prisma-client.ts`): una función `createPrismaClient()` que también usará la API en la Fase 2.
- **Seed curado**: 30 motos (modelo 2024) de Yamaha, Honda, Kawasaki, KTM y BMW, de 157 a 1300 cc, en 7 categorías. Los datos (`prisma/seed-data/`) están separados de la lógica (`prisma/seed.ts`).

## Decisiones clave y por qué

| Decisión                                               | Por qué                                                                                                                                                                                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Opción A: columnas tipadas**                         | Cada especificación es una columna con su tipo. Filtrar por rangos (`displacement_cc BETWEEN 600 AND 900`), ordenar y graficar es directo. La contra: añadir una especificación requiere una migración, pero eso es justo el flujo que queremos practicar. |
| **Enums** para motor, refrigeración y transmisión      | La base rechaza valores inválidos (no se puede guardar `"bicilindrico"` mal escrito) y TypeScript conoce los valores posibles.                                                                                                                             |
| `gears` opcional y `transmission` enum                 | Una scooter CVT no tiene "número de marchas". Modelarlo como `null` es más honesto que poner 0 o 1.                                                                                                                                                        |
| `priceUsd` opcional y entero                           | No todas las motos tienen precio oficial en EE. UU. Se guardan dólares enteros, porque los MSRP no usan centavos.                                                                                                                                          |
| `Float` para hp, Nm y litros                           | Son medidas físicas, no dinero. `Decimal` daría precisión exacta pero devuelve objetos especiales que complican GraphQL.                                                                                                                                   |
| IDs numéricos + `slug` único                           | El número es eficiente para las relaciones; el slug (`yamaha-tenere-700-2024`) sirve para URLs legibles y como clave natural del seed.                                                                                                                     |
| `@@unique([brandId, name, year])`                      | Impide duplicar la misma moto del mismo año.                                                                                                                                                                                                               |
| Índices en categoría, cilindrada y precio              | Son las columnas por las que se filtrará en la Fase 2. La marca ya queda indexada por el `@@unique`, porque `brand_id` va primero.                                                                                                                         |
| `@map` / `@@map` a `snake_case`                        | En TypeScript se usa `camelCase` (`powerHp`) y en SQL `snake_case` (`power_hp`), la convención de PostgreSQL. Así no hay que escribir comillas en SQL a mano.                                                                                              |
| Seed **idempotente** (`upsert` por slug)               | Se puede ejecutar mil veces y el resultado es el mismo: crea lo que falta y actualiza lo que cambió.                                                                                                                                                       |
| El seed es la **fuente de verdad**                     | Al final borra las motos que ya no están en los datos. Si una moto cambia de nombre, cambia su slug, y sin este paso quedaría una fila "fantasma" con el nombre viejo.                                                                                     |
| Seed en **una transacción** con límites amplios        | Si falla una moto, no queda la base a medias. Los límites (30 s) evitan que el seed se aborte contra una base remota que tarda en despertar.                                                                                                               |
| Unión discriminada `transmission` / `gears`            | En TypeScript, `{ transmission: 'CVT', gears: null } \| { transmission: 'MANUAL' \| 'DCT', gears: number }`. Así el compilador impide una moto manual sin marchas: el tipo valida una regla de negocio.                                                    |
| Prisma **7.10.1** y no 8                               | Prisma 8 sigue en RC y cambia cosas incompatibles entre candidatas.                                                                                                                                                                                        |
| **Driver adapter** `@prisma/adapter-pg`                | Prisma 7 ya no trae un motor Rust para las consultas: habla con PostgreSQL mediante el driver `pg`. Es más ligero y más portable (útil para la Fase 8).                                                                                                    |
| `process.loadEnvFile()` en vez de `dotenv`             | Prisma 7 ya no lee `.env` solo. Node 24 trae esta función integrada, así que no hace falta otra dependencia.                                                                                                                                               |
| Cliente generado en `src/generated/` e ignorado en git | Es código derivado del schema. Se regenera solo con `pnpm install` (script `postinstall`).                                                                                                                                                                 |
| `onlyBuiltDependencies` en pnpm                        | pnpm 10 bloquea los scripts de instalación de las dependencias por seguridad. Solo se autorizan los de Prisma y esbuild, que los necesitan.                                                                                                                |

## Sobre los datos

- La potencia viene de la cifra oficial en kW (fichas europeas) convertida a hp: kW × 1,341.
- El peso es en orden de marcha. KTM publica el peso sin combustible, así que se le suma el tanque lleno (0,74 kg/L).
- **Verificación (octubre 2026):** las 30 motos se contrastaron con fichas oficiales y comunicados de prensa. 25 de las 30 tenían al menos un precio o medida distinto del escrito de memoria, y la "Tracer 9 GT" pasó a ser "Tracer 9 GT+", que es la versión que se vendió en EE. UU. en 2024. Lección: **los datos escritos de memoria, aunque parezcan exactos, hay que verificarlos.**
- Precio: MSRP base en EE. UU. sin envío. Dos motos (Versys 650 y 890 Adventure) quedan con `priceUsd = null` porque no se encontró la cifra oficial; es mejor un dato vacío que uno inventado. La conversión a COP en tiempo real queda para la Fase 2.

## Revisión de diseño (agente `clean-code-reviewer`)

El revisor dio el veredicto "listo con sugerencias", sin hallazgos de gravedad alta. Se aplicaron: borrar las motos que salen del seed, límites de la transacción, la unión discriminada y una regex con caracteres invisibles (ahora `\p{M}`). También se añadió `tsx` a la tabla del stack. Queda para la Fase 2: ordenar por precio con null al final y desempate por `id`.

## Alternativas descartadas

- **Opción B, EAV** (cada especificación como fila): muy flexible, pero los filtros por rango requieren _joins_ complejos y se pierden los tipos.
- **Opción C, híbrida** con un campo JSON: flexible, pero ese JSON no tiene tipos ni validación de la base.
- **UUID como ID**: útil en sistemas distribuidos. Aquí un entero autoincremental es más simple y el slug cubre las URLs.
- **`dotenv`**: innecesario con Node 24.
- **Ejecutar el seed con el TypeScript nativo de Node**: posible, pero tiene restricciones con imports y con el cliente generado. `tsx` evita esa fricción y servirá para `api dev`.

## Comandos que vale la pena recordar

```bash
pnpm --filter api db:migrate -- --name add_abs_field   # nueva migración tras editar el schema
pnpm --filter api db:seed                              # cargar/actualizar datos
pnpm --filter api db:studio                            # explorar la base en el navegador
pnpm --filter api db:reset                             # borrar todo y reaplicar migraciones (luego db:seed)
pnpm --filter api exec prisma validate                 # validar el schema
pnpm --filter api exec prisma migrate status           # ver qué migraciones están aplicadas

docker compose exec -T postgres psql -U motocompare -d motocompare -c "select count(*) from motorcycles;"
```

> Prisma 7 detecta cuándo un agente de IA intenta `migrate reset` y lo bloquea hasta que el usuario lo autoriza explícitamente. Es una buena práctica de seguridad: los comandos destructivos piden confirmación humana.

## Para estudiar más

1. **Migraciones en equipo**: qué pasa si dos ramas crean migraciones a la vez, y por qué nunca se edita una migración ya aplicada en producción (`migrate dev` frente a `migrate deploy`).
2. **Índices**: cómo decide PostgreSQL si usar un índice (`EXPLAIN ANALYZE`) y por qué un índice compuesto sirve para su primera columna, pero no para la segunda.
3. **Normalización**: por qué marca y categoría son tablas aparte y no un texto repetido en cada moto, y cuándo conviene desnormalizar.
