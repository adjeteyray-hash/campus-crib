import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_SUPABASE_CONFIGURED } from '../utils/constants';
import type { 
  Database, 
  ProfileRow, 
  ProfileInsert, 
  ProfileUpdate,
  HostelRow,
  HostelInsert,
  HostelUpdate,
  BookingHistoryRow,
  BookingHistoryInsert
} from '../types/database';

// Check if Supabase is properly configured
if (!IS_SUPABASE_CONFIGURED) {
  console.warn('⚠️ Supabase is not properly configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  console.warn('📱 For development, you can create a .env file in your project root with:');
  console.warn('   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
  console.warn('   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
}

// Create Supabase client with fallback values for development
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      fetch: global.fetch,
    },
  }
);

// Export the configuration status
export { IS_SUPABASE_CONFIGURED };

// Utility function to ensure user profile exists
export const ensureUserProfile = async (userId: string, userEmail: string, userRole: 'student' | 'landlord' = 'student'): Promise<ProfileRow | null> => {
  if (!IS_SUPABASE_CONFIGURED) {
    console.warn('Cannot ensure user profile: Supabase not configured');
    return null;
  }

  try {
    // First check if profile already exists
    const existingProfile = await profileService.getProfile(userId);
    if (existingProfile) {
      return existingProfile;
    }

    // Profile doesn't exist, create one
    console.log(`Creating profile for user ${userId} with role ${userRole}`);
    
    const newProfile: ProfileInsert = {
      id: userId,
      email: userEmail,
      role: userRole,
      name: userEmail.split('@')[0], // Use email prefix as default name
      phone: undefined // Make phone optional
    };

    const createdProfile = await profileService.createProfile(newProfile);
    if (createdProfile) {
      console.log(`Successfully created profile for user ${userId}`);
      return createdProfile;
    }

    console.error(`Failed to create profile for user ${userId}`);
    return null;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return null;
  }
};

// Database utility functions

// Profile operations
export const profileService = {
  async getProfile(userId: string): Promise<ProfileRow | null> {
    if (!IS_SUPABASE_CONFIGURED) {
      console.warn('Cannot fetch profile: Supabase not configured');
      return null;
    }

    try {
      // Let RLS handle access control - no redundant auth checks
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, phone, role, profile_picture_url, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        // Handle specific error codes
        if (error.code === 'PGRST116') {
          console.log('Profile not found, this might be a new user');
          return null;
        }
        // Log critical RLS errors
        if (error.code === '42P17') {
          console.error('🚨 CRITICAL: Infinite recursion in profiles RLS policies');
          console.error('You MUST run the database migration to fix this');
          console.error('Error details:', error);
        }
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  },

  async createProfile(profile: ProfileInsert): Promise<ProfileRow | null> {
    console.log('🔐 profileService.createProfile: Called with profile:', profile);
    console.log('🔐 profileService.createProfile: IS_SUPABASE_CONFIGURED:', IS_SUPABASE_CONFIGURED);
    
    if (!IS_SUPABASE_CONFIGURED) {
      console.warn('Cannot create profile: Supabase not configured');
      return null;
    }

    try {
      // Let RLS handle access control - no redundant auth checks
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating profile:', error);
        // Log critical RLS errors
        if (error.code === '42P17') {
          console.error('🚨 CRITICAL: Infinite recursion in profiles RLS policies');
          console.error('You MUST run the database migration to fix this');
          console.error('Error details:', error);
        }
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return null;
    }
  },

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<ProfileRow | null> {
    console.log('🔐 profileService.updateProfile: Called with userId:', userId, 'updates:', updates);
    console.log('🔐 profileService.updateProfile: IS_SUPABASE_CONFIGURED:', IS_SUPABASE_CONFIGURED);
    
    if (!IS_SUPABASE_CONFIGURED) {
      console.warn('Cannot update profile: Supabase not configured');
      return null;
    }

    try {
      console.log('🔐 profileService.updateProfile: Executing update query...');
      // Let RLS handle access control - no redundant auth checks
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('❌ profileService.updateProfile: Database error:', error);
        // Log critical RLS errors
        if (error.code === '42P17') {
          console.error('🚨 CRITICAL: Infinite recursion in profiles RLS policies');
          console.error('You MUST run the database migration to fix this');
        } else if (error.code === '42501') {
          console.error('🚨 RLS Policy violation: User may not have permission to update this profile');
        } else if (error.code === 'PGRST116') {
          console.error('🚨 No rows found: Profile with ID', userId, 'does not exist');
        }
        console.error('Error details:', error);
        return null;
      }
      
      console.log('✅ profileService.updateProfile: Update successful:', { id: data.id, name: data.name, phone: data.phone });
      return data;
    } catch (error) {
      console.error('❌ profileService.updateProfile: Unexpected error:', error);
      return null;
    }
  },

  async deleteProfile(userId: string): Promise<boolean> {
    if (!IS_SUPABASE_CONFIGURED) {
      console.warn('Cannot delete profile: Supabase not configured');
      return false;
    }

    try {
      // Let RLS handle access control - no redundant auth checks
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error('Error deleting profile:', error);
        // Log critical RLS errors
        if (error.code === '42P17') {
          console.error('🚨 CRITICAL: Infinite recursion in profiles RLS policies');
          console.error('You MUST run the database migration to fix this');
          console.error('Error details:', error);
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteProfile:', error);
      return false;
    }
  }
};

// Hostel operations
export const hostelService = {
  async getHostelsByLandlord(landlordId: string): Promise<HostelRow[]> {
    const { data, error } = await supabase
      .from('hostels')
      .select('*')
      .eq('landlord_id', landlordId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching hostels:', error);
      return [];
    }
    
    return data || [];
  },

  async getHostelById(hostelId: string): Promise<HostelRow | null> {
    const { data, error } = await supabase
      .from('hostels')
      .select('*')
      .eq('id', hostelId)
      .single();
    
    if (error) {
      console.error('Error fetching hostel:', error);
      return null;
    }
    
    return data;
  },

  async createHostel(hostel: HostelInsert): Promise<HostelRow | null> {
    const { data, error } = await supabase
      .from('hostels')
      .insert(hostel)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating hostel:', error);
      return null;
    }
    
    return data;
  },

  async updateHostel(hostelId: string, updates: HostelUpdate): Promise<HostelRow | null> {
    const { data, error } = await supabase
      .from('hostels')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', hostelId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating hostel:', error);
      return null;
    }
    
    return data;
  },

  async deleteHostel(hostelId: string): Promise<boolean> {
    const { error } = await supabase
      .from('hostels')
      .delete()
      .eq('id', hostelId);
    
    if (error) {
      console.error('Error deleting hostel:', error);
      return false;
    }
    
    return true;
  },

  async toggleHostelStatus(hostelId: string, isActive: boolean): Promise<HostelRow | null> {
    return this.updateHostel(hostelId, { is_active: isActive });
  }
};

