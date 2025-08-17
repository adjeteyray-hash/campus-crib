import React from 'react';
import { View, ViewProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleCardProps extends ViewProps {
  children: React.ReactNode;
  elevation?: number;
}

const WebCompatibleCard: React.FC<WebCompatibleCardProps> = ({ 
  children, 
  elevation = 2,
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

  // For web, render div with card styling
  const baseStyle = {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    boxShadow: `0 ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.1)`,
    border: '1px solid #e0e0e0',
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

export default WebCompatibleCard;
