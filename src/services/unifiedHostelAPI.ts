import { Hostel, HostelDetail, HostelSearchResult, HostelFilters } from '../types';
import { hostelAPIService } from './hostelAPI';
import { mockDataService } from './mockData';
import { API_CONFIG } from '../utils/constants';

/**
 * Unified Hostel API Service
 * Intelligently switches between real APIs and mock data based on availability
 */
class UnifiedHostelAPIService {
  private useMockAPI: boolean = false;
  private lastRealAPIAttempt: number = 0;
  private readonly REAL_API_RETRY_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Force mock API for development to avoid external API calls
    this.useMockAPI = true;
  }

  /**
   * Try to use real API, fallback to mock if it fails
   */
  private async tryRealAPI<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    // If we're configured to use mock API, skip real API attempt
    if (this.useMockAPI) {
      return fallback();
    }

    // Check if we should retry real API
    const now = Date.now();
    if (now - this.lastRealAPIAttempt < this.REAL_API_RETRY_INTERVAL) {
      return fallback();
    }

    try {
      this.lastRealAPIAttempt = now;
      const result = await operation();
      
      // If real API succeeds, disable mock mode
      this.useMockAPI = false;
      console.log('Real API working, switched from mock mode');
      
      return result;
    } catch (error) {
      console.warn('Real API failed, using mock data:', error);
      
      // Enable mock mode for future requests
      this.useMockAPI = true;
      
      // Try fallback
      try {
        return await fallback();
      } catch (fallbackError) {
        console.error('Both real API and mock API failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * Get all hostels with pagination
   */
  async getHostels(page = 1, limit = 20): Promise<{ hostels: Hostel[]; total: number; hasMore: boolean }> {
    return this.tryRealAPI(
      () => hostelAPIService.getHostels(page, limit),
      () => mockDataService.getHostels(page, limit)
    );
  }

  /**
   * Get hostel details by ID
   */
  async getHostelDetail(id: string): Promise<HostelDetail | null> {
    return this.tryRealAPI(
      () => hostelAPIService.getHostelDetail(id),
      () => mockDataService.getHostelDetail(id)
    );
  }

  /**
   * Search hostels with filters
   */
  async searchHostels(
    query: string,
    filters: HostelFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ hostels: HostelSearchResult[]; total: number; hasMore: boolean }> {
    return this.tryRealAPI(
      () => hostelAPIService.searchHostels(query, filters, page, limit),
      () => mockDataService.searchHostels(query, page, limit)
    );
  }

  /**
   * Get API status information
   */
  getAPIStatus(): { 
    currentMode: 'real' | 'mock'; 
    realAPI: { primary: boolean; fallbacks: Array<{ name: string; status: string }> };
    mockAPI: { primary: boolean; fallbacks: Array<{ name: string; status: string }> };
    lastRealAPIAttempt: number;
    nextRetryTime: number;
  } {
    return {
      currentMode: this.useMockAPI ? 'mock' : 'real',
      realAPI: hostelAPIService.getAPIStatus(),
             mockAPI: { primary: true, fallbacks: [] },
      lastRealAPIAttempt: this.lastRealAPIAttempt,
      nextRetryTime: this.lastRealAPIAttempt + this.REAL_API_RETRY_INTERVAL
    };
  }

  /**
   * Force switch to mock API mode
   */
  forceMockMode(): void {
    this.useMockAPI = true;
    this.lastRealAPIAttempt = 0;
    console.log('Forced switch to mock API mode');
  }

  /**
   * Force switch to real API mode
   */
  forceRealMode(): void {
    this.useMockAPI = false;
    this.lastRealAPIAttempt = 0;
    console.log('Forced switch to real API mode');
  }

  /**
   * Reset retry timer to try real API immediately
   */
  resetRetryTimer(): void {
    this.lastRealAPIAttempt = 0;
    console.log('Reset retry timer, will try real API on next request');
  }

  /**
   * Get cache statistics from both services
   */
  async getCacheStats(): Promise<{
    realAPI: { size: number; entries: string[] };
    mockAPI: { size: number; entries: string[] };
  }> {
    return {
      realAPI: hostelAPIService.getCacheStats(),
      mockAPI: { size: 0, entries: [] }
    };
  }

  /**
   * Clear cache from both services
   */
  async clearCache(): Promise<void> {
    await hostelAPIService.clearCache();
    console.log('Cleared cache from API service');
  }

  /**
   * Check if currently using mock API
   */
  isUsingMockAPI(): boolean {
    return this.useMockAPI;
  }

  /**
   * Get configuration information
   */
  getConfig(): {
    useMockAPI: boolean;
    realAPIRetryInterval: number;
    environment: string;
  } {
    return {
      useMockAPI: this.useMockAPI,
      realAPIRetryInterval: this.REAL_API_RETRY_INTERVAL,
      environment: process.env.NODE_ENV || 'unknown'
    };
  }
}

// Export singleton instance
export const unifiedHostelAPIService = new UnifiedHostelAPIService();

// Export the class for testing purposes
export { UnifiedHostelAPIService };
