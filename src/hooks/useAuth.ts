import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';


/**
 * Custom hook for accessing authentication context
 * Provides convenient methods and computed values for auth state
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshUser,
    clearError,
  } = context;

  // Computed values
  const isAuthenticated = !!user;
  const isStudent = user?.role === 'student';
  const isLandlord = user?.role === 'landlord';
  const userRole = user?.role || null;

  // Helper methods
  const hasRole = (role: 'student' | 'landlord'): boolean => {
    return user?.role === role;
  };

  const getUserDisplayName = (): string => {
    if (!user) return '';
    return user.name || user.email.split('@')[0] || 'User';
  };

  const isCurrentUser = (userId: string): boolean => {
    return user?.id === userId;
  };

  return {
    // State
    user,
    loading,
    error,
    
    // Computed values
    isAuthenticated,
    isStudent,
    isLandlord,
    userRole,
    
    // Actions
    signIn,
    signUp,
    signOut,
    refreshUser,
    clearError,
    
    // Helper methods
    hasRole,
    getUserDisplayName,
    isCurrentUser,
  };
};

export default useAuth;