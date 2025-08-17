import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock dependencies
jest.mock('../../services/auth', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    refreshSession: jest.fn(),
  },
}));

jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

// Import mocked modules
import { authService } from '../../services/auth';
import { supabase } from '../../services/supabase';

const mockAuthService = authService as any;
const mockSupabase = supabase as any;

// Test component to access auth context
const TestComponent: React.FC = () => {
  useAuth();
  return null;
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Supabase auth state change listener
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
  });

  it('should provide auth context to children', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    });
  });

  it('should initialize with loading state', () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    let authState: any;
    
    const TestComponentWithState: React.FC = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestComponentWithState />
      </AuthProvider>
    );

    expect(authState.loading).toBe(true);
  });

  it('should handle successful sign in', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'student' as const,
      name: 'Test User',
    };

    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.signIn.mockResolvedValue({ user: mockUser, error: null });

    let authState: any;
    
    const TestComponentWithState: React.FC = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestComponentWithState />
      </AuthProvider>
    );

    await act(async () => {
      await authState.signIn({ email: 'test@example.com', password: 'password' });
    });

    expect(authState.user).toEqual(mockUser);
    expect(authState.error).toBeNull();
  });

  it('should handle sign in error', async () => {
    const errorMessage = 'Invalid credentials';

    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.signIn.mockResolvedValue({ user: null, error: errorMessage });

    let authState: any;
    
    const TestComponentWithState: React.FC = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestComponentWithState />
      </AuthProvider>
    );

    await act(async () => {
      await authState.signIn({ email: 'test@example.com', password: 'wrong' });
    });

    expect(authState.user).toBeNull();
    expect(authState.error).toBe(errorMessage);
  });

  it('should handle successful sign up', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'student' as const,
      name: 'Test User',
    };

    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.signUp.mockResolvedValue({ user: mockUser, error: null });

    let authState: any;
    
    const TestComponentWithState: React.FC = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestComponentWithState />
      </AuthProvider>
    );

    await act(async () => {
      await authState.signUp({
        email: 'test@example.com',
        password: 'password',
        role: 'student',
        name: 'Test User',
      });
    });

    expect(authState.user).toEqual(mockUser);
    expect(authState.error).toBeNull();
  });

  it('should handle sign out', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'student' as const,
      name: 'Test User',
    };

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.signOut.mockResolvedValue({ error: null });

    let authState: any;
    
    const TestComponentWithState: React.FC = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestComponentWithState />
      </AuthProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(authState.user).toEqual(mockUser);
    });

    await act(async () => {
      await authState.signOut();
    });

    expect(authState.user).toBeNull();
    expect(authState.error).toBeNull();
  });

  it('should clear error state', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.signIn.mockResolvedValue({ user: null, error: 'Test error' });

    let authState: any;
    
    const TestComponentWithState: React.FC = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestComponentWithState />
      </AuthProvider>
    );

    // Trigger error
    await act(async () => {
      await authState.signIn({ email: 'test@example.com', password: 'wrong' });
    });

    expect(authState.error).toBe('Test error');

    // Clear error
    act(() => {
      authState.clearError();
    });

    expect(authState.error).toBeNull();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});