// High-level database operations and analytics
import { supabase, profileService, hostelService, bookingHistoryService as supabaseBookingHistoryService } from './supabase';
import { bookingHistoryService } from './bookingHistory';
import type { 
  User, 
  Hostel, 
  BookingHistoryEntry, 
  AnalyticsData 
} from '../types';
import type { 
  ProfileRow, 
  HostelRow, 
  BookingHistoryRow 
} from '../types/database';

// Transform database rows to app types
export const transformers = {
  profileToUser(profile: ProfileRow): User {
    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      name: profile.name || undefined,
      phone: profile.phone || undefined,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  },

  hostelRowToHostel(hostel: HostelRow): Hostel {
    return {
      id: hostel.id,
      name: hostel.name,
      description: hostel.description || undefined,
      address: hostel.address,
      price: hostel.price,
      amenities: hostel.amenities,
      images: hostel.images,
      contactPhone: hostel.contact_phone || undefined,
      contactEmail: hostel.contact_email || undefined,
      isActive: hostel.is_active,
      landlordId: hostel.landlord_id,
      created_at: hostel.created_at,
      updated_at: hostel.updated_at,
    };
  },

  bookingHistoryRowToEntry(row: BookingHistoryRow): BookingHistoryEntry {
    return {
      id: row.id,
      studentId: row.student_id,
      hostelId: row.hostel_id,
      hostelName: row.hostel_name,
      action: row.action,
      timestamp: row.timestamp,
      metadata: row.metadata || undefined,
    };
  },
};

// User management operations
export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const profile = await profileService.getProfile(user.id);
    if (!profile) return null;

    return transformers.profileToUser(profile);
  },

  async createUserProfile(userId: string, email: string, role: 'student' | 'landlord', name?: string, phone?: string): Promise<User | null> {
    const profile = await profileService.createProfile({
      id: userId,
      email,
      role,
      name,
      phone,
    });

    if (!profile) return null;
    return transformers.profileToUser(profile);
  },

  async updateUserProfile(userId: string, updates: { name?: string; phone?: string }): Promise<User | null> {
    const profile = await profileService.updateProfile(userId, updates);
    if (!profile) return null;
    return transformers.profileToUser(profile);
  },
};

// Hostel management operations
export const hostelManagementService = {
  async getLandlordHostels(landlordId: string): Promise<Hostel[]> {
    const hostels = await hostelService.getHostelsByLandlord(landlordId);
    return hostels.map(transformers.hostelRowToHostel);
  },

  async createHostel(landlordId: string, hostelData: Omit<Hostel, 'id' | 'landlordId' | 'created_at' | 'updated_at'>): Promise<Hostel | null> {
    const hostel = await hostelService.createHostel({
      landlord_id: landlordId,
      name: hostelData.name,
      description: hostelData.description,
      address: hostelData.address,
      price: hostelData.price,
      amenities: hostelData.amenities,
      images: hostelData.images,
      contact_phone: hostelData.contactPhone,
      contact_email: hostelData.contactEmail,
      is_active: hostelData.isActive,
    });

    if (!hostel) return null;
    return transformers.hostelRowToHostel(hostel);
  },

  async updateHostel(hostelId: string, updates: Partial<Hostel>): Promise<Hostel | null> {
    const hostel = await hostelService.updateHostel(hostelId, {
      name: updates.name,
      description: updates.description,
      address: updates.address,
      price: updates.price,
      amenities: updates.amenities,
      images: updates.images,
      contact_phone: updates.contactPhone,
      contact_email: updates.contactEmail,
      is_active: updates.isActive,
    });

    if (!hostel) return null;
    return transformers.hostelRowToHostel(hostel);
  },

  async deleteHostel(hostelId: string): Promise<boolean> {
    return hostelService.deleteHostel(hostelId);
  },

  async toggleHostelStatus(hostelId: string, isActive: boolean): Promise<Hostel | null> {
    const hostel = await hostelService.toggleHostelStatus(hostelId, isActive);
    if (!hostel) return null;
    return transformers.hostelRowToHostel(hostel);
  },
};

