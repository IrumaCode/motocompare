import { graphql, type DocumentType } from '../../generated/graphql';

// In a .ts file so the detail components can share its result type
// (react-refresh only allows components to be exported from .tsx files)
export const motorcycleDetailQuery = graphql(`
  query MotorcycleDetail($slug: String!) {
    motorcycle(slug: $slug) {
      id
      slug
      name
      year
      priceUsd
      priceCop
      displacementCc
      engineType
      cooling
      powerHp
      powerRpm
      torqueNm
      torqueRpm
      transmission
      gears
      weightKg
      seatHeightMm
      fuelCapacityL
      powerPercentile
      image {
        url
        author
        license
        licenseUrl
        sourceUrl
      }
      brand {
        id
        name
      }
      category {
        id
        name
      }
    }
  }
`);

export type MotorcycleDetail = NonNullable<
  DocumentType<typeof motorcycleDetailQuery>['motorcycle']
>;
