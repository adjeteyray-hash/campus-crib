import React from 'react';
import { View, ViewProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleSVGProps extends ViewProps {
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  viewBox?: string;
}

const WebCompatibleSVG: React.FC<WebCompatibleSVGProps> = ({ 
  children,
  width = 100,
  height = 100,
  viewBox = '0 0 100 100',
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

  // For web, render svg element
  const baseStyle = {
    display: 'block',
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      style={baseStyle}
      data-testid={testID}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      aria-describedby={accessibilityHint}
    >
      {children}
    </svg>
  );
};

export default WebCompatibleSVG;
