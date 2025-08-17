// Database configuration and initialization
import { supabase } from '../services/supabase';
import { userService } from '../services/database';
import type { User } from '../types';

export interface DatabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  maxConnections?: number;
  connectionTimeout?: number;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Test database connection
      const { error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        console.error('Database connection failed:', error);
        return false;
      }

      this.isInitialized = true;
      console.log('Database connection established successfully');
      return true;
    } catch (error) {
      console.error('Database initialization error:', error);
      return false;
    }
  }

  async checkHealth(): Promise<{
    isHealthy: boolean;
    latency: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      const latency = Date.now() - startTime;
      
      if (error) {
        return {
          isHealthy: false,
          latency,
          error: error.message,
        };
      }

      return {
        isHealthy: true,
        latency,
      };
    } catch (error) {
      return {
        isHealthy: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async setupUserProfile(userId: string, email: string, role: 'student' | 'landlord', additionalData?: {
    name?: string;
    phone?: string;
  }): Promise<User | null> {
    try {
      // Check if profile already exists
      const existingUser = await userService.getCurrentUser();
      if (existingUser) {
        return existingUser;
      }

      // Create new profile
      const user = await userService.createUserProfile(
        userId,
        email,
        role,
        additionalData?.name,
        additionalData?.phone
      );

      if (!user) {
        throw new Error('Failed to create user profile');
      }

      console.log(`User profile created successfully for ${role}: ${email}`);
      return user;
    } catch (error) {
      console.error('Error setting up user profile:', error);
      return null;
    }
  }

  async cleanupUserData(userId: string): Promise<boolean> {
    try {
      // This will cascade delete related data due to foreign key constraints
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error cleaning up user data:', error);
        return false;
      }

      console.log(`User data cleaned up successfully for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('Error during user data cleanup:', error);
      return false;
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getClient() {
    return supabase;
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Database event listeners
export const setupDatabaseListeners = () => {
  // Listen for auth state changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN' && session?.user) {
      // Ensure user profile exists
      const profile = await userService.getCurrentUser();
      if (!profile) {
        console.warn('User signed in but no profile found');
      }
    }
    
    if (event === 'SIGNED_OUT') {
      console.log('User signed out');
    }
  });

  // Listen for database changes (optional - for real-time features)
  const hostelChanges = supabase
    .channel('hostel-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hostels',
      },
      (payload) => {
        console.log('Hostel data changed:', payload);
        // Handle real-time updates here if needed
      }
    )
    .subscribe();

  return () => {
    // Cleanup function
    hostelChanges.unsubscribe();
  };
};

// Utility functions for database operations
export const databaseUtils = {
  async testConnection(): Promise<boolean> {
    const health = await databaseManager.checkHealth();
    return health.isHealthy;
  },

  async getTableCounts(): Promise<{
    profiles: number;
    hostels: number;
    bookingHistory: number;
  }> {
    try {
      const [profilesResult, hostelsResult, bookingHistoryResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('hostels').select('*', { count: 'exact', head: true }),
        supabase.from('booking_history').select('*', { count: 'exact', head: true }),
      ]);

      return {
        profiles: profilesResult.count || 0,
        hostels: hostelsResult.count || 0,
        bookingHistory: bookingHistoryResult.count || 0,
      };
    } catch (error) {
      console.error('Error getting table counts:', error);
      return {
        profiles: 0,
        hostels: 0,
        bookingHistory: 0,
      };
    }
  },

  async validateRLSPolicies(): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // Test profile access (should fail without auth)
      const { error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (!profileError) {
        errors.push('Profile RLS policy may not be working correctly');
      }

      // Test hostel access (should work for active hostels)
      const { error: hostelError } = await supabase
        .from('hostels')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (hostelError) {
        errors.push(`Hostel RLS policy error: ${hostelError.message}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`RLS validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  },
};

export default databaseManager;