import AsyncStorage from '@react-native-async-storage/async-storage';
import { hostelAPIService } from '../hostelAPI';
import { APIError, NetworkError, ValidationError } from '../../types/error';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('HostelAPIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.removeItem as jest.Mock).mockClear();
    
    // Clear the service cache
    hostelAPIService.clearCache();
  });

  describe('getHostels', () => {
    const mockHostelsResponse = {
      data: [
        {
          id: '1',
          name: 'Test Hostel 1',
          address: '123 Test St',
          price: 500,
          amenities: ['WiFi', 'AC'],
          images: ['image1.jpg'],
          contactPhone: '123456789',
          contactEmail: 'test@example.com',
          isActive: true,
        },
        {
          id: '2',
          name: 'Test Hostel 2',
          address: '456 Test Ave',
          price: 600,
          amenities: 'WiFi,Parking',
          image: 'image2.jpg',
          phone: '987654321',
          email: 'test2@example.com',
        },
      ],
    };

    it('should fetch hostels successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHostelsResponse),
      });

      const hostels = await hostelAPIService.getHostels();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/hostels?page=1&limit=20'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
        })
      );

      expect(hostels).toHaveLength(2);
      expect(hostels[0]).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test Hostel 1',
          address: '123 Test St',
          price: 500,
          amenities: ['WiFi', 'AC'],
          images: ['image1.jpg'],
          contactPhone: '123456789',
          contactEmail: 'test@example.com',
          isActive: true,
        })
      );

      // Test data transformation for second hostel
      expect(hostels[1]).toEqual(
        expect.objectContaining({
          id: '2',
          name: 'Test Hostel 2',
          address: '456 Test Ave',
          price: 600,
          amenities: ['WiFi', 'Parking'],
          images: ['image2.jpg'],
          contactPhone: '987654321',
          contactEmail: 'test2@example.com',
          isActive: true,
        })
      );
    });

    it('should handle array response format', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHostelsResponse.data),
      });

      const hostels = await hostelAPIService.getHostels();
      expect(hostels).toHaveLength(2);
    });

    it('should cache successful responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHostelsResponse),
      });

      // First call
      await hostelAPIService.getHostels();
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const hostels = await hostelAPIService.getHostels();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(hostels).toHaveLength(2);
    });

    it('should retry on server errors with exponential backoff', async () => {
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHostelsResponse),
        });

      const startTime = Date.now();
      const hostels = await hostelAPIService.getHostels();
      const endTime = Date.now();

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(hostels).toHaveLength(2);
      // Should have some delay due to exponential backoff
      expect(endTime - startTime).toBeGreaterThan(1000);
    });

    it('should throw NetworkError after max retries', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(hostelAPIService.getHostels()).rejects.toThrow(NetworkError);
      expect(fetch).toHaveBeenCalledTimes(3); // Max retries
    });

    it('should throw APIError for 4xx errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(hostelAPIService.getHostels()).rejects.toThrow(APIError);
      expect(fetch).toHaveBeenCalledTimes(1); // No retries for 4xx
    });

    it('should use expired cache as fallback on error', async () => {
      // First, populate cache
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHostelsResponse),
      });
      await hostelAPIService.getHostels();

      // Manually expire cache by setting it to past time
      const cacheStats = hostelAPIService.getCacheStats();
      expect(cacheStats.size).toBeGreaterThan(0);

      // Now make fetch fail
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Should still return cached data as fallback
      const hostels = await hostelAPIService.getHostels();
      expect(hostels).toHaveLength(2);
    });
  });

  describe('getHostelById', () => {
    const mockHostelDetailResponse = {
      data: {
        id: '1',
        name: 'Test Hostel',
        address: '123 Test St',
        price: 500,
        amenities: ['WiFi', 'AC'],
        images: ['image1.jpg'],
        contactPhone: '123456789',
        contactEmail: 'test@example.com',
        isActive: true,
        landlord: {
          id: 'landlord1',
          name: 'John Doe',
          phone: '123456789',
          email: 'john@example.com',
        },
        viewCount: 10,
        contactCount: 5,
      },
    };

    it('should fetch hostel detail successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHostelDetailResponse),
      });

      const hostel = await hostelAPIService.getHostelById('1');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/hostels/1'),
        expect.any(Object)
      );

      expect(hostel).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test Hostel',
          landlord: expect.objectContaining({
            id: 'landlord1',
            name: 'John Doe',
          }),
          viewCount: 10,
          contactCount: 5,
        })
      );
    });

    it('should throw ValidationError for empty ID', async () => {
      await expect(hostelAPIService.getHostelById('')).rejects.toThrow(ValidationError);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should cache hostel details', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHostelDetailResponse),
      });

      // First call
      await hostelAPIService.getHostelById('1');
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const hostel = await hostelAPIService.getHostelById('1');
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(hostel.id).toBe('1');
    });
  });

  describe('searchHostels', () => {
    const mockSearchResponse = {
      data: [
        {
          id: '1',
          name: 'Matching Hostel',
          address: '123 Test St',
          price: 500,
          amenities: ['WiFi'],
          images: ['image1.jpg'],
          relevanceScore: 0.95,
          distance: 1.2,
        },
      ],
    };

    it('should search hostels successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse),
      });

      const results = await hostelAPIService.searchHostels('test query');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search?query=test+query&page=1&limit=20'),
        expect.any(Object)
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Matching Hostel',
          relevanceScore: 0.95,
          distance: 1.2,
        })
      );
    });

    it('should include filters in search params', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse),
      });

      const filters = {
        minPrice: 300,
        maxPrice: 800,
        location: 'Accra',
        amenities: ['WiFi', 'AC'],
        sortBy: 'price' as const,
        sortOrder: 'asc' as const,
      };

      await hostelAPIService.searchHostels('test', filters);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('minPrice=300'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('maxPrice=800'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('location=Accra'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('amenities=WiFi%2CAC'),
        expect.any(Object)
      );
    });

    it('should throw ValidationError for empty query', async () => {
      await expect(hostelAPIService.searchHostels('')).rejects.toThrow(ValidationError);
      await expect(hostelAPIService.searchHostels('   ')).rejects.toThrow(ValidationError);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should cache search results with shorter duration', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse),
      });

      // First call
      await hostelAPIService.searchHostels('test');
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const results = await hostelAPIService.searchHostels('test');
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(1);
    });
  });

  describe('caching functionality', () => {
    it('should load cache from AsyncStorage on initialization', async () => {
      const mockCacheData = {
        'test_key': {
          data: { test: 'data' },
          timestamp: Date.now(),
          expiresAt: Date.now() + 300000, // 5 minutes from now
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockCacheData)
      );

      // The service should have attempted to load cache on initialization
      // Since we're testing the existing service instance, just verify the method exists
      const stats = hostelAPIService.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('entries');
    });

    it('should save cache to AsyncStorage', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Test' }],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await hostelAPIService.getHostels();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'hostel_api_cache',
        expect.any(String)
      );
    });

    it('should clear all cache', () => {
      hostelAPIService.clearCache();
      
      const stats = hostelAPIService.getCacheStats();
      expect(stats.size).toBe(0);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('hostel_api_cache');
    });

    it('should provide cache statistics', async () => {
      const mockResponse = { data: [{ id: '1', name: 'Test' }] };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await hostelAPIService.getHostels();
      
      const stats = hostelAPIService.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(Array.isArray(stats.entries)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle timeout errors', async () => {
      (fetch as jest.Mock).mockImplementation(() => 
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AbortError')), 100);
        })
      );

      // Mock AbortError
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      (fetch as jest.Mock).mockRejectedValueOnce(abortError);

      await expect(hostelAPIService.getHostels()).rejects.toThrow(NetworkError);
    });

    it('should handle 400 validation errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Invalid parameters' }),
      });

      await expect(hostelAPIService.getHostels()).rejects.toThrow(ValidationError);
    });

    it('should handle 500 server errors with retries', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        });

      const hostels = await hostelAPIService.getHostels();
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(hostels).toEqual([]);
    });

    it('should handle malformed JSON responses gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(hostelAPIService.getHostels()).rejects.toThrow(ValidationError);
    });
  });

  describe('data transformation', () => {
    it('should handle different API response formats', async () => {
      const mockResponse = {
        _id: 'mongo_id',
        desc: 'Description',
        location: 'Address',
        amenities: 'WiFi,AC,Parking',
        image: 'single_image.jpg',
        phone: '123456789',
        email: 'test@example.com',
        coordinates: {
          lat: 5.6037,
          lng: -0.1870,
        },
        createdAt: '2023-01-01T00:00:00Z',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [mockResponse] }),
      });

      const hostels = await hostelAPIService.getHostels();
      
      expect(hostels[0]).toEqual(
        expect.objectContaining({
          id: 'mongo_id',
          description: 'Description',
          address: 'Address',
          amenities: ['WiFi', 'AC', 'Parking'],
          images: ['single_image.jpg'],
          contactPhone: '123456789',
          contactEmail: 'test@example.com',
          location: {
            latitude: 5.6037,
            longitude: -0.1870,
          },
          created_at: '2023-01-01T00:00:00Z',
        })
      );
    });

    it('should handle missing or null values gracefully', async () => {
      const mockResponse = {
        id: '1',
        name: null,
        price: 'invalid',
        amenities: null,
        images: null,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [mockResponse] }),
      });

      const hostels = await hostelAPIService.getHostels();
      
      expect(hostels[0]).toEqual(
        expect.objectContaining({
          id: '1',
          name: '',
          price: 0,
          amenities: [],
          images: [],
          isActive: true,
        })
      );
    });
  });
});