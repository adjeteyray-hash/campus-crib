/**
 * Unit tests for HostelAPIService
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock fetch
global.fetch = jest.fn();

import { APIError, NetworkError, ValidationError } from '../../types/error';
import { hostelAPIService } from '../hostelAPI';

describe('HostelAPIService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    hostelAPIService.clearCache();
  });

  describe('Error Classes', () => {
    it('should create APIError correctly', () => {
      const error = new APIError('Test API error', 404);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test API error');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('API_ERROR');
    });

    it('should create NetworkError correctly', () => {
      const error = new NetworkError('Network failed', 500, false);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Network failed');
      expect(error.statusCode).toBe(500);
      expect(error.retryable).toBe(false);
      expect(error.code).toBe('NETWORK_ERROR');
    });

    it('should create ValidationError correctly', () => {
      const error = new ValidationError('Invalid input', 'email', 'invalid@');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Invalid input');
      expect(error.field).toBe('email');
      expect(error.value).toBe('invalid@');
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Service Methods', () => {
    it('should have all required methods', () => {
      expect(typeof hostelAPIService.getHostels).toBe('function');
      expect(typeof hostelAPIService.getHostelById).toBe('function');
      expect(typeof hostelAPIService.searchHostels).toBe('function');
      expect(typeof hostelAPIService.clearCache).toBe('function');
      expect(typeof hostelAPIService.getCacheStats).toBe('function');
    });
  });
});