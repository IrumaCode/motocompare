import { useEffect, useState } from 'react';

// Short enough to reassure on a cold start, long enough not to flash on normal loads
const DEFAULT_THRESHOLD_MS = 3_000;

/**
 * True once `isLoading` has lasted longer than `thresholdMs`. Used to explain long waits
 * (the free-tier API and database sleep when idle and need a while to wake up).
 */
export function useSlowLoading(isLoading: boolean, thresholdMs = DEFAULT_THRESHOLD_MS): boolean {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      return;
    }
    const timer = setTimeout(() => {
      setIsSlow(true);
    }, thresholdMs);
    return () => {
      clearTimeout(timer);
      setIsSlow(false);
    };
  }, [isLoading, thresholdMs]);

  return isLoading && isSlow;
}
