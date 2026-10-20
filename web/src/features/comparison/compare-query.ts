import { graphql, type DocumentType } from '../../generated/graphql';

// In a .ts file so the comparison components can share its result type
// (react-refresh only allows components to be exported from .tsx files)
export const compareQuery = graphql(`
  query CompareMotorcycles($slugs: [String!]!) {
    compare(slugs: $slugs) {
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
      image {
        url
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

export type ComparedMotorcycle = DocumentType<typeof compareQuery>['compare'][number];
