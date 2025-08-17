/**
 * API Configuration
 * Centralized configuration for all API-related settings
 */

export interface APIConfig {
  // Primary API Configuration
  primary: {
    baseUrl: string;
    endpoints: Record<string, string>;
    headers: Record<string, string>;
    timeout: number;
    maxRetries: number;
    retryDelay: number;
  };
  
  // Fallback APIs
  fallbacks: Array<{
    name: string;
    baseUrl: string;
    endpoints: Record<string, string>;
    headers: Record<string, string>;
    priority: number;
  }>;
  
  // Mock API Configuration
  mock: {
    enabled: boolean;
    delayRange: [number, number]; // [min, max] in milliseconds
  };
  
  // Cache Configuration
  cache: {
    duration: number; // in milliseconds
    maxSize: number;
    cleanupInterval: number; // in milliseconds
  };
  
  // Environment-specific settings
  environment: {
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
  };
}

/**
 * Default API configuration
 */
export const defaultAPIConfig: APIConfig = {
  primary: {
    baseUrl: 'https://api.housemates.io/v1',
    endpoints: {
      HOSTELS: '/accommodations',
      SEARCH: '/search',
      DETAILS: '/accommodations',
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 1000,
  },
  
  fallbacks: [
    {
      name: 'Housemates Fallback',
      baseUrl: 'https://api.housemates.io/v1',
      endpoints: {
        HOSTELS: '/accommodations',
        SEARCH: '/search',
        DETAILS: '/accommodations',
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      priority: 1,
    },
    {
      name: 'Mock API',
      baseUrl: 'https://mockapi.io/projects/your-project-id',
      endpoints: {
        HOSTELS: '/hostels',
        SEARCH: '/search',
        DETAILS: '/hostels',
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      priority: 2,
    },
  ],
  
  mock: {
    enabled: process.env.NODE_ENV === 'development' || 
             process.env.EXPO_PUBLIC_USE_MOCK_API === 'true',
    delayRange: [100, 500], // 100ms to 500ms
  },
  
  cache: {
    duration: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
    cleanupInterval: 10 * 60 * 1000, // 10 minutes
  },
  
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },
};

/**
 * Get API configuration based on environment
 */
export function getAPIConfig(): APIConfig {
  // In production, you might want to fetch this from a remote config service
  if (process.env.NODE_ENV === 'production') {
    return {
      ...defaultAPIConfig,
      mock: {
        ...defaultAPIConfig.mock,
        enabled: false, // Disable mock in production
      },
      cache: {
        ...defaultAPIConfig.cache,
        duration: 15 * 60 * 1000, // Longer cache in production
      },
    };
  }
  
  return defaultAPIConfig;
}

/**
 * Get environment-specific API settings
 */
export function getEnvironmentAPISettings() {
  const config = getAPIConfig();
  
  return {
    useMockAPI: config.mock.enabled,
    isDevelopment: config.environment.isDevelopment,
    isProduction: config.environment.isProduction,
    cacheEnabled: true,
    retryEnabled: true,
    loggingEnabled: config.environment.isDevelopment,
  };
}

/**
 * Validate API configuration
 */
export function validateAPIConfig(config: APIConfig): string[] {
  const errors: string[] = [];
  
  if (!config.primary.baseUrl) {
    errors.push('Primary API base URL is required');
  }
  
  if (!config.primary.endpoints.HOSTELS) {
    errors.push('Hostels endpoint is required');
  }
  
  if (config.primary.timeout <= 0) {
    errors.push('API timeout must be greater than 0');
  }
  
  if (config.primary.maxRetries < 0) {
    errors.push('Max retries cannot be negative');
  }
  
  if (config.cache.duration <= 0) {
    errors.push('Cache duration must be greater than 0');
  }
  
  return errors;
}

/**
 * Get API health check configuration
 */
export function getAPIHealthCheckConfig() {
  return {
    enabled: true,
    interval: 5 * 60 * 1000, // Check every 5 minutes
    timeout: 5000, // 5 second timeout for health checks
    endpoints: ['/health', '/status', '/ping'],
  };
}
