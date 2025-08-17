import React from 'react';
import { View, ViewProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleAsyncStorageProps extends ViewProps {
  children: React.ReactNode;
}

const WebCompatibleAsyncStorage: React.FC<WebCompatibleAsyncStorageProps> = ({ 
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}) => {
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

  // For web, just render children (localStorage is available globally)
  const baseStyle = {
    display: 'block',
  };

  return (
    <div
      style={baseStyle}
      data-testid={testID}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      aria-describedby={accessibilityHint}
    >
      {children}
    </div>
  );
};

export default WebCompatibleAsyncStorage;
