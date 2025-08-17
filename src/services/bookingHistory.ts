import { supabase } from './supabase';
import type { 
  BookingHistoryRow,
  BookingHistoryInsert
} from '../types/database';
import type { BookingHistoryEntry } from '../types';

/**
 * BookingHistoryService - Dedicated service for managing booking history tracking
 * 
 * This service handles:
 * - Recording user interactions (views, contacts)
 * - Automatic tracking when students view hostel details
 * - Tracking contact attempts (phone calls and emails)
 * - Data cleanup utilities for old booking history entries
 */
export class BookingHistoryService {
  /**
   * Record when a student views a hostel
   */
  async recordHostelView(
    studentId: string, 
    hostelId: string, 
    hostelName: string,
    metadata?: Record<string, unknown>
  ): Promise<BookingHistoryEntry | null> {
    try {
      // Check if we have a valid studentId
      if (!studentId) {
        console.error('Student ID is required for recordHostelView');
        return null;
      }

      // Try to get the current session, but don't fail if it's missing
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (user && !authError) {
          // Ensure the authenticated user is the student
          if (user.id !== studentId) {
            console.error('User can only record their own hostel views');
            return null;
          }
        } else {
          console.warn('No active Supabase session for recordHostelView, but proceeding with user context validation');
        }
      } catch (sessionError) {
        console.warn('Session check failed for recordHostelView, but proceeding:', sessionError);
      }

      // Check if user has a profile and is a student
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', studentId)
        .single();

      if (profileError || !profile) {
        console.error('Profile not found or error fetching profile:', profileError);
        return null;
      }

      if (profile.role !== 'student') {
        console.error('Only students can record hostel views');
        return null;
      }

      const bookingData: BookingHistoryInsert = {
        student_id: studentId,
        hostel_id: hostelId,
        hostel_name: hostelName,
        action: 'viewed',
        metadata: metadata || {}
      };

      const { data, error } = await supabase
        .from('booking_history')
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        console.error('Error recording hostel view:', error);
        
        // Handle specific RLS policy violations
        if (error.code === '42501') {
          console.error('Row-level security policy violation. User may not have permission to insert into booking_history');
          console.error('This could be due to missing profile or incorrect role');
        }
        
        return null;
      }

