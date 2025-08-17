import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hostel, HostelDetail, HostelSearchResult, HostelFilters } from '../types';
import { 
  HOSTEL_API_BASE_URL, 
  API_ENDPOINTS, 
  ALTERNATIVE_APIS, 
  API_CONFIG 
} from '../utils/constants';
import { APIError, NetworkError, ValidationError } from '../types/error';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface APIProvider {
  name: string;
  baseUrl: string;
  endpoints: Record<string, string>;
  headers: Record<string, string>;
  isActive: boolean;
  lastError?: string;
  lastErrorTime?: number;
}

class HostelAPIService {
  private primaryAPI: APIProvider;
  private fallbackAPIs: APIProvider[];
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly CACHE_DURATION = API_CONFIG.CACHE_DURATION;
  private readonly MAX_RETRIES = API_CONFIG.MAX_RETRIES;
  private readonly INITIAL_RETRY_DELAY = API_CONFIG.RETRY_DELAY;
  private readonly ERROR_COOLDOWN = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Initialize primary API
    this.primaryAPI = {
      name: 'Mock API',
      baseUrl: HOSTEL_API_BASE_URL,
      endpoints: API_ENDPOINTS,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      isActive: true,
    };

    // Initialize fallback APIs
    this.fallbackAPIs = [
      {
        name: 'Mock API',
        baseUrl: ALTERNATIVE_APIS.MOCK.baseUrl,
        endpoints: ALTERNATIVE_APIS.MOCK.endpoints,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        isActive: true,
      },
      {
        name: 'Supabase Fallback',
        baseUrl: ALTERNATIVE_APIS.SUPABASE.baseUrl,
        endpoints: ALTERNATIVE_APIS.SUPABASE.endpoints,
        headers: ALTERNATIVE_APIS.SUPABASE.headers,
        isActive: true,
      },
    ];

