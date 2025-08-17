import { Hostel, HostelDetail, HostelSearchResult, HostelFilters } from '../types';
import { supabase, IS_SUPABASE_CONFIGURED } from './supabase';

/**
 * Local Hostel Service
 * Handles all hostel operations using the local database
 * Landlords can post hostels, students can view and search them
 */
export class LocalHostelService {
  /**
   * Check if the service is available
   */
  private checkAvailability(): boolean {
    if (!IS_SUPABASE_CONFIGURED) {
      console.warn('LocalHostelService: Supabase not configured, service unavailable');
      console.warn('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables');
      return false;
    }
    return true;
  }

  /**
   * Transform camelCase Hostel object to snake_case for database
   */
  private transformToDatabase(hostel: Partial<Hostel>): any {
    const dbHostel: any = { ...hostel };
    
    // Transform camelCase to snake_case for database columns
    if ('contactEmail' in dbHostel) {
      dbHostel.contact_email = dbHostel.contactEmail;
      delete dbHostel.contactEmail;
    }
    
    if ('contactPhone' in dbHostel) {
      dbHostel.contact_phone = dbHostel.contactPhone;
      delete dbHostel.contactPhone;
    }
    
    if ('landlordId' in dbHostel) {
      dbHostel.landlord_id = dbHostel.landlordId;
      delete dbHostel.landlordId;
    }
    
    if ('isActive' in dbHostel) {
      dbHostel.is_active = dbHostel.isActive;
      delete dbHostel.isActive;
    }
    
    return dbHostel;
  }

  /**
   * Transform snake_case database record to camelCase Hostel object
   */
  private transformFromDatabase(dbHostel: any): Hostel {
    const hostel: any = { ...dbHostel };
    
    // Transform snake_case to camelCase for TypeScript interface
    if ('contact_email' in hostel) {
      hostel.contactEmail = hostel.contact_email;
      delete hostel.contact_email;
    }
    
    if ('contact_phone' in hostel) {
      hostel.contactPhone = hostel.contact_phone;
      delete hostel.contact_phone;
    }
    
    if ('landlord_id' in hostel) {
      hostel.landlordId = hostel.landlord_id;
      delete hostel.landlord_id;
    }
    
    if ('is_active' in hostel) {
      hostel.isActive = hostel.is_active;
      delete hostel.is_active;
    }
    
    return hostel;
  }

  /**
   * Get all active hostels with pagination
   */
  async getHostels(page: number = 1, limit: number = 20): Promise<{ hostels: Hostel[]; total: number; hasMore: boolean }> {
    if (!this.checkAvailability()) {
      return { hostels: [], total: 0, hasMore: false };
    }

    if (page < 1) {
      page = 1;
    }

    try {
      console.log('🔍 LocalHostelService: Querying Supabase for hostels...');
      const startIndex = (page - 1) * limit;

      // First, try to get the total count, but handle errors gracefully
      let total = 0;
      try {
        const { count: totalCount, error: countError } = await supabase
          .from('hostels')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (countError) {
          console.warn('⚠️ LocalHostelService: Error getting total count, proceeding without pagination:', countError);
          // Continue without total count - we'll estimate based on returned data
        } else {
          total = totalCount || 0;
        }
      } catch (countError) {
        console.warn('⚠️ LocalHostelService: Exception getting total count, proceeding without pagination:', countError);
        // Continue without total count
      }

      // Check if the requested page is beyond available data (if we have total)
      if (total > 0 && startIndex >= total) {
        console.warn(`⚠️ LocalHostelService: Page ${page} is beyond available data (total: ${total}, startIndex: ${startIndex})`);
        return {
          hostels: [],
          total,
          hasMore: false
        };
      }

      // Now fetch the actual data
      const { data: hostels, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + limit - 1);

      if (error) {
        console.error('❌ LocalHostelService: Supabase error:', error);

        // Handle specific pagination errors
        if (error.code === 'PGRST116' || error.message?.includes('Range Not Satisfiable')) {
          console.warn('⚠️ LocalHostelService: Range not satisfiable (416), returning empty result');
          return {
            hostels: [],
            total: 0,
            hasMore: false
          };
        }

        // Handle other common Supabase errors
        if (error.code === 'PGRST301') {
          console.warn('⚠️ LocalHostelService: Invalid range parameters');
          return {
            hostels: [],
            total: 0,
            hasMore: false
          };
        }

        // Handle 500 Internal Server Error
        if (error.code === '500' || error.message?.includes('Internal Server Error')) {
          console.error('❌ LocalHostelService: 500 Internal Server Error from Supabase');
          console.error('This usually indicates a database or RLS policy issue');

          // Try a simpler query without pagination as fallback
          try {
            console.log('🔄 LocalHostelService: Trying fallback query without pagination...');
            const { data: fallbackHostels, error: fallbackError } = await supabase
              .from('hostels')
              .select('*')
              .eq('is_active', true)
              .order('created_at', { ascending: false })
              .limit(limit);

            if (fallbackError) {
              console.error('❌ LocalHostelService: Fallback query also failed:', fallbackError);
              throw new Error(`Database error: ${fallbackError.message || 'Unknown error'}`);
            }

            console.log('✅ LocalHostelService: Fallback query successful, returning limited results');
            return {
              hostels: (fallbackHostels || []).map(hostel => this.transformFromDatabase(hostel)),
              total: fallbackHostels?.length || 0,
              hasMore: false
            };
          } catch (fallbackError) {
            console.error('❌ LocalHostelService: Fallback query failed:', fallbackError);
            throw new Error(`Failed to fetch hostels: ${error.message || 'Unknown error'}`);
          }
        }

        throw new Error(`Failed to fetch hostels: ${error.message || 'Unknown error'}`);
      }

      // If we don't have total count, estimate based on returned data
      if (total === 0) {
        total = hostels?.length || 0;
        // If we got a full page, assume there might be more
        if (hostels && hostels.length === limit) {
          total = startIndex + limit + 10; // Estimate there are more
        }
      }

      const hasMore = startIndex + limit < total;

      console.log('✅ LocalHostelService: Successfully fetched hostels:', {
        hostelsCount: hostels?.length || 0,
        total,
        hasMore,
        page,
        limit,
        startIndex,
        endIndex: startIndex + limit - 1
      });

      return {
        hostels: (hostels || []).map(hostel => this.transformFromDatabase(hostel)),
        total,
        hasMore
      };
    } catch (error) {
      console.error('❌ LocalHostelService: Error in getHostels:', error);
      throw error;
    }
  }

