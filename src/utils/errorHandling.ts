import {
  AppError,
  NetworkError,
  AuthError,
  ValidationError,
  DatabaseError,
  APIError,
  RetryConfig
} from '../types/error';
import NetInfo from '@react-native-community/netinfo';

// Error factory functions
export const createNetworkError = (
  message: string,
  statusCode?: number,
  retryable: boolean = true
): NetworkError => {
  return new NetworkError(message, statusCode, retryable);
};

export const createAuthError = (
  message: string,
  type: AuthError['type']
): AuthError => {
  return new AuthError(message, type);
};

export const createValidationError = (
  message: string,
  field?: string,
  value?: any
): ValidationError => {
  return new ValidationError(message, field, value);
};

export const createDatabaseError = (
  message: string,
  operation: DatabaseError['operation'],
  table?: string
): DatabaseError => {
  return new DatabaseError(message, operation, table);
};

export const createAPIError = (
  message: string,
  statusCode?: number,
  endpoint?: string,
  method?: APIError['method']
): APIError => {
  return new APIError(message, statusCode, endpoint, method);
};

// Error handling utilities
export const isRetryableError = (error: AppError): boolean => {
  if (error instanceof NetworkError) {
    return error.retryable;
  }

  if (error instanceof APIError) {
    // Retry on 5xx errors and some 4xx errors
    return !error.statusCode ||
      error.statusCode >= 500 ||
      error.statusCode === 408 ||
      error.statusCode === 429;
  }

  return false;
};

export const getErrorMessage = (error: AppError): string => {
  if (error instanceof NetworkError) {
    return 'Network connection failed. Please check your internet connection.';
  }

  if (error instanceof AuthError) {
    switch (error.type) {
      case 'INVALID_CREDENTIALS':
        return 'Invalid email or password. Please try again.';
      case 'TOKEN_EXPIRED':
        return 'Your session has expired. Please log in again.';
      case 'UNAUTHORIZED':
        return 'You are not authorized to perform this action.';
      case 'SIGNUP_FAILED':
        return 'Account creation failed. Please try again.';
      default:
        return error.message;
    }
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof DatabaseError) {
    return 'A database error occurred. Please try again later.';
  }

  if (error instanceof APIError) {
    return 'Service temporarily unavailable. Please try again later.';
  }

  return error.message || 'An unexpected error occurred.';
};

// Retry logic with exponential backoff
export const withRetry = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const defaultConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  let lastError: AppError;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as AppError;

      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === finalConfig.maxRetries || !isRetryableError(lastError)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffFactor, attempt),
        finalConfig.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }

  throw lastError!;
};

// Network-aware retry logic
export const withNetworkRetry = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  
  const defaultConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  return withRetry(async () => {
    // Check network connectivity before attempting operation
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw createNetworkError('No internet connection', undefined, true);
    }
    
    return operation();
  }, finalConfig);
};

// Graceful degradation helper
export const withGracefulDegradation = async <T>(
  operation: () => Promise<T>,
  fallback: () => T,
  shouldUseFallback?: (error: AppError) => boolean
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const appError = error as AppError;
    
    // Use fallback if specified condition is met or for network errors
    if (shouldUseFallback ? shouldUseFallback(appError) : appError instanceof NetworkError) {
      logError(appError, { fallbackUsed: true });
      return fallback();
    }
    
    throw appError;
  }
};

// Error logging utility
export const logError = (error: AppError, context?: Record<string, any>) => {
  const errorLog = {
    ...error,
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' && window.location ? window.location.href : 'unknown',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  };

  // In development, log to console with full details
  if (__DEV__) {
    console.group('🚨 App Error Details');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Context:', context);
    console.error('Full Log:', errorLog);
    console.groupEnd();
  }

  // In production, send to error tracking service
  // This would integrate with services like Sentry, Bugsnag, etc.
  // crashlytics().recordError(error);
};

// Error boundary helper
export const handleErrorBoundary = (error: Error, errorInfo: any) => {
  const appError: AppError = {
    code: 'RUNTIME_ERROR',
    message: error.message,
    details: error.stack,
    timestamp: new Date(),
    context: errorInfo,
  };

  logError(appError);
  return appError;
};