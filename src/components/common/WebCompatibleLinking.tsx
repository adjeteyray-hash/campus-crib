import React from 'react';
import { View, ViewProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleLinkingProps extends ViewProps {
  children: React.ReactNode;
  url?: string;
  onPress?: () => void;
}

const WebCompatibleLinking: React.FC<WebCompatibleLinkingProps> = ({ 
  children,
  url,
  onPress,
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

  // For web, render with link handling
  const handleClick = () => {
    if (onPress) {
      onPress();
    } else if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const baseStyle = {
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
  };

  if (url || onPress) {
    return (
      <a
        href={url}
        onClick={handleClick}
        style={baseStyle}
        data-testid={testID}
        role={accessibilityRole}
        aria-label={accessibilityLabel}
        aria-describedby={accessibilityHint}
      >
        {children}
      </a>
    );
  }

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

export default WebCompatibleLinking;