  /**
   * Get hostel details by ID
   */
  async getHostelDetail(id: string): Promise<HostelDetail | null> {
    if (!this.checkAvailability()) {
      return null;
    }

    try {
      // Let RLS handle authentication - no redundant auth checks needed

      // Get hostel data
      const { data: hostel, error: hostelError } = await supabase
        .from('hostels')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (hostelError || !hostel) {
        console.error('Error fetching hostel:', hostelError);
        return null;
      }

      // Transform hostel data from database format to camelCase
      const transformedHostel = this.transformFromDatabase(hostel);
      
      // Convert to HostelDetail format - use contact details from hostel form instead of landlord profile
      const hostelDetail: HostelDetail = {
        ...transformedHostel,
        // Remove landlord property since we're using hostel contact details
      };

      return hostelDetail;
    } catch (error: any) {
      console.error('Error in getHostelDetail:', error);

      // Handle infinite recursion specifically
      if (error.code === '42P17') {
        console.error('🚨 CRITICAL: Infinite recursion in profiles RLS policies');
        console.error('You MUST run the database migration to fix this');
        console.error('This error is blocking your application from working');
      }

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
    if (!this.checkAvailability()) {
      // Return empty result when Supabase is not configured
      return {
        hostels: [],
        total: 0,
        hasMore: false
      };
    }

    try {
      const startIndex = (page - 1) * limit;

      let queryBuilder = supabase
        .from('hostels')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Apply text search
      if (query.trim()) {
        queryBuilder = queryBuilder.or(
          `name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`
        );
      }

      // Apply price filters
      if (filters.minPrice !== undefined) {
        queryBuilder = queryBuilder.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        queryBuilder = queryBuilder.lte('price', filters.maxPrice);
      }

      // Apply amenities filter
      if (filters.amenities && filters.amenities.length > 0) {
        // For now, we'll do a simple contains check
        // This could be improved with more sophisticated JSONB queries
        queryBuilder = queryBuilder.contains('amenities', filters.amenities);
      }

      const { data: hostels, error, count } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + limit - 1);

      if (error) {
        console.error('Error searching hostels:', error);
        throw new Error('Failed to search hostels');
      }

      const total = count || 0;
      const hasMore = startIndex + limit < total;

      return {
        hostels: (hostels || []).map(hostel => this.transformFromDatabase(hostel)),
        total,
        hasMore
      };
    } catch (error) {
      console.error('Error in searchHostels:', error);
      throw error;
    }
  }

