import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

const WebCompatibleScrollView: React.FC<WebCompatibleScrollViewProps> = ({ 
  children, 
  style,
  contentContainerStyle,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}) => {
  if (!isWeb) {
    return (
      <ScrollView
        style={style}
        contentContainerStyle={contentContainerStyle}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  // For web, render div with scroll
  const baseStyle = {
    overflow: 'auto',
    width: '100%',
    height: '100%',
  };

  const webStyle = typeof style === 'object' && style !== null
    ? { ...baseStyle, ...(style as React.CSSProperties) }
    : baseStyle;
  const contentStyle = typeof contentContainerStyle === 'object' && contentContainerStyle !== null
    ? (contentContainerStyle as React.CSSProperties)
    : {};

  return (
    <div
      style={webStyle}
      data-testid={testID}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      aria-describedby={accessibilityHint}
    >
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

export default WebCompatibleScrollView;
