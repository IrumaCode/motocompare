import { describe, expect, it } from 'vitest';
import { comparedMotorcycle, duke, mt07, z900 } from '../../test/fixtures';
import { bestFlags, METRICS, scores } from './comparison-metrics';

describe('bestFlags', () => {
  it('marks the highest value when more is better', () => {
    expect(bestFlags(METRICS.powerHp, [mt07, z900, duke])).toEqual([false, true, false]);
  });

  it('marks the lowest value when less is better', () => {
    expect(bestFlags(METRICS.weightKg, [mt07, z900, duke])).toEqual([false, false, true]);
  });

  it('marks every motorcycle tied for first', () => {
    const twin = comparedMotorcycle({ id: '9', slug: 'twin', powerHp: z900.powerHp });

    expect(bestFlags(METRICS.powerHp, [mt07, z900, twin])).toEqual([false, true, true]);
  });

  it('names no winner when all values are equal', () => {
    const sameWeight = comparedMotorcycle({ id: '9', slug: 'same', weightKg: mt07.weightKg });

    expect(bestFlags(METRICS.weightKg, [mt07, sameWeight])).toEqual([false, false]);
  });

  it('names no winner for metrics where neither direction is better', () => {
    expect(bestFlags(METRICS.seatHeightMm, [mt07, z900])).toEqual([false, false]);
  });

  it('ignores unknown values (a motorcycle without price)', () => {
    expect(bestFlags(METRICS.priceUsd, [mt07, z900, duke])).toEqual([true, false, false]);
  });
});

describe('scores', () => {
  it('gives the best motorcycle 1 and the others their ratio to it', () => {
    const [mt07Score, z900Score] = scores(METRICS.powerHp, [mt07, z900]);

    expect(z900Score).toBe(1);
    expect(mt07Score).toBeCloseTo(72.4 / 123.6);
  });

  it('inverts the ratio when less is better', () => {
    const [mt07Score, dukeScore] = scores(METRICS.weightKg, [mt07, duke]);

    expect(dukeScore).toBe(1);
    expect(mt07Score).toBeCloseTo(176 / 184);
  });

  it('returns null for unknown values and for metrics without direction', () => {
    expect(scores(METRICS.priceUsd, [mt07, duke])).toEqual([1, null]);
    expect(scores(METRICS.displacementCc, [mt07, z900])).toEqual([null, null]);
  });

  it('computes power-to-weight from power and weight', () => {
    expect(METRICS.powerToWeight.value(mt07)).toBeCloseTo(72.4 / 184);
  });
});
