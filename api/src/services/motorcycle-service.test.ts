import { describe, expect, it } from 'vitest';
import { InputError } from '../errors.js';
import { createFakeMotorcycleRepository, motorcycleFixture } from '../test/fakes.js';
import { createMotorcycleService, percentileBelow } from './motorcycle-service.js';

const mt07 = motorcycleFixture();
const z900 = motorcycleFixture({ id: 2, slug: 'kawasaki-z900-2024', name: 'Z900', powerHp: 123.6 });
const duke = motorcycleFixture({
  id: 3,
  slug: 'ktm-390-duke-2024',
  name: '390 Duke',
  powerHp: 44.3,
});

const NAME_ASC = { field: 'NAME', direction: 'ASC' } as const;

function serviceWith(motorcycles = [mt07, z900, duke]) {
  const repository = createFakeMotorcycleRepository(motorcycles);
  return { service: createMotorcycleService(repository), repository };
}

describe('percentileBelow', () => {
  it('gives 100 to the single most powerful motorcycle', () => {
    expect(percentileBelow([10, 20, 30], 30)).toBe(100);
  });

  it('gives 0 to the least powerful motorcycle', () => {
    expect(percentileBelow([10, 20, 30], 10)).toBe(0);
  });

  it('does not count a tie as "less powerful"', () => {
    // Two motorcycles share the top power: each beats 1 of the 2 others
    expect(percentileBelow([10, 30, 30], 30)).toBe(50);
  });

  it('gives 100 when the catalog has a single motorcycle', () => {
    expect(percentileBelow([42], 42)).toBe(100);
  });
});

describe('MotorcycleService.search', () => {
  it('turns page and pageSize into skip and take', async () => {
    const { service, repository } = serviceWith();

    const page = await service.search({ sort: NAME_ASC, page: 2, pageSize: 2 });

    expect(repository.queries[0]).toMatchObject({ skip: 2, take: 2 });
    expect(page).toMatchObject({ page: 2, pageSize: 2, totalCount: 3 });
    expect(page.items.map((m) => m.slug)).toEqual(['ktm-390-duke-2024']);
  });

  it('clamps pageSize to 50', async () => {
    const { service, repository } = serviceWith();

    const page = await service.search({ sort: NAME_ASC, page: 1, pageSize: 500 });

    expect(repository.queries[0]?.take).toBe(50);
    expect(page.pageSize).toBe(50);
  });

  it('rejects a page or pageSize below 1', async () => {
    const { service } = serviceWith();

    await expect(service.search({ sort: NAME_ASC, page: 0, pageSize: 12 })).rejects.toThrow(
      InputError,
    );
    await expect(service.search({ sort: NAME_ASC, page: 1, pageSize: 0 })).rejects.toThrow(
      InputError,
    );
  });

  it('rejects a range whose min is greater than its max', async () => {
    const { service } = serviceWith();
    const filter = { priceUsd: { min: 9000, max: 5000 } };

    await expect(service.search({ filter, sort: NAME_ASC, page: 1, pageSize: 12 })).rejects.toThrow(
      'priceUsd: min (9000) cannot be greater than max (5000)',
    );
  });
});

describe('MotorcycleService.compare', () => {
  it('returns the motorcycles in the requested order', async () => {
    const { service } = serviceWith();

    const compared = await service.compare(['ktm-390-duke-2024', 'yamaha-mt-07-2024']);

    expect(compared.map((m) => m.slug)).toEqual(['ktm-390-duke-2024', 'yamaha-mt-07-2024']);
  });

  it.each([
    ['one motorcycle', ['yamaha-mt-07-2024']],
    ['five motorcycles', ['a', 'b', 'c', 'd', 'e']],
  ])('rejects %s', async (_case, slugs) => {
    const { service } = serviceWith();

    await expect(service.compare(slugs)).rejects.toThrow('between 2 and 4 motorcycles');
  });

  it('rejects repeated slugs', async () => {
    const { service } = serviceWith();

    await expect(service.compare(['yamaha-mt-07-2024', 'yamaha-mt-07-2024'])).rejects.toThrow(
      'must be distinct',
    );
  });

  it('names the slugs that do not exist', async () => {
    const { service } = serviceWith();

    await expect(service.compare(['yamaha-mt-07-2024', 'nope', 'nada'])).rejects.toThrow(
      'Unknown motorcycles: nope, nada',
    );
  });
});

describe('MotorcycleService.powerPercentiles', () => {
  it('computes one percentile per requested power against the whole catalog', async () => {
    const { service } = serviceWith();

    expect(await service.powerPercentiles([123.6, 44.3])).toEqual([100, 0]);
  });
});
