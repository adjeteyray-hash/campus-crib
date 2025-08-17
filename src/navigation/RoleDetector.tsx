import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AuthStack from './AuthStack';
import StudentTabNavigator from './StudentTabNavigator';
import LandlordTabNavigator from './LandlordTabNavigator';

/**
 * RoleDetector component that routes users based on their authentication status and role
 * This component acts as the main router for the application
 */
export const RoleDetector: React.FC = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  
  // Derive authentication status and roles from user
  const isAuthenticated = !!user;
  const isStudent = user?.role === 'student';
  const isLandlord = user?.role === 'landlord';

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.primary.main} />
      </View>
    );
  }

  // If not authenticated, show auth stack
  if (!isAuthenticated || !user) {
    return <AuthStack />;
  }

  // Route based on user role
  if (isStudent) {
    return <StudentTabNavigator />;
  }

  if (isLandlord) {
    return <LandlordTabNavigator />;
  }

  // Fallback - should not happen with proper role validation
  console.warn('User has invalid role:', user.role);
  return <AuthStack />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RoleDetector;