import React, { useEffect } from 'react';
import { NavigationContainer as NativeNavigationContainer } from '@react-navigation/native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleNavigationContainerProps {
  children: React.ReactNode;
  onStateChange?: (state: any) => void;
  onReady?: () => void;
}

const WebCompatibleNavigationContainer: React.FC<WebCompatibleNavigationContainerProps> = ({ 
  children,
  onStateChange,
  onReady,
}) => {
  // Handle web scroll restoration
  useEffect(() => {
    if (!isWeb) return;

    // Restore scroll position when navigating back
    const handlePopState = () => {
      const scrollPosition = sessionStorage.getItem('scrollPosition');
      if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition));
      }
    };

    // Save scroll position before navigation
    const handleBeforeUnload = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Use native NavigationContainer for native platforms
  if (!isWeb) {
    return (
      <NativeNavigationContainer
        onStateChange={onStateChange}
        onReady={onReady}
      >
        {children}
      </NativeNavigationContainer>
    );
  }

  // For web, just render children with scroll restoration
  return <>{children}</>;
};

export default WebCompatibleNavigationContainer;
