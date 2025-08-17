import React, { useEffect } from 'react';
import { SafeAreaProvider as NativeSafeAreaProvider } from 'react-native-safe-area-context';
import { isWeb } from '../../utils/platform';

interface WebCompatibleSafeAreaProviderProps {
  children: React.ReactNode;
}

const WebCompatibleSafeAreaProvider: React.FC<WebCompatibleSafeAreaProviderProps> = ({ 
  children 
}) => {
  // Handle web safe area (CSS variables)
  useEffect(() => {
    if (!isWeb) return;

    // Set CSS variables for safe area insets
    const setSafeAreaVariables = () => {
      const root = document.documentElement;
      root.style.setProperty('--safe-area-top', 'env(safe-area-inset-top, 0px)');
      root.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom, 0px)');
      root.style.setProperty('--safe-area-left', 'env(safe-area-inset-left, 0px)');
      root.style.setProperty('--safe-area-right', 'env(safe-area-inset-right, 0px)');
    };

    setSafeAreaVariables();
    
    // Update on resize
    window.addEventListener('resize', setSafeAreaVariables);
    return () => window.removeEventListener('resize', setSafeAreaVariables);
  }, []);

  // Use native SafeAreaProvider for native platforms
  if (!isWeb) {
    return (
      <NativeSafeAreaProvider>
        {children}
      </NativeSafeAreaProvider>
    );
  }

  // For web, just render children with CSS variables available
  return <>{children}</>;
};

export default WebCompatibleSafeAreaProvider;