    this.loadCacheFromStorage();
  }

  /**
   * Load cache from AsyncStorage on initialization
   */
  private async loadCacheFromStorage(): Promise<void> {
    try {
      const cacheData = await AsyncStorage.getItem('hostel_api_cache');
      if (cacheData) {
        const parsedCache = JSON.parse(cacheData);
        const now = Date.now();
        Object.entries(parsedCache).forEach(([key, entry]: [string, unknown]) => {
          const cacheEntry = entry as CacheEntry<unknown>;
          if (cacheEntry.expiresAt > now) {
            this.cache.set(key, cacheEntry);
          }
        });
      }
    } catch {
      // Silently fail cache loading - not critical for app functionality
    }
  }

  /**
   * Save cache to AsyncStorage
   */
  private async saveCacheToStorage(): Promise<void> {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      await AsyncStorage.setItem('hostel_api_cache', JSON.stringify(cacheObject));
    } catch {
      // Silently fail cache saving - not critical for app functionality
    }
  }

  /**
   * Get data from cache if available and not expired
   */
  private getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data as T;
    }
    if (entry) {
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Store data in cache
   */
  private setCachedData<T>(key: string, data: T, customDuration?: number): void {
    const duration = customDuration || this.CACHE_DURATION;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration,
    };
    this.cache.set(key, entry);
    this.saveCacheToStorage();
  }

  /**
   * Clear expired cache entries
   */
  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get the best available API provider
   */
  private getBestAPIProvider(): APIProvider {
    // Check if primary API is available
    if (this.primaryAPI.isActive && 
        (!this.primaryAPI.lastErrorTime || 
         Date.now() - this.primaryAPI.lastErrorTime > this.ERROR_COOLDOWN)) {
      return this.primaryAPI;
    }

    // Try fallback APIs
    for (const fallback of this.fallbackAPIs) {
      if (fallback.isActive && 
          (!fallback.lastErrorTime || 
           Date.now() - fallback.lastErrorTime > this.ERROR_COOLDOWN)) {
        return fallback;
      }
    }

    // If all APIs are down, return primary API (will likely fail but provides consistent behavior)
    return this.primaryAPI;
  }

  /**
   * Mark API as having an error
   */
  private markAPIError(provider: APIProvider, error: string): void {
    provider.lastError = error;
    provider.lastErrorTime = Date.now();
    
    // If primary API fails, try to activate fallbacks
    if (provider === this.primaryAPI) {
      this.activateFallbackAPIs();
    }
  }

  /**
   * Activate fallback APIs when primary fails
   */
  private activateFallbackAPIs(): void {
    this.fallbackAPIs.forEach(api => {
      api.isActive = true;
      api.lastError = undefined;
      api.lastErrorTime = undefined;
    });
  }

  /**
   * Fetch with exponential backoff retry logic and API fallback
   */
  private async fetchWithRetry(
    endpoint: string,
    options?: RequestInit,
    retries = this.MAX_RETRIES
  ): Promise<Response> {
    let lastError: Error;
    let currentProvider = this.getBestAPIProvider();

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const url = `${currentProvider.baseUrl}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(url, {
          ...options,
          headers: {
            ...currentProvider.headers,
            ...options?.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return response;
        }

        // Handle different HTTP status codes
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new ValidationError(errorData.message || 'Invalid request parameters');
        }

        if (response.status === 404) {
          throw new APIError('Resource not found', response.status);
        }

        if (response.status >= 500 && attempt < retries - 1) {
          // Server error - mark API as having issues and try next provider
          this.markAPIError(currentProvider, `HTTP ${response.status}: ${response.statusText}`);
          currentProvider = this.getBestAPIProvider();
          
          const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      } catch (error) {
        lastError = error as Error;

        if (error instanceof APIError || error instanceof ValidationError) {
          throw error;
        }

        if (error instanceof Error && error.name === 'AbortError') {
          throw new NetworkError('Request timeout');
        }

        // Mark current API as having issues
        this.markAPIError(currentProvider, lastError.message || 'Network request failed');

        if (attempt === retries - 1) {
          throw new NetworkError(lastError.message || 'Max retries exceeded');
        }

        // Try next API provider
        currentProvider = this.getBestAPIProvider();
        
        // Network error - retry with exponential backoff
        const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new NetworkError(lastError!.message || 'Max retries exceeded');
  }

  /**
   * Transform API response to internal format with support for multiple API structures
   */
  private transformHostelData(apiHostel: Record<string, unknown>): Hostel {
    // Handle different API response structures
    const transformField = (obj: Record<string, unknown>, possibleKeys: string[], defaultValue: any) => {
      for (const key of possibleKeys) {
        if (obj[key] !== undefined && obj[key] !== null) {
          return obj[key];
        }
      }
      return defaultValue;
    };

    return {
      id: String(transformField(apiHostel, ['id', '_id', 'accommodation_id'], '')),
      name: String(transformField(apiHostel, ['name', 'title', 'accommodation_name'], '')),
      description: apiHostel.description ? String(apiHostel.description) : 
                  apiHostel.desc ? String(apiHostel.desc) : 
                  apiHostel.summary ? String(apiHostel.summary) : undefined,
      address: String(transformField(apiHostel, ['address', 'location', 'street_address', 'full_address'], '')),
      price: Number(transformField(apiHostel, ['price', 'rate', 'monthly_rent', 'weekly_rent'], 0)) || 0,
      amenities: Array.isArray(apiHostel.amenities)
        ? apiHostel.amenities.map(a => String(a))
        : typeof apiHostel.amenities === 'string'
          ? apiHostel.amenities.split(',').map((a: string) => a.trim())
          : Array.isArray(apiHostel.facilities)
            ? apiHostel.facilities.map(f => String(f))
            : [],
      images: Array.isArray(apiHostel.images)
        ? apiHostel.images.map(img => String(img))
        : apiHostel.image ? [String(apiHostel.image)] : 
          apiHostel.photos ? Array.isArray(apiHostel.photos) ? apiHostel.photos.map(p => String(p)) : [] : [],
      contactPhone: apiHostel.contactPhone ? String(apiHostel.contactPhone) : 
                   apiHostel.phone ? String(apiHostel.phone) : 
                   apiHostel.contact_phone ? String(apiHostel.contact_phone) : undefined,
      contactEmail: apiHostel.contactEmail ? String(apiHostel.contactEmail) : 
                   apiHostel.email ? String(apiHostel.email) : 
                   apiHostel.contact_email ? String(apiHostel.contact_email) : undefined,
      isActive: apiHostel.isActive !== false && apiHostel.status !== 'inactive',
      location: apiHostel.coordinates && typeof apiHostel.coordinates === 'object' && apiHostel.coordinates !== null ? {
        latitude: Number((apiHostel.coordinates as any).lat || (apiHostel.coordinates as any).latitude) || 0,
        longitude: Number((apiHostel.coordinates as any).lng || (apiHostel.coordinates as any).longitude) || 0,
      } : apiHostel.location && typeof apiHostel.location === 'object' && apiHostel.location !== null ? {
        latitude: Number((apiHostel.location as any).lat || (apiHostel.location as any).latitude) || 0,
        longitude: Number((apiHostel.location as any).lng || (apiHostel.location as any).longitude) || 0,
      } : undefined,
      created_at: apiHostel.created_at ? String(apiHostel.created_at) : 
                 apiHostel.createdAt ? String(apiHostel.createdAt) : undefined,
      updated_at: apiHostel.updated_at ? String(apiHostel.updated_at) : 
                 apiHostel.updatedAt ? String(apiHostel.updatedAt) : undefined,
    };
  }

  /**
   * Get all hostels with pagination
   */
  async getHostels(page = 1, limit = 20): Promise<{ hostels: Hostel[]; total: number; hasMore: boolean }> {
    const cacheKey = `hostels_${page}_${limit}`;
    const cached = this.getCachedData<{ hostels: Hostel[]; total: number; hasMore: boolean }>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await this.fetchWithRetry(`${API_ENDPOINTS.HOSTELS}?${queryParams}`);
      const data = await response.json();

      // Handle different API response structures
      let hostels: Hostel[] = [];
      let total = 0;
      let hasMore = false;

      if (data.data && Array.isArray(data.data)) {
        // Standard API response structure
        hostels = data.data.map((hostel: Record<string, unknown>) => this.transformHostelData(hostel));
        total = data.total || data.total_count || hostels.length;
        hasMore = data.has_more !== false && hostels.length === limit;
      } else if (Array.isArray(data)) {
        // Direct array response
        hostels = data.map((hostel: Record<string, unknown>) => this.transformHostelData(hostel));
        total = hostels.length;
        hasMore = hostels.length === limit;
      } else if (data.hostels && Array.isArray(data.hostels)) {
        // Alternative structure
        hostels = data.hostels.map((hostel: Record<string, unknown>) => this.transformHostelData(hostel));
        total = data.total || hostels.length;
        hasMore = data.hasMore !== false && hostels.length === limit;
      } else {
        // Fallback to empty result
        hostels = [];
        total = 0;
        hasMore = false;
      }

      const result = { hostels, total, hasMore };
      this.setCachedData(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error fetching hostels:', error);
      throw error;
    }
  }

  /**
   * Get hostel details by ID
   */
  async getHostelDetail(id: string): Promise<HostelDetail> {
    const cacheKey = `hostel_detail_${id}`;
    const cached = this.getCachedData<HostelDetail>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.fetchWithRetry(`${API_ENDPOINTS.HOSTEL_DETAIL}/${id}`);
      const data = await response.json();

      // Handle different API response structures
      let hostelData: Record<string, unknown>;
      
      if (data.data) {
        hostelData = data.data;
      } else if (data.hostel) {
        hostelData = data.hostel;
      } else {
        hostelData = data;
      }

      const hostel = this.transformHostelData(hostelData);
      
      // Transform to HostelDetail
      const hostelDetail: HostelDetail = {
        ...hostel,
        landlord: data.landlord ? {
          id: String(data.landlord.id || data.landlord._id || ''),
          name: String(data.landlord.name || data.landlord.full_name || ''),
          phone: data.landlord.phone ? String(data.landlord.phone) : undefined,
          email: data.landlord.email ? String(data.landlord.email) : undefined,
        } : undefined,
        viewCount: data.viewCount ? Number(data.viewCount) : 0,
        contactCount: data.contactCount ? Number(data.contactCount) : 0,
      };

      this.setCachedData(cacheKey, hostelDetail, 10 * 60 * 1000); // Cache for 10 minutes
      
      return hostelDetail;
    } catch (error) {
      console.error('Error fetching hostel detail:', error);
      throw error;
    }
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
    const cacheKey = `search_${query}_${JSON.stringify(filters)}_${page}_${limit}`;
    const cached = this.getCachedData<{ hostels: HostelSearchResult[]; total: number; hasMore: boolean }>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const searchParams = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add filters
      if (filters.minPrice) searchParams.append('min_price', filters.minPrice.toString());
      if (filters.maxPrice) searchParams.append('max_price', filters.maxPrice.toString());
      if (filters.location) searchParams.append('location', filters.location);
      if (filters.amenities && filters.amenities.length > 0) {
        searchParams.append('amenities', filters.amenities.join(','));
      }
      if (filters.sortBy) searchParams.append('sort_by', filters.sortBy);
      if (filters.sortOrder) searchParams.append('sort_order', filters.sortOrder);

      const response = await this.fetchWithRetry(`${API_ENDPOINTS.SEARCH}?${searchParams}`);
      const data = await response.json();

      // Handle different API response structures
      let hostels: HostelSearchResult[] = [];
      let total = 0;
      let hasMore = false;

      if (data.data && Array.isArray(data.data)) {
        hostels = data.data.map((hostel: Record<string, unknown>) => ({
          ...this.transformHostelData(hostel),
          relevanceScore: hostel.relevance_score ? Number(hostel.relevance_score) : undefined,
          distance: hostel.distance ? Number(hostel.distance) : undefined,
        }));
        total = data.total || data.total_count || hostels.length;
        hasMore = data.has_more !== false && hostels.length === limit;
      } else if (Array.isArray(data)) {
        hostels = data.map((hostel: Record<string, unknown>) => ({
          ...this.transformHostelData(hostel),
          relevanceScore: hostel.relevance_score ? Number(hostel.relevance_score) : undefined,
          distance: hostel.distance ? Number(hostel.distance) : undefined,
        }));
        total = hostels.length;
        hasMore = hostels.length === limit;
      } else {
        hostels = [];
        total = 0;
        hasMore = false;
      }

      const result = { hostels, total, hasMore };
      this.setCachedData(cacheKey, result, 2 * 60 * 1000); // Cache search results for 2 minutes
      
      return result;
    } catch (error) {
      console.error('Error searching hostels:', error);
      throw error;
    }
  }

  /**
   * Get API status and health information
   */
  getAPIStatus(): { primary: boolean; fallbacks: Array<{ name: string; status: string }> } {
    const now = Date.now();
    
    return {
      primary: this.primaryAPI.isActive && 
               (!this.primaryAPI.lastErrorTime || 
                now - this.primaryAPI.lastErrorTime > this.ERROR_COOLDOWN),
      fallbacks: this.fallbackAPIs.map(api => ({
        name: api.name,
        status: api.isActive && 
                (!api.lastErrorTime || now - api.lastErrorTime > this.ERROR_COOLDOWN) 
                ? 'active' : 'inactive'
      }))
    };
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem('hostel_api_cache');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const hostelAPIService = new HostelAPIService();

// Export the class for testing purposes
export { HostelAPIService };