// Booking history operations
export const bookingHistoryService = {
  async getStudentHistory(studentId: string, limit = 50, offset = 0): Promise<BookingHistoryRow[]> {
    const { data, error } = await supabase
      .from('booking_history')
      .select('*')
      .eq('student_id', studentId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching booking history:', error);
      return [];
    }
    
    return data || [];
  },

  async getHostelAnalytics(hostelId: string): Promise<BookingHistoryRow[]> {
    const { data, error } = await supabase
      .from('booking_history')
      .select('*')
      .eq('hostel_id', hostelId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching hostel analytics:', error);
      return [];
    }
    
    return data || [];
  },

  async recordBookingAction(booking: BookingHistoryInsert): Promise<BookingHistoryRow | null> {
    const { data, error } = await supabase
      .from('booking_history')
      .insert(booking)
      .select()
      .single();
    
    if (error) {
      console.error('Error recording booking action:', error);
      return null;
    }
    
    return data;
  },

  async getAnalyticsForLandlord(landlordId: string): Promise<BookingHistoryRow[]> {
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
    
    return data || [];
  }
};

// Storage operations for profile pictures
export const profilePictureService = {
  async uploadProfilePicture(file: File | ArrayBuffer, userId: string, fileName: string): Promise<string | null> {
    const filePath = `${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Allow overwriting existing profile pictures
      });
    
    if (error) {
      console.error('Error uploading profile picture:', error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  },

  async deleteProfilePicture(filePath: string): Promise<boolean> {
    const { error } = await supabase.storage
      .from('profile-pictures')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting profile picture:', error);
      return false;
    }
    
    return true;
  },

  async getProfilePictureUrl(filePath: string): Promise<string> {
    const { data } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
};

// Storage operations for hostel images
export const storageService = {
  async uploadHostelImage(file: File, hostelId: string, fileName: string): Promise<string | null> {
    const filePath = `hostels/${hostelId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('hostel-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('hostel-images')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  },

  async deleteHostelImage(filePath: string): Promise<boolean> {
    const { error } = await supabase.storage
      .from('hostel-images')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }
    
    return true;
  },

  async getHostelImageUrl(filePath: string): Promise<string> {
    const { data } = supabase.storage
      .from('hostel-images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
};

export default supabase;
