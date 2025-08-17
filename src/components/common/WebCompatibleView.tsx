import React from 'react';
import { View, ViewProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleViewProps extends ViewProps {
  children?: React.ReactNode;
}

const WebCompatibleView: React.FC<WebCompatibleViewProps> = ({ 
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

  // For web, render div with basic styling
  const baseStyle = { display: 'flex', flexDirection: 'column' };
  
  return (
    <div
      style={baseStyle as React.CSSProperties}
      data-testid={testID}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      aria-describedby={accessibilityHint}
    >
      {children}
    </div>
  );
};

export default WebCompatibleView;
