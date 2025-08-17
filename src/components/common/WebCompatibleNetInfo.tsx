import React, { useEffect, useState } from 'react';
import { View, ViewProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleNetInfoProps extends ViewProps {
  children: React.ReactNode;
  onConnectionChange?: (isConnected: boolean) => void;
}

const WebCompatibleNetInfo: React.FC<WebCompatibleNetInfoProps> = ({ 
  children,
  onConnectionChange,
  style,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}) => {
  const [isOnline, setIsOnline] = useState(true);

  // Handle web network status
  useEffect(() => {
    if (!isWeb) return;

    const handleOnline = () => {
      setIsOnline(true);
      onConnectionChange?.(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      onConnectionChange?.(false);
    };

    // Set initial status
    setIsOnline(navigator.onLine);
    onConnectionChange?.(navigator.onLine);

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onConnectionChange]);

  if (!isWeb) {
    return (
      <View 
        style={style} 
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        {children}
      </View>
    );
  }

  // For web, render children with network status available
  const baseStyle = {
    position: 'relative',
  };

  return (
    <div
      style={baseStyle as React.CSSProperties}
      data-testid={testID}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      aria-describedby={accessibilityHint}
      data-online={isOnline}
    >
      {children}
    </div>
  );
};

export default WebCompatibleNetInfo;
