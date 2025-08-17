import {
  createNetworkError,
  createAuthError,
  createValidationError,
  createDatabaseError,
  createAPIError,
  isRetryableError,
  getErrorMessage,
  withRetry,
  withNetworkRetry,
  withGracefulDegradation,
} from '../errorHandling';
import {
  NetworkError,
  AuthError,
  ValidationError,
  DatabaseError,
  APIError,
} from '../../types/error';

describe('Error Handling Utils', () => {
  describe('Error Factory Functions', () => {
    it('creates NetworkError correctly', () => {
      const error = createNetworkError('Network failed', 500, true);
      
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toBe('Network failed');
      expect(error.statusCode).toBe(500);
      expect(error.retryable).toBe(true);
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.name).toBe('NetworkError');
    });

    it('creates AuthError correctly', () => {
      const error = createAuthError('Invalid credentials', 'INVALID_CREDENTIALS');
      
      expect(error).toBeInstanceOf(AuthError);
      expect(error.message).toBe('Invalid credentials');
      expect(error.type).toBe('INVALID_CREDENTIALS');
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.name).toBe('AuthError');
    });

    it('creates ValidationError correctly', () => {
      const error = createValidationError('Invalid email', 'email', 'invalid-email');
      
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid email');
      expect(error.field).toBe('email');
      expect(error.value).toBe('invalid-email');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('creates DatabaseError correctly', () => {
      const error = createDatabaseError('Query failed', 'READ', 'users');
      
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.message).toBe('Query failed');
      expect(error.operation).toBe('READ');
      expect(error.table).toBe('users');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.name).toBe('DatabaseError');
    });

    it('creates APIError correctly', () => {
      const error = createAPIError('API failed', 404, '/api/users', 'GET');
      
      expect(error).toBeInstanceOf(APIError);
      expect(error.message).toBe('API failed');
      expect(error.endpoint).toBe('/api/users');
      expect(error.method).toBe('GET');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('API_ERROR');
      expect(error.name).toBe('APIError');
    });
  });

  describe('isRetryableError', () => {
    it('returns true for retryable NetworkError', () => {
      const error = createNetworkError('Network failed', 500, true);
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns false for non-retryable NetworkError', () => {
      const error = createNetworkError('Network failed', 400, false);
      expect(isRetryableError(error)).toBe(false);
    });

    it('returns true for 5xx API errors', () => {
      const error = createAPIError('Server error', 500, '/api/test', 'GET');
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns false for 4xx API errors (except specific ones)', () => {
      const error = createAPIError('Not found', 404, '/api/test', 'GET');
      expect(isRetryableError(error)).toBe(false);
    });

    it('returns true for specific 4xx errors', () => {
      const error408 = createAPIError('Timeout', 408, '/api/test', 'GET');
      const error429 = createAPIError('Rate limited', 429, '/api/test', 'GET');
      expect(isRetryableError(error408)).toBe(true);
      expect(isRetryableError(error429)).toBe(true);
    });

    it('returns false for other error types', () => {
      const authError = createAuthError('Unauthorized', 'UNAUTHORIZED');
      const validationError = createValidationError('Invalid input', 'field');
      
      expect(isRetryableError(authError)).toBe(false);
      expect(isRetryableError(validationError)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('returns network error message', () => {
      const error = createNetworkError('Network failed');
      expect(getErrorMessage(error)).toBe('Network connection failed. Please check your internet connection.');
    });

    it('returns auth error messages based on type', () => {
      const invalidCreds = createAuthError('Invalid', 'INVALID_CREDENTIALS');
      const tokenExpired = createAuthError('Expired', 'TOKEN_EXPIRED');
      const unauthorized = createAuthError('Unauthorized', 'UNAUTHORIZED');
      const signupFailed = createAuthError('Signup failed', 'SIGNUP_FAILED');
      
      expect(getErrorMessage(invalidCreds)).toBe('Invalid email or password. Please try again.');
      expect(getErrorMessage(tokenExpired)).toBe('Your session has expired. Please log in again.');
      expect(getErrorMessage(unauthorized)).toBe('You are not authorized to perform this action.');
      expect(getErrorMessage(signupFailed)).toBe('Account creation failed. Please try again.');
    });

    it('returns validation error message', () => {
      const error = createValidationError('Field is required', 'email');
      expect(getErrorMessage(error)).toBe('Field is required');
    });

    it('returns database error message', () => {
      const error = createDatabaseError('Query failed', 'READ');
      expect(getErrorMessage(error)).toBe('A database error occurred. Please try again later.');
    });

    it('returns API error message', () => {
      const error = createAPIError('API failed', 500, '/api/test', 'GET');
      expect(getErrorMessage(error)).toBe('Service temporarily unavailable. Please try again later.');
    });

    it('returns default message for unknown errors', () => {
      const error = { code: 'UNKNOWN', message: 'Unknown error', timestamp: new Date() };
      expect(getErrorMessage(error)).toBe('Unknown error');
    });
  });

  describe('withRetry', () => {
    it('succeeds on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withRetry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('retries on retryable error', async () => {
      const error = createNetworkError('Network failed', 500, true);
      const operation = jest.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');
      
      const result = await withRetry(operation, { maxRetries: 1, baseDelay: 10 });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('does not retry non-retryable error', async () => {
      const error = createNetworkError('Network failed', 400, false);
      const operation = jest.fn().mockRejectedValue(error);
      
      await expect(withRetry(operation)).rejects.toBe(error);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('throws after max retries', async () => {
      const error = createNetworkError('Network failed', 500, true);
      const operation = jest.fn().mockRejectedValue(error);
      
      await expect(withRetry(operation, { maxRetries: 2, baseDelay: 10 })).rejects.toBe(error);
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('withGracefulDegradation', () => {
    it('returns operation result when successful', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const fallback = jest.fn().mockReturnValue('fallback');
      
      const result = await withGracefulDegradation(operation, fallback);
      
      expect(result).toBe('success');
      expect(fallback).not.toHaveBeenCalled();
    });

    it('uses fallback for network errors', async () => {
      const error = createNetworkError('Network failed');
      const operation = jest.fn().mockRejectedValue(error);
      const fallback = jest.fn().mockReturnValue('fallback');
      
      const result = await withGracefulDegradation(operation, fallback);
      
      expect(result).toBe('fallback');
      expect(fallback).toHaveBeenCalled();
    });

    it('uses custom shouldUseFallback condition', async () => {
      const error = createAuthError('Unauthorized', 'UNAUTHORIZED');
      const operation = jest.fn().mockRejectedValue(error);
      const fallback = jest.fn().mockReturnValue('fallback');
      const shouldUseFallback = jest.fn().mockReturnValue(true);
      
      const result = await withGracefulDegradation(operation, fallback, shouldUseFallback);
      
      expect(result).toBe('fallback');
      expect(shouldUseFallback).toHaveBeenCalledWith(error);
    });

    it('throws error when shouldUseFallback returns false', async () => {
      const error = createAuthError('Unauthorized', 'UNAUTHORIZED');
      const operation = jest.fn().mockRejectedValue(error);
      const fallback = jest.fn().mockReturnValue('fallback');
      const shouldUseFallback = jest.fn().mockReturnValue(false);
      
      await expect(withGracefulDegradation(operation, fallback, shouldUseFallback)).rejects.toBe(error);
      expect(fallback).not.toHaveBeenCalled();
    });
  });
});