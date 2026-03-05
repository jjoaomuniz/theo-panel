import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAPIOptions {
  /** Don't fetch on mount, wait for manual refetch */
  manual?: boolean;
  /** Polling interval in ms (0 = disabled) */
  pollInterval?: number;
}

interface UseAPIReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAPI<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  options: UseAPIOptions = {}
): UseAPIReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.manual);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      console.warn('[useAPI] Fetch failed, using fallback:', err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Use fallback data on error
        if (!data) {
          setData(fallback);
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, fallback]);

  // Fetch on mount (unless manual)
  useEffect(() => {
    mountedRef.current = true;
    if (!options.manual) {
      refetch();
    }
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Polling
  useEffect(() => {
    if (!options.pollInterval || options.pollInterval <= 0) return;
    const timer = setInterval(refetch, options.pollInterval);
    return () => clearInterval(timer);
  }, [options.pollInterval, refetch]);

  return { data: data ?? fallback, loading, error, refetch };
}
