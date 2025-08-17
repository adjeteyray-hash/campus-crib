import { useState, useEffect, useCallback, useRef } from 'react';
import { PERFORMANCE_CONFIG, PerformanceUtils } from '../config/performance';

interface UseOptimizedDataOptions<T> {
  initialData?: T;
  cacheKey?: string;
  cacheTTL?: number;
  debounceMs?: number;
  retryAttempts?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseOptimizedDataReturn<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const getCachedData = <T>(key: string, ttl: number): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

const setCachedData = <T>(key: string, data: T, ttl: number): void => {
  cache.set(key, { data, timestamp: Date.now(), ttl });
  
  // Clean up old cache entries if cache is too large
  if (cache.size > 100) {
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    entries.slice(0, toRemove).forEach(([key]) => cache.delete(key));
  }
};

export function useOptimizedData<T>(
  fetcher: () => Promise<T>,
  options: UseOptimizedDataOptions<T> = {}
): UseOptimizedDataReturn<T> {
  const {
    initialData,
    cacheKey,
    cacheTTL = PERFORMANCE_CONFIG.CACHE.TTL,
    debounceMs = 300,
    retryAttempts = PERFORMANCE_CONFIG.NETWORK.RETRY_ATTEMPTS,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  // Debounced fetch function
  const debouncedFetch = useCallback(
    PerformanceUtils.debounce(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        // Check cache first
        if (cacheKey && PERFORMANCE_CONFIG.CACHE.ENABLED) {
          const cachedData = getCachedData<T>(cacheKey, cacheTTL);
          if (cachedData) {
            setData(cachedData);
            setLoading(false);
            onSuccess?.(cachedData);
            return;
          }
        }

        // Fetch data with timeout
        const timeoutId = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
        }, PERFORMANCE_CONFIG.NETWORK.TIMEOUT);

        const result = await PerformanceUtils.measureTime(
          () => fetcher(),
          `Data fetch for ${cacheKey || 'unknown'}`
        );

        clearTimeout(timeoutId);
        
        // Cache the result
        if (cacheKey && PERFORMANCE_CONFIG.CACHE.ENABLED) {
          setCachedData(cacheKey, result, cacheTTL);
        }

        setData(result);
        setLoading(false);
        retryCountRef.current = 0;
        onSuccess?.(result);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Request was aborted
        }

        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        setLoading(false);

        // Retry logic
        if (retryCountRef.current < retryAttempts) {
          retryCountRef.current++;
          setTimeout(() => {
            debouncedFetch();
          }, 1000 * retryCountRef.current); // Exponential backoff
        } else {
          retryCountRef.current = 0;
          onError?.(error);
        }
      }
    }, debounceMs),
    [fetcher, cacheKey, cacheTTL, retryAttempts, onSuccess, onError, debounceMs]
  );

  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await debouncedFetch();
  }, [debouncedFetch]);

  const clearCache = useCallback(() => {
    if (cacheKey) {
      cache.delete(cacheKey);
    }
  }, [cacheKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
  };
}
