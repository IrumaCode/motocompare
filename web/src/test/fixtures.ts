// Test data shaped like the API responses.
import type { ComparedMotorcycle } from '../features/comparison/compare-query';

/**
 * The generated types leave __typename out, but Apollo's cache asks for it in every query, so
 * mocked responses must include it. This type adds it to the motorcycle and its relations.
 */
export type MotorcycleMock = ComparedMotorcycle & {
  __typename: 'Motorcycle';
  brand: { __typename: 'Brand' };
  category: { __typename: 'Category' };
};

/** A complete motorcycle as the compare query returns it (a Yamaha MT-07). */
export function comparedMotorcycle(overrides: Partial<MotorcycleMock> = {}): MotorcycleMock {
  return {
    __typename: 'Motorcycle',
    id: '1',
    slug: 'yamaha-mt-07-2024',
    name: 'MT-07',
    year: 2024,
    priceUsd: 8199,
    priceCop: 32_796_000,
    displacementCc: 689,
    engineType: 'PARALLEL_TWIN',
    cooling: 'LIQUID',
    powerHp: 72.4,
    powerRpm: 8750,
    torqueNm: 67,
    torqueRpm: 6500,
    transmission: 'MANUAL',
    gears: 6,
    weightKg: 184,
    seatHeightMm: 805,
    fuelCapacityL: 14,
    image: null,
    brand: { __typename: 'Brand', id: '1', name: 'Yamaha' },
    category: { __typename: 'Category', id: '1', name: 'Naked' },
    ...overrides,
  };
}

export const mt07 = comparedMotorcycle();

export const z900 = comparedMotorcycle({
  id: '2',
  slug: 'kawasaki-z900-2024',
  name: 'Z900',
  priceUsd: 9899,
  powerHp: 123.6,
  torqueNm: 98.6,
  weightKg: 212,
  fuelCapacityL: 17,
  engineType: 'INLINE_FOUR',
  brand: { __typename: 'Brand', id: '3', name: 'Kawasaki' },
});

export const duke = comparedMotorcycle({
  id: '3',
  slug: 'ktm-390-duke-2024',
  name: '390 Duke',
  priceUsd: null,
  priceCop: null,
  powerHp: 44.3,
  torqueNm: 39,
  weightKg: 176,
  fuelCapacityL: 15,
  engineType: 'SINGLE',
  brand: { __typename: 'Brand', id: '4', name: 'KTM' },
});
