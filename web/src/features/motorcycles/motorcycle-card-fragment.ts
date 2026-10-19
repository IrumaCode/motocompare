import { graphql } from '../../generated/graphql';

// Fields MotorcycleCard needs. Queries that render cards spread `...MotorcycleCard`,
// so the card's data requirements live next to the card, not in every page.
// It is a .ts file because react-refresh only allows components to be exported from .tsx files.
export const motorcycleCardFragment = graphql(`
  fragment MotorcycleCard on Motorcycle {
    id
    name
    year
    displacementCc
    powerHp
    priceUsd
    priceCop
    brand {
      id
      name
    }
    category {
      id
      name
    }
  }
`);
