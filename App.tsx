// Import dependencies
import 'react-native-gesture-handler';
import React, { Suspense, lazy } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import THEME from './src/utils/theme';
import { Platform } from 'react-native';

// Simple loading component that doesn't depend on theme context
const LoadingFallback = () => (
  <View style={[styles.loadingContainer, { backgroundColor: THEME.background.primary }]}>
    <ActivityIndicator size="large" color={THEME.primary.main} />
  </View>
);

// Lazy load components
const AuthProvider = lazy(() => import('./src/contexts/AuthContext').then(module => ({ default: module.AuthProvider })));
const RoleDetector = lazy(() => import('./src/navigation/RoleDetector').then(module => ({ default: module.RoleDetector })));
const WebNavigationWrapper = lazy(() => import('./src/navigation/WebNavigationWrapper').then(module => ({ default: module.WebNavigationWrapper })));

// Themed app component that uses theme context
const ThemedApp = () => {
  const { theme, isLight } = useTheme();

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.background.primary }}>
      <StatusBar style={isLight ? 'dark' : 'light'} backgroundColor={theme.background.primary} />
      <NavigationContainer>
        <Suspense fallback={<LoadingFallback />}>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              {Platform.OS === 'web' ? (
                <WebNavigationWrapper>
                  <RoleDetector />
                </WebNavigationWrapper>
              ) : (
                <RoleDetector />
              )}
            </Suspense>
          </AuthProvider>
        </Suspense>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});