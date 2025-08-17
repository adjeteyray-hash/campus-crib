import { AuthService } from '../auth';

// Mock dependencies
jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      refreshSession: jest.fn(),
    },
  },
  profileService: {
    createProfile: jest.fn(),
    getProfile: jest.fn(),
  },
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Import mocked modules
import { supabase, profileService } from '../supabase';
import * as SecureStore from 'expo-secure-store';

const mockSupabase = supabase as any;
const mockProfileService = profileService as any;
const mockSecureStore = SecureStore as any;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
      role: 'student' as const,
      name: 'Test User',
    };

    it('should successfully sign up a new user', async () => {
      const mockAuthUser = { id: 'user-123', email: 'test@example.com' };
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student' as const,
        name: 'Test User',
        phone: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockAuthUser, session: null },
        error: null,
      });

      mockProfileService.createProfile.mockResolvedValue(mockProfile);
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      const result = await authService.signUp(mockCredentials);

      expect(result.error).toBeNull();
      expect(result.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
        name: 'Test User',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockProfileService.createProfile).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
        name: 'Test User',
        phone: undefined,
      });
    });

    it('should handle auth signup error', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already exists' },
      });

      const result = await authService.signUp(mockCredentials);

      expect(result.error).toBe('Email already exists');
      expect(result.user).toBeNull();
    });

    it('should handle profile creation error', async () => {
      const mockAuthUser = { id: 'user-123', email: 'test@example.com' };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockAuthUser, session: null },
        error: null,
      });

      mockProfileService.createProfile.mockResolvedValue(null);

      const result = await authService.signUp(mockCredentials);

      expect(result.error).toBe('Failed to create user profile');
      expect(result.user).toBeNull();
    });
  });

  describe('signIn', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully sign in a user', async () => {
      const mockAuthUser = { id: 'user-123', email: 'test@example.com' };
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student' as const,
        name: 'Test User',
        phone: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockAuthUser, session: {} },
        error: null,
      });

      mockProfileService.getProfile.mockResolvedValue(mockProfile);
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      const result = await authService.signIn(mockCredentials);

      expect(result.error).toBeNull();
      expect(result.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
        name: 'Test User',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });
    });

    it('should handle invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const result = await authService.signIn(mockCredentials);

      expect(result.error).toBe('Invalid credentials');
      expect(result.user).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      const result = await authService.signOut();

      expect(result.error).toBeNull();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      const result = await authService.signOut();

      expect(result.error).toBe('Sign out failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user from session', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student' as const,
        name: 'Test User',
        phone: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockProfileService.getProfile.mockResolvedValue(mockProfile);
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      const result = await authService.getCurrentUser();

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
        name: 'Test User',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });
    });

    it('should return null when no session exists', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});