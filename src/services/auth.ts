import { supabase, profileService } from './supabase';
import { secureStorageService } from './storage';
import type { User, LoginCredentials, SignUpCredentials, AuthResponse } from '../types/auth';
import type { ProfileInsert } from '../types/database';

// Secure storage keys
const AUTH_TOKEN_KEY = 'campuscrib_auth_token';
const USER_DATA_KEY = 'campuscrib_user_data';

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    try {
      const { email, password, role, name, phone } = credentials;

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name: name || '',
            phone: phone || '',
          }
        }
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user account' };
      }

      // If email confirmation is required, return success but no user data yet
      if (!authData.session) {
        return {
          user: null,
          error: null,
          message: 'Please check your email to confirm your account'
        };
      }

      // Profile will be created automatically by database trigger
      // Get the created profile
      const profile = await profileService.getProfile(authData.user.id);

      if (!profile) {
        // Wait a moment and try again (trigger might be processing)
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryProfile = await profileService.getProfile(authData.user.id);

        if (!retryProfile) {
          return { user: null, error: 'Failed to create user profile' };
        }

        // Convert profile to User type
        const user: User = {
          id: retryProfile.id,
          email: retryProfile.email,
          role: retryProfile.role as 'student' | 'landlord',
          name: retryProfile.name || undefined,
          phone: retryProfile.phone || undefined,
          profile_picture_url: retryProfile.profile_picture_url || undefined,
          created_at: retryProfile.created_at,
          updated_at: retryProfile.updated_at,
        };

        await this.storeUserData(user);
        return { user, error: null };
      }

      // Convert profile to User type
      const user: User = {
        id: profile.id,
        email: profile.email,
        role: profile.role as 'student' | 'landlord',
        name: profile.name || undefined,
        phone: profile.phone || undefined,
        profile_picture_url: profile.profile_picture_url || undefined,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      // Store user data securely
      await this.storeUserData(user);

      return { user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        user: null,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Sign in user with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 AuthService.signIn: Starting with email:', credentials.email);
      const { email, password } = credentials;

      console.log('🔐 AuthService.signIn: Calling supabase.auth.signInWithPassword...');
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('🔐 AuthService.signIn: Supabase auth result:', { hasUser: !!authData?.user, hasError: !!authError, error: authError?.message });

      if (authError) {
        console.log('🔐 AuthService.signIn: Auth error, returning error');
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        console.log('🔐 AuthService.signIn: No user data, returning error');
        return { user: null, error: 'Authentication failed' };
      }

      console.log('🔐 AuthService.signIn: Getting user profile for ID:', authData.user.id);
      // Get user profile - rely on database trigger for profile creation
      const profile = await profileService.getProfile(authData.user.id);
      console.log('🔐 AuthService.signIn: Profile result:', { hasProfile: !!profile, profileId: profile?.id });

      if (!profile) {
        console.log('🔐 AuthService.signIn: Profile not found - database trigger may not have run');
        console.log('🔐 AuthService.signIn: This could indicate a database trigger issue or RLS policy problem');

        // Use fallback user object from auth data without attempting manual profile creation
        const userData = authData.user.user_metadata || {};
        const fallbackUser: User = {
          id: authData.user.id,
          email: authData.user.email || '',
          role: (userData.role as 'student' | 'landlord') || 'student',
          name: userData.name || undefined,
          phone: userData.phone || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log('🔐 AuthService.signIn: Using fallback user data (no manual profile creation):', fallbackUser);
        return { user: fallbackUser, error: null };
      }

      // Convert profile to User type
      const user: User = {
        id: profile.id,
        email: profile.email,
        role: profile.role as 'student' | 'landlord',
        name: profile.name || undefined,
        phone: profile.phone || undefined,
        profile_picture_url: profile.profile_picture_url || undefined,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      // Store user data securely
      await this.storeUserData(user);

      return { user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        user: null,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      console.log('🔄 AuthService: Starting sign out...');

      // Sign out from Supabase
      console.log('📤 AuthService: Calling supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ AuthService: Supabase sign out error:', error);
        return { error: error.message };
      }

      console.log('✅ AuthService: Supabase sign out successful');

      // Clear stored user data
      console.log('🗑️ AuthService: Clearing stored user data...');
      await this.clearUserData();
      console.log('✅ AuthService: User data cleared');

      console.log('✅ AuthService: Sign out completed successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ AuthService: Unexpected error in signOut:', error);
      return {
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get current user session
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('🔍 AuthService.getCurrentUser: Starting...');
      
      // First try to get from Supabase session
      console.log('🔍 AuthService.getCurrentUser: Getting Supabase session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 AuthService.getCurrentUser: Session result:', { hasSession: !!session, hasUser: !!session?.user, userId: session?.user?.id });

      if (!session?.user) {
        console.log('🔍 AuthService.getCurrentUser: No session user, trying stored user...');
        // Try to get from secure storage as fallback
        const storedUser = await this.getStoredUser();
        console.log('🔍 AuthService.getCurrentUser: Stored user result:', storedUser ? { id: storedUser.id, email: storedUser.email, role: storedUser.role } : null);
        return storedUser;
      }

      console.log('🔍 AuthService.getCurrentUser: Getting user profile for ID:', session.user.id);
      // Get user profile - rely on database trigger for profile creation
      const profile = await profileService.getProfile(session.user.id);
      console.log('🔍 AuthService.getCurrentUser: Profile result:', profile ? { id: profile.id, email: profile.email, role: profile.role } : null);

      if (!profile) {
        console.log('🔐 getCurrentUser: Profile not found - database trigger may not have run');
        console.log('🔐 getCurrentUser: Returning null to let fallback mechanisms handle this');
        return null;
      }

      // Convert profile to User type
      const user: User = {
        id: profile.id,
        email: profile.email,
        role: profile.role as 'student' | 'landlord',
        name: profile.name || undefined,
        phone: profile.phone || undefined,
        profile_picture_url: profile.profile_picture_url || undefined,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      console.log('🔍 AuthService.getCurrentUser: Created user object:', { id: user.id, email: user.email, role: user.role });

      // Update stored user data
      console.log('🔍 AuthService.getCurrentUser: Storing user data...');
      await this.storeUserData(user);

      console.log('✅ AuthService.getCurrentUser: Returning user:', { id: user.id, email: user.email, role: user.role });
      return user;
    } catch (error) {
      console.error('❌ AuthService.getCurrentUser error:', error);
      return null;
    }
  }

  /**
   * Refresh user session
   */
  async refreshSession(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.session?.user) {
        return { user: null, error: 'No active session' };
      }

      // Get updated user profile
      const profile = await profileService.getProfile(data.session.user.id);

      if (!profile) {
        return { user: null, error: 'User profile not found' };
      }

      // Convert profile to User type
      const user: User = {
        id: profile.id,
        email: profile.email,
        role: profile.role as 'student' | 'landlord',
        name: profile.name || undefined,
        phone: profile.phone || undefined,
        profile_picture_url: profile.profile_picture_url || undefined,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      // Update stored user data
      await this.storeUserData(user);

      return { user, error: null };
    } catch (error) {
      console.error('Refresh session error:', error);
      return {
        user: null,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Store user data securely
   */
  private async storeUserData(user: User): Promise<void> {
    try {
      await secureStorageService.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  /**
   * Get stored user data
   */
  private async getStoredUser(): Promise<User | null> {
    try {
      console.log('🔍 AuthService.getStoredUser: Getting stored user data with key:', USER_DATA_KEY);
      const userData = await secureStorageService.getItem(USER_DATA_KEY);
      console.log('🔍 AuthService.getStoredUser: Raw stored data:', userData);
      
      if (!userData) {
        console.log('🔍 AuthService.getStoredUser: No stored user data found');
        return null;
      }
      
      const parsedUser = JSON.parse(userData);
      console.log('🔍 AuthService.getStoredUser: Parsed user data:', parsedUser ? { id: parsedUser.id, email: parsedUser.email, role: parsedUser.role } : null);
      return parsedUser;
    } catch (error) {
      console.error('❌ AuthService.getStoredUser error:', error);
      return null;
    }
  }

  /**
   * Clear stored user data
   */
  private async clearUserData(): Promise<void> {
    try {
      await secureStorageService.removeItem(USER_DATA_KEY);
      await secureStorageService.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Get user role
   */
  async getUserRole(): Promise<'student' | 'landlord' | null> {
    try {
      const user = await this.getCurrentUser();
      return user?.role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;