  /**
   * Create a new hostel (for landlords)
   */
  async createHostel(hostelData: Omit<Hostel, 'id' | 'created_at' | 'updated_at'>): Promise<Hostel> {
    if (!this.checkAvailability()) {
      throw new Error('Cannot create hostel: Supabase not configured');
    }

    try {
      // Transform camelCase to snake_case for database
      const dbHostelData = this.transformToDatabase(hostelData);
      
      const { data: hostel, error } = await supabase
        .from('hostels')
        .insert([dbHostelData])
        .select()
        .single();

      if (error) {
        console.error('Error creating hostel:', error);
        throw new Error('Failed to create hostel');
      }

      // Transform snake_case response back to camelCase
      return this.transformFromDatabase(hostel);
    } catch (error) {
      console.error('Error in createHostel:', error);
      throw error;
    }
  }

  /**
   * Update an existing hostel (for landlords)
   */
  async updateHostel(id: string, updates: Partial<Hostel>): Promise<Hostel> {
    if (!this.checkAvailability()) {
      throw new Error('Cannot update hostel: Supabase not configured');
    }

    try {
      // Transform camelCase to snake_case for database
      const dbUpdates = this.transformToDatabase(updates);
      
      const { data: hostel, error } = await supabase
        .from('hostels')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating hostel:', error);
        throw new Error('Failed to update hostel');
      }

      // Transform snake_case response back to camelCase
      return this.transformFromDatabase(hostel);
    } catch (error) {
      console.error('Error in updateHostel:', error);
      throw error;
    }
  }

  /**
   * Delete a hostel (for landlords)
   */
  async deleteHostel(id: string): Promise<void> {
    if (!this.checkAvailability()) {
      throw new Error('Cannot delete hostel: Supabase not configured');
    }

    try {
      const { error } = await supabase
        .from('hostels')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting hostel:', error);
        throw new Error('Failed to delete hostel');
      }
    } catch (error) {
      console.error('Error in deleteHostel:', error);
      throw error;
    }
  }

  /**
   * Get hostels by landlord ID
   */
  async getHostelsByLandlord(landlordId: string): Promise<Hostel[]> {
    if (!this.checkAvailability()) {
      return [];
    }

    try {
      const { data: hostels, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('landlord_id', landlordId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching landlord hostels:', error);
        throw new Error('Failed to fetch landlord hostels');
      }

      return (hostels || []).map(hostel => this.transformFromDatabase(hostel));
    } catch (error) {
      console.error('Error in getHostelsByLandlord:', error);
      throw error;
    }
  }

  /**
   * Get hostel statistics
   */
  async getHostelStats(): Promise<{
    total: number;
    active: number;
    averagePrice: number;
  }> {
    if (!this.checkAvailability()) {
      return {
        total: 0,
        active: 0,
        averagePrice: 0,
      };
    }

    try {
      const { count: total, error: totalError } = await supabase
        .from('hostels')
        .select('*', { count: 'exact', head: true });

      const { count: active, error: activeError } = await supabase
        .from('hostels')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { data: priceData, error: priceError } = await supabase
        .from('hostels')
        .select('price')
        .eq('is_active', true);

      if (totalError || activeError || priceError) {
        console.warn('Some stats could not be fetched:', { totalError, activeError, priceError });
      }

      const averagePrice = priceData && priceData.length > 0
        ? priceData.reduce((sum, hostel) => sum + (hostel.price || 0), 0) / priceData.length
        : 0;

      return {
        total: total || 0,
        active: active || 0,
        averagePrice: Math.round(averagePrice * 100) / 100,
      };
    } catch (error) {
      console.error('Error in getHostelStats:', error);
      throw error;
    }
  }

  /**
   * Get database statistics for debugging
   */
  async getDatabaseStats(): Promise<{ totalHostels: number; activeHostels: number }> {
    if (!this.checkAvailability()) {
      return { totalHostels: 0, activeHostels: 0 };
    }

    try {
      const { count: totalHostels } = await supabase
        .from('hostels')
        .select('*', { count: 'exact', head: true });

      const { count: activeHostels } = await supabase
        .from('hostels')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      return {
        totalHostels: totalHostels || 0,
        activeHostels: activeHostels || 0,
      };
    } catch (error) {
      console.error('❌ LocalHostelService: Error getting database stats:', error);
      return { totalHostels: 0, activeHostels: 0 };
    }
  }
}

// Export singleton instance
export const localHostelService = new LocalHostelService();
export default localHostelService;