      return this.transformBookingHistoryRow(data);
    } catch (error) {
      console.error('Error in recordHostelView:', error);
      return null;
    }
  }

  /**
   * Record when a student contacts a hostel landlord
   */
  async recordHostelContact(
    studentId: string,
    hostelId: string,
    hostelName: string,
    contactMethod: 'phone' | 'email',
    metadata?: Record<string, unknown>
  ): Promise<BookingHistoryEntry | null> {
    try {
      // First check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error in recordHostelContact:', authError);
        return null;
      }

      // Ensure the authenticated user is the student
      if (user.id !== studentId) {
        console.error('User can only record their own hostel contacts');
        return null;
      }

      // Check if user has a profile and is a student
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', studentId)
        .single();

      if (profileError || !profile) {
        console.error('Profile not found or error fetching profile:', profileError);
        return null;
      }

      if (profile.role !== 'student') {
        console.error('Only students can record hostel contacts');
        return null;
      }

      const bookingData: BookingHistoryInsert = {
        student_id: studentId,
        hostel_id: hostelId,
        hostel_name: hostelName,
        action: 'contacted',
        metadata: {
          contactMethod,
          ...metadata
        }
      };

      const { data, error } = await supabase
        .from('booking_history')
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        console.error('Error recording hostel contact:', error);
        
        // Handle specific RLS policy violations
        if (error.code === '42501') {
          console.error('Row-level security policy violation. User may not have permission to insert into booking_history');
          console.error('This could be due to missing profile or incorrect role');
        }
        
        return null;
      }

      return this.transformBookingHistoryRow(data);
    } catch (error) {
      console.error('Error in recordHostelContact:', error);
      return null;
    }
  }

  /**
   * Get booking history for a specific student with pagination
   */
  async getStudentBookingHistory(
    studentId: string,
    limit: number = 50,
    offset: number = 0,
    actionFilter?: 'viewed' | 'contacted'
  ): Promise<BookingHistoryEntry[]> {
    try {
      // Check if we have a valid studentId
      if (!studentId) {
        console.error('Student ID is required for getStudentBookingHistory');
        return [];
      }

      // Try to get the current session, but don't fail if it's missing
      // since we might be in a state where the user context is available
      // but the Supabase session hasn't been fully established yet
      let currentUserId: string | null = null;
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (user && !authError) {
          currentUserId = user.id;
          
          // Ensure the authenticated user is requesting their own history
          if (user.id !== studentId) {
            console.error('User can only view their own booking history');
            return [];
          }
        } else {
          console.warn('No active Supabase session, but proceeding with user context validation');
        }
      } catch (sessionError) {
        console.warn('Session check failed, but proceeding with user context validation:', sessionError);
      }

      // Check if user has a profile and is a student
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', studentId)
        .single();

      if (profileError || !profile) {
        console.error('Profile not found or error fetching profile:', profileError);
        return [];
      }

      if (profile.role !== 'student') {
        console.error('Only students can view booking history');
        return [];
      }

      let query = supabase
        .from('booking_history')
        .select('*')
        .eq('student_id', studentId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (actionFilter) {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching student booking history:', error);
        return [];
      }

      return (data || []).map(this.transformBookingHistoryRow);
    } catch (error) {
      console.error('Error in getStudentBookingHistory:', error);
      return [];
    }
  }

  /**
   * Get analytics data for a specific hostel
   */
  async getHostelAnalytics(hostelId: string): Promise<BookingHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('booking_history')
        .select('*')
        .eq('hostel_id', hostelId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching hostel analytics:', error);
        return [];
      }

      return (data || []).map(this.transformBookingHistoryRow);
    } catch (error) {
      console.error('Error in getHostelAnalytics:', error);
      return [];
    }
  }

  /**
   * Get analytics data for all hostels belonging to a landlord
   */
  async getLandlordAnalytics(landlordId: string): Promise<BookingHistoryEntry[]> {
    try {
      // First get all hostel IDs for this landlord
      const { data: hostels, error: hostelsError } = await supabase
        .from('hostels')
        .select('id')
        .eq('landlord_id', landlordId);

      if (hostelsError) {
        console.error('Error fetching landlord hostels:', hostelsError);
        return [];
      }

      if (!hostels || hostels.length === 0) {
        return [];
      }

      // Convert hostel IDs to strings for comparison
      const hostelIds = hostels.map(h => h.id);

      // Get booking history for these hostels
      const { data, error } = await supabase
        .from('booking_history')
        .select('*')
        .in('hostel_id', hostelIds)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching landlord analytics:', error);
        return [];
      }

      return (data || []).map(this.transformBookingHistoryRow);
    } catch (error) {
      console.error('Error in getLandlordAnalytics:', error);
      return [];
    }
  }

  /**
   * Check if a student has already viewed a specific hostel recently
   * (within the last 24 hours to prevent duplicate tracking)
   */
  async hasRecentView(studentId: string, hostelId: string): Promise<boolean> {
    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data, error } = await supabase
        .from('booking_history')
        .select('id')
        .eq('student_id', studentId)
        .eq('hostel_id', hostelId)
        .eq('action', 'viewed')
        .gte('timestamp', twentyFourHoursAgo.toISOString())
        .limit(1);

      if (error) {
        console.error('Error checking recent view:', error);
        return false;
      }

      return (data || []).length > 0;
    } catch (error) {
      console.error('Error in hasRecentView:', error);
      return false;
    }
  }

  /**
   * Get booking history statistics for a student
   */
  async getStudentStatistics(studentId: string): Promise<{
    totalViews: number;
    totalContacts: number;
    uniqueHostels: number;
    mostViewedHostel: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('booking_history')
        .select('*')
        .eq('student_id', studentId);

      if (error) {
        console.error('Error fetching student statistics:', error);
        return {
          totalViews: 0,
          totalContacts: 0,
          uniqueHostels: 0,
          mostViewedHostel: null
        };
      }

      const history = data || [];
      const totalViews = history.filter(h => h.action === 'viewed').length;
      const totalContacts = history.filter(h => h.action === 'contacted').length;
      
      // Count unique hostels
      const uniqueHostelIds = new Set(history.map(h => h.hostel_id));
      const uniqueHostels = uniqueHostelIds.size;

      // Find most viewed hostel
      const hostelViewCounts = history
        .filter(h => h.action === 'viewed')
        .reduce((acc, h) => {
          acc[h.hostel_name] = (acc[h.hostel_name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const mostViewedHostel = Object.keys(hostelViewCounts).length > 0
        ? Object.keys(hostelViewCounts).reduce((a, b) => 
            hostelViewCounts[a] > hostelViewCounts[b] ? a : b
          )
        : null;

      return {
        totalViews,
        totalContacts,
        uniqueHostels,
        mostViewedHostel
      };
    } catch (error) {
      console.error('Error in getStudentStatistics:', error);
      return {
        totalViews: 0,
        totalContacts: 0,
        uniqueHostels: 0,
        mostViewedHostel: null
      };
    }
  }

  /**
   * Clean up old booking history entries
   * @param daysToKeep Number of days to keep (default: 365)
   * @returns Number of records deleted
   */
  async cleanupOldEntries(daysToKeep: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // First count the records to be deleted
      const { count } = await supabase
        .from('booking_history')
        .select('*', { count: 'exact', head: true })
        .lt('timestamp', cutoffDate.toISOString());

      // Then delete them
      const { error } = await supabase
        .from('booking_history')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());

      if (error) {
        console.error('Error cleaning up booking history:', error);
        return 0;
      }

      console.log(`Cleaned up ${count || 0} old booking history entries`);
      return count || 0;
    } catch (error) {
      console.error('Error in cleanupOldEntries:', error);
      return 0;
    }
  }

  /**
   * Clean up duplicate entries for the same student-hostel-action combination
   * within a short time window (1 hour)
   */
  async cleanupDuplicateEntries(): Promise<number> {
    try {
      // Get all booking history entries
      const { data: allEntries, error } = await supabase
        .from('booking_history')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching entries for duplicate cleanup:', error);
        return 0;
      }

      if (!allEntries || allEntries.length === 0) {
        return 0;
      }

      const duplicateIds: string[] = [];
      const seen = new Map<string, { id: string; timestamp: string }>();

      for (const entry of allEntries) {
        const key = `${entry.student_id}-${entry.hostel_id}-${entry.action}`;
        const entryTime = new Date(entry.timestamp);

        if (seen.has(key)) {
          const existing = seen.get(key)!;
          const existingTime = new Date(existing.timestamp);
          const timeDiff = Math.abs(entryTime.getTime() - existingTime.getTime());
          
          // If entries are within 1 hour of each other, mark the later one as duplicate
          if (timeDiff < 60 * 60 * 1000) { // 1 hour in milliseconds
            duplicateIds.push(entry.id);
          } else {
            // Update the seen entry to the more recent one
            seen.set(key, { id: entry.id, timestamp: entry.timestamp });
          }
        } else {
          seen.set(key, { id: entry.id, timestamp: entry.timestamp });
        }
      }

      if (duplicateIds.length === 0) {
        return 0;
      }

      // Delete duplicate entries
      const { error: deleteError } = await supabase
        .from('booking_history')
        .delete()
        .in('id', duplicateIds);

      if (deleteError) {
        console.error('Error deleting duplicate entries:', deleteError);
        return 0;
      }

      console.log(`Cleaned up ${duplicateIds.length} duplicate booking history entries`);
      return duplicateIds.length;
    } catch (error) {
      console.error('Error in cleanupDuplicateEntries:', error);
      return 0;
    }
  }

  /**
   * Get booking history count for a specific time period
   */
  async getHistoryCount(
    studentId?: string,
    hostelId?: string,
    action?: 'viewed' | 'contacted',
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    try {
      let query = supabase
        .from('booking_history')
        .select('*', { count: 'exact', head: true });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      if (hostelId) {
        query = query.eq('hostel_id', hostelId);
      }

      if (action) {
        query = query.eq('action', action);
      }

      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }

      const { count, error } = await query;

      if (error) {
        console.error('Error getting history count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getHistoryCount:', error);
      return 0;
    }
  }

  /**
   * Transform database row to application type
   */
  private transformBookingHistoryRow(row: BookingHistoryRow): BookingHistoryEntry {
    return {
      id: row.id,
      studentId: row.student_id,
      hostelId: row.hostel_id,
      hostelName: row.hostel_name,
      action: row.action,
      timestamp: row.timestamp,
      metadata: row.metadata || undefined,
    };
  }
}

// Export singleton instance
export const bookingHistoryService = new BookingHistoryService();
export default bookingHistoryService;