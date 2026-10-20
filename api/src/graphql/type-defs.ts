// Kept as a TS string (not a .graphql file read with node:fs) so the API stays runtime-portable.
// The /* GraphQL */ comment lets GraphQL Code Generator and editors find the SDL.
export const typeDefs = /* GraphQL */ `
  type Query {
    "Paginated catalog. Sorting by price puts motorcycles without a price last."
    motorcycles(
      filter: MotorcycleFilter
      sort: MotorcycleSort! = { field: NAME }
      "1-based page number."
      page: Int! = 1
      "Items per page (values above 50 are clamped to 50)."
      pageSize: Int! = 12
    ): MotorcyclePage!

    motorcycle(slug: String!): Motorcycle

    "Between 2 and 4 distinct motorcycles, returned in the requested order."
    compare(slugs: [String!]!): [Motorcycle!]!

    brands: [Brand!]!
    categories: [Category!]!

    "USD to COP rate used for priceCop; null when the rate source is unavailable."
    exchangeRate: ExchangeRate
  }

  type Motorcycle {
    id: ID!
    slug: String!
    "Model name without the brand, e.g. MT-07."
    name: String!
    year: Int!
    brand: Brand!
    category: Category!
    "Base US MSRP in whole dollars; null when no official price was confirmed."
    priceUsd: Int
    "priceUsd converted with the current exchange rate, in whole pesos."
    priceCop: Int
    displacementCc: Int!
    engineType: EngineType!
    cooling: CoolingType!
    powerHp: Float!
    powerRpm: Int!
    torqueNm: Float!
    torqueRpm: Int!
    transmission: TransmissionType!
    "Number of gears; null for CVT."
    gears: Int
    "Ready-to-ride (curb) weight."
    weightKg: Int!
    seatHeightMm: Int!
    fuelCapacityL: Float!
    "Freely licensed photo; null when the catalog has none for this model."
    image: MotorcycleImage
    "Share (0-100) of the other catalog motorcycles with strictly less power (a unique top gets 100)."
    powerPercentile: Float!
  }

  "Photo plus the credit its license requires."
  type MotorcycleImage {
    "Path relative to the web app origin, e.g. /motos/yamaha-mt-07-2024.webp"
    url: String!
    author: String!
    "Short license name, e.g. CC BY-SA 4.0."
    license: String!
    licenseUrl: String!
    "Page of the original file (Wikimedia Commons)."
    sourceUrl: String!
  }

  type Brand {
    id: ID!
    slug: String!
    name: String!
    country: String!
  }

  type Category {
    id: ID!
    slug: String!
    name: String!
  }

  type MotorcyclePage {
    items: [Motorcycle!]!
    "Number of motorcycles matching the filter, across all pages."
    totalCount: Int!
    page: Int!
    pageSize: Int!
  }

  type ExchangeRate {
    copPerUsd: Float!
    "Date (YYYY-MM-DD) from which the rate applies."
    validFrom: String!
    source: String!
  }

  input MotorcycleFilter {
    "Matches any of the given brands. An empty list does not filter."
    brandSlugs: [String!]
    "Matches any of the given categories. An empty list does not filter."
    categorySlugs: [String!]
    displacementCc: IntRange
    "When a bound is given, motorcycles without a price are excluded."
    priceUsd: IntRange
  }

  "Inclusive range; omit a bound to leave it open."
  input IntRange {
    min: Int
    max: Int
  }

  input MotorcycleSort {
    field: MotorcycleSortField!
    direction: SortDirection! = ASC
  }

  enum MotorcycleSortField {
    NAME
    YEAR
    PRICE_USD
    DISPLACEMENT_CC
    POWER_HP
    WEIGHT_KG
  }

  enum SortDirection {
    ASC
    DESC
  }

  enum EngineType {
    SINGLE
    PARALLEL_TWIN
    V_TWIN
    BOXER_TWIN
    INLINE_THREE
    INLINE_FOUR
    V_FOUR
  }

  enum CoolingType {
    AIR
    AIR_OIL
    AIR_LIQUID
    LIQUID
  }

  enum TransmissionType {
    MANUAL
    CVT
    DCT
  }
`;
