import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSlowLoading } from './use-slow-loading';

describe('useSlowLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('turns true only after the load has lasted the threshold', () => {
    const { result } = renderHook(() => useSlowLoading(true, 3000));

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);
  });

  it('turns false again as soon as loading ends', () => {
    const { result, rerender } = renderHook(({ loading }) => useSlowLoading(loading, 3000), {
      initialProps: { loading: true },
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    rerender({ loading: false });

    expect(result.current).toBe(false);
  });
});
