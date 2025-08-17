import { APIError, NetworkError, ValidationError } from '../../types/error';
import { hostelAPIService } from '../hostelAPI';

// Mock fetch globally
global.fetch = jest.fn();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('HostelAPIService Basic Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    hostelAPIService.clearCache();
  });

  describe('Error Classes', () => {
    it('should create APIError correctly', () => {
      const error = new APIError('Test error', 404);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('API_ERROR');
    });

    it('should create NetworkError correctly', () => {
      const error = new NetworkError('Network failed');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Network failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.retryable).toBe(true);
    });

    it('should create ValidationError correctly', () => {
      const error = new ValidationError('Invalid input', 'email');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Invalid input');
      expect(error.field).toBe('email');
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Basic API Methods', () => {
    it('should have getHostels method', () => {
      expect(typeof hostelAPIService.getHostels).toBe('function');
    });

    it('should have getHostelById method', () => {
      expect(typeof hostelAPIService.getHostelById).toBe('function');
    });

    it('should have searchHostels method', () => {
      expect(typeof hostelAPIService.searchHostels).toBe('function');
    });

    it('should have clearCache method', () => {
      expect(typeof hostelAPIService.clearCache).toBe('function');
    });

    it('should have getCacheStats method', () => {
      expect(typeof hostelAPIService.getCacheStats).toBe('function');
    });
  });

  describe('Validation', () => {
    it('should throw ValidationError for empty hostel ID', async () => {
      await expect(hostelAPIService.getHostelById('')).rejects.toThrow(ValidationError);
      await expect(hostelAPIService.getHostelById(null as any)).rejects.toThrow(ValidationError);
      await expect(hostelAPIService.getHostelById(undefined as any)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty search query', async () => {
      await expect(hostelAPIService.searchHostels('')).rejects.toThrow(ValidationError);
      await expect(hostelAPIService.searchHostels('   ')).rejects.toThrow(ValidationError);
    });
  });

  describe('Cache Management', () => {
    it('should clear cache successfully', () => {
      expect(() => hostelAPIService.clearCache()).not.toThrow();
    });

    it('should return cache stats', () => {
      const stats = hostelAPIService.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('entries');
      expect(typeof stats.size).toBe('number');
      expect(Array.isArray(stats.entries)).toBe(true);
    });
  });

  describe('Data Transformation', () => {
    it('should handle successful API response', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            name: 'Test Hostel',
            address: '123 Test St',
            price: 500,
            amenities: ['WiFi', 'AC'],
            images: ['image1.jpg'],
            contactPhone: '123456789',
            contactEmail: 'test@example.com',
            isActive: true,
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const hostels = await hostelAPIService.getHostels();

      expect(Array.isArray(hostels)).toBe(true);
      expect(hostels).toHaveLength(1);
      expect(hostels[0]).toHaveProperty('id', '1');
      expect(hostels[0]).toHaveProperty('name', 'Test Hostel');
      expect(hostels[0]).toHaveProperty('price', 500);
    });

    it('should handle alternative data formats', async () => {
      const mockResponse = {
        _id: 'mongo_id',
        desc: 'Description',
        location: 'Address',
        amenities: 'WiFi,AC',
        image: 'single_image.jpg',
        phone: '123456789',
        email: 'test@example.com',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [mockResponse] }),
      });

      const hostels = await hostelAPIService.getHostels();

      expect(hostels[0]).toHaveProperty('id', 'mongo_id');
      expect(hostels[0]).toHaveProperty('description', 'Description');
      expect(hostels[0]).toHaveProperty('address', 'Address');
      expect(hostels[0]).toHaveProperty('amenities', ['WiFi', 'AC']);
      expect(hostels[0]).toHaveProperty('images', ['single_image.jpg']);
      expect(hostels[0]).toHaveProperty('contactPhone', '123456789');
      expect(hostels[0]).toHaveProperty('contactEmail', 'test@example.com');
    });
  });

  describe('Error Handling', () => {
    it('should throw NetworkError on fetch failure', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(hostelAPIService.getHostels()).rejects.toThrow(NetworkError);
    });

    it('should throw APIError on 404', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(hostelAPIService.getHostels()).rejects.toThrow(APIError);
    });

    it('should throw ValidationError on 400', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Bad Request' }),
      });

      await expect(hostelAPIService.getHostels()).rejects.toThrow(ValidationError);
    });
  });
});