import React from 'react';
import { View, ViewProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleReanimatedProps extends ViewProps {
  children: React.ReactNode;
  entering?: any;
  exiting?: any;
  layout?: any;
}

const WebCompatibleReanimated: React.FC<WebCompatibleReanimatedProps> = ({ 
  children,
  entering,
  exiting,
  layout,
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

  // For web, render div with CSS transitions
  const getWebStyle = () => {
    const baseStyle = {
      transition: 'all 0.3s ease',
    };

    // Add entering animation
    if (entering) {
      baseStyle.opacity = '0';
      baseStyle.transform = 'translateY(20px)';
    }

    // Add exiting animation
    if (exiting) {
      baseStyle.opacity = '0';
      baseStyle.transform = 'translateY(-20px)';
    }

    // Add layout animation
    if (layout) {
      baseStyle.transition = 'all 0.3s ease, transform 0.3s ease';
    }

    return baseStyle;
  };

  return (
    <div
      style={getWebStyle()}
      data-testid={testID}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      aria-describedby={accessibilityHint}
    >
      {children}
    </div>
  );
};

export default WebCompatibleReanimated;