// Booking history and analytics
export const analyticsService = {
  async recordHostelView(studentId: string, hostelId: string, hostelName: string): Promise<boolean> {
    const result = await bookingHistoryService.recordHostelView(studentId, hostelId, hostelName);
    return result !== null;
  },

  async recordHostelContact(studentId: string, hostelId: string, hostelName: string, contactMethod: 'phone' | 'email'): Promise<boolean> {
    const result = await bookingHistoryService.recordHostelContact(studentId, hostelId, hostelName, contactMethod);
    return result !== null;
  },

  async getStudentBookingHistory(studentId: string, limit = 50, offset = 0): Promise<BookingHistoryEntry[]> {
    return await bookingHistoryService.getStudentBookingHistory(studentId, limit, offset);
  },

  async getLandlordAnalytics(landlordId: string): Promise<AnalyticsData[]> {
    // Get all hostels for the landlord
    const hostels = await hostelService.getHostelsByLandlord(landlordId);
    
    // Get analytics data for all hostels
    const analyticsPromises = hostels.map(async (hostel) => {
      // Convert hostel ID to string for booking history lookup
      const hostelIdString = hostel.id.toString();
      const history = await bookingHistoryService.getHostelAnalytics(hostelIdString);
      
      const views = history.filter(h => h.action === 'viewed').length;
      const contacts = history.filter(h => h.action === 'contacted').length;
      const conversionRate = views > 0 ? (contacts / views) * 100 : 0;
      
      // Generate trend data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentHistory = history.filter(h => new Date(h.timestamp) >= thirtyDaysAgo);
      const trendData = this.generateTrendData(recentHistory);
      
      return {
        hostelId: hostel.id,
        hostelName: hostel.name,
        totalViews: views,
        totalContacts: contacts,
        conversionRate: Math.round(conversionRate * 100) / 100,
        ranking: 0, // Will be calculated after all data is collected
        trendData,
      };
    });
    
    const analytics = await Promise.all(analyticsPromises);
    
    // Calculate rankings based on total engagement (views + contacts * 2)
    const sortedAnalytics = analytics
      .map(a => ({
        ...a,
        engagementScore: a.totalViews + (a.totalContacts * 2),
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .map((a, index) => ({
        ...a,
        ranking: index + 1,
      }));
    
    return sortedAnalytics;
  },

  generateTrendData(history: BookingHistoryEntry[]): AnalyticsData['trendData'] {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    return last7Days.map(date => {
      const dayHistory = history.filter(h => 
        new Date(h.timestamp).toISOString().split('T')[0] === date
      );
      
      return {
        date,
        views: dayHistory.filter(h => h.action === 'viewed').length,
        contacts: dayHistory.filter(h => h.action === 'contacted').length,
      };
    });
  },

  async getHostelPerformanceMetrics(hostelId: string): Promise<{
    totalViews: number;
    totalContacts: number;
    conversionRate: number;
    averageViewsPerDay: number;
    averageContactsPerDay: number;
  }> {
    const history = await bookingHistoryService.getHostelAnalytics(hostelId);
    
    const views = history.filter(h => h.action === 'viewed').length;
    const contacts = history.filter(h => h.action === 'contacted').length;
    const conversionRate = views > 0 ? (contacts / views) * 100 : 0;
    
    // Calculate averages over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHistory = history.filter(h => new Date(h.timestamp) >= thirtyDaysAgo);
    const recentViews = recentHistory.filter(h => h.action === 'viewed').length;
    const recentContacts = recentHistory.filter(h => h.action === 'contacted').length;
    
    return {
      totalViews: views,
      totalContacts: contacts,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageViewsPerDay: Math.round((recentViews / 30) * 100) / 100,
      averageContactsPerDay: Math.round((recentContacts / 30) * 100) / 100,
    };
  },
};

// Database health and maintenance
export const maintenanceService = {
  async cleanupOldBookingHistory(daysToKeep = 365): Promise<number> {
    return await bookingHistoryService.cleanupOldEntries(daysToKeep);
  },

  async cleanupDuplicateBookingHistory(): Promise<number> {
    return await bookingHistoryService.cleanupDuplicateEntries();
  },

  async getStorageUsage(): Promise<{
    totalFiles: number;
    totalSize: number;
  }> {
    const { data, error } = await supabase.storage
      .from('hostel-images')
      .list();
    
    if (error) {
      console.error('Error getting storage usage:', error);
      return { totalFiles: 0, totalSize: 0 };
    }
    
    const totalFiles = data?.length || 0;
    const totalSize = data?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0;
    
    return { totalFiles, totalSize };
  },
};

export default {
  userService,
  hostelManagementService,
  analyticsService,
  maintenanceService,
  transformers,
};