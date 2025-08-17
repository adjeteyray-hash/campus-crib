import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { authService } from '../services/auth';
import { supabase, ensureUserProfile } from '../services/supabase';
import type { User, AuthState, LoginCredentials, SignUpCredentials } from '../types/auth';

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SIGN_OUT' };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  let newState: AuthState;
  
  switch (action.type) {
    case 'SET_LOADING':
      newState = { ...state, loading: action.payload };
      break;
    case 'SET_USER':
      newState = { ...state, user: action.payload, loading: false, error: null };
      break;
    case 'SET_ERROR':
      newState = { ...state, error: action.payload, loading: false };
      break;
    case 'SIGN_OUT':
      newState = { user: null, loading: false, error: null };
      break;
    default:
      newState = state;
  }
  
  return newState;
};

// Initial state
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

// Auth context interface
interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in, get their profile
          await handleAuthStateChange();
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          dispatch({ type: 'SIGN_OUT' });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Token refreshed, update user data
          await handleAuthStateChange();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Initialize authentication state
   */
  const initializeAuth = async () => {
    try {
      console.log('🚀 AuthContext: Starting authentication initialization...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('🔍 AuthContext: Calling authService.getCurrentUser()...');
      const user = await authService.getCurrentUser();
      console.log('🔍 AuthContext: getCurrentUser result:', user ? { id: user.id, email: user.email, role: user.role } : null);
      
      console.log('🔄 AuthContext: Dispatching SET_USER action with payload:', user ? { id: user.id, email: user.email, role: user.role } : null);
      dispatch({ type: 'SET_USER', payload: user });
      console.log('✅ AuthContext: Authentication initialization completed');
    } catch (error) {
      console.error('❌ AuthContext: Error initializing auth:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to initialize authentication' 
      });
    }
  };

  /**
   * Handle auth state changes from Supabase
   */
  const handleAuthStateChange = async () => {
    try {
      console.log('🔐 handleAuthStateChange: Getting current user...');
      const user = await authService.getCurrentUser();
      console.log('🔐 handleAuthStateChange: User result:', { hasUser: !!user, userId: user?.id, userRole: user?.role });
      
      // Profile should be created automatically by database trigger
      // No manual profile creation needed
      
      console.log('🔐 handleAuthStateChange: Dispatching SET_USER action with:', { hasUser: !!user, userId: user?.id });
      dispatch({ type: 'SET_USER', payload: user });
      console.log('🔐 handleAuthStateChange: SET_USER action dispatched');
    } catch (error) {
      console.error('Error handling auth state change:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Authentication error' 
      });
    }
  };

  /**
   * Sign in user
   */
  const signIn = async (credentials: LoginCredentials) => {
    try {
      console.log('🔐 signIn: Starting sign in process...');
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log('🔐 signIn: Calling authService.signIn...');
      const { user, error } = await authService.signIn(credentials);
      console.log('🔐 signIn: authService.signIn result:', { hasUser: !!user, hasError: !!error, error });
      
      if (error) {
        console.log('🔐 signIn: Error from authService, dispatching SET_ERROR...');
        dispatch({ type: 'SET_ERROR', payload: error });
        return;
      }

      // Profile should be created automatically by database trigger
      // No manual profile creation needed

      console.log('🔐 signIn: Dispatching SET_USER action with:', { hasUser: !!user, userId: user?.id });
      dispatch({ type: 'SET_USER', payload: user });
      console.log('🔐 signIn: SET_USER action dispatched');
    } catch (error) {
      console.error('Sign in error:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Sign in failed' 
      });
    }
  };

  /**
   * Sign up user
   */
  const signUp = async (credentials: SignUpCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const { user, error } = await authService.signUp(credentials);
      
      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error });
        return;
      }

      // Profile should be created automatically by database trigger
      // No manual profile creation needed

      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Sign up error:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Sign up failed' 
      });
    }
  };

  /**
   * Sign out user
   */
  const signOut = async () => {
    try {
      console.log('🔄 Starting sign out process...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('📤 Calling authService.signOut()...');
      const { error } = await authService.signOut();
      
      if (error) {
        console.error('❌ Sign out error from auth service:', error);
        dispatch({ type: 'SET_ERROR', payload: error });
        return;
      }

      console.log('✅ Sign out successful, dispatching SIGN_OUT action...');
      dispatch({ type: 'SIGN_OUT' });
      console.log('✅ Sign out process completed');
    } catch (error) {
      console.error('❌ Unexpected error in signOut:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Sign out failed' 
      });
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    try {
      console.log('🔄 AuthContext: Starting user refresh...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('🔍 AuthContext: Calling getCurrentUser to refresh user data...');
      const user = await authService.getCurrentUser();
      console.log('🔍 AuthContext: getCurrentUser result:', user ? { id: user.id, email: user.email, role: user.role } : null);
      
      dispatch({ type: 'SET_USER', payload: user });
      console.log('✅ AuthContext: User refresh completed successfully');
    } catch (error) {
      console.error('❌ AuthContext: Refresh user error:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to refresh user data' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;