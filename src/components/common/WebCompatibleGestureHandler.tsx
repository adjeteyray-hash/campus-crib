import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { isWeb } from '../../utils/platform';

interface WebCompatibleGestureHandlerProps {
  children: React.ReactNode;
}

const WebCompatibleGestureHandler: React.FC<WebCompatibleGestureHandlerProps> = ({ 
  children 
}) => {
  // Use native GestureHandlerRootView for native platforms
  if (!isWeb) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        {children}
      </GestureHandlerRootView>
    );
  }

  // For web, just render children (gesture handling is done via touch events)
  return <>{children}</>;
};

export default WebCompatibleGestureHandler;
