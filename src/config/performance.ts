// Performance configuration for the app
export const PERFORMANCE_CONFIG = {
  // Enable/disable performance monitoring
  ENABLE_PERFORMANCE_MONITORING: __DEV__,
  
  // Lazy loading settings
  LAZY_LOADING: {
    ENABLED: true,
    TIMEOUT: 5000, // 5 seconds timeout for lazy loading
  },
  
  // Image optimization
  IMAGE_OPTIMIZATION: {
    ENABLED: true,
    QUALITY: 0.8,
    MAX_WIDTH: 1024,
    MAX_HEIGHT: 1024,
  },
  
  // Bundle optimization
  BUNDLE_OPTIMIZATION: {
    TREE_SHAKING: true,
    CODE_SPLITTING: true,
    MINIFICATION: true,
  },
  
  // Cache settings
  CACHE: {
    ENABLED: true,
    TTL: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
  },
  
  // Network optimization
  NETWORK: {
    RETRY_ATTEMPTS: 3,
    TIMEOUT: 10000, // 10 seconds
    CACHE_STRATEGY: 'stale-while-revalidate',
  },
};

// Performance monitoring utilities
export const PerformanceUtils = {
  // Measure function execution time
  measureTime: <T>(fn: () => T, label: string): T => {
    if (!PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_MONITORING) {
      return fn();
    }
    
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },
  
  // Debounce function calls
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
  
  // Throttle function calls
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};
