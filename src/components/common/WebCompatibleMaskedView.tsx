import React from 'react';
import { View, ViewProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleMaskedViewProps extends ViewProps {
  children: React.ReactNode;
  maskElement?: React.ReactNode;
  maskImage?: string;
}

const WebCompatibleMaskedView: React.FC<WebCompatibleMaskedViewProps> = ({ 
  children,
  maskElement,
  maskImage,
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

  // For web, render with CSS mask
  const getMaskStyle = () => {
    const baseStyle = {
      WebkitMaskImage: maskImage ? `url(${maskImage})` : 'none',
      maskImage: maskImage ? `url(${maskImage})` : 'none',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
    };

    return baseStyle;
  };

  if (maskImage) {
    return (
      <div
        style={{
          ...getMaskStyle(),
          ...style,
        }}
        data-testid={testID}
        role={accessibilityRole}
        aria-label={accessibilityLabel}
        aria-describedby={accessibilityHint}
      >
        {children}
      </div>
    );
  }

  if (maskElement) {
    return (
      <div
        style={{
          position: 'relative',
          ...style,
        }}
        data-testid={testID}
        role={accessibilityRole}
        aria-label={accessibilityLabel}
        aria-describedby={accessibilityHint}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
          {maskElement}
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {children}
        </div>
      </div>
    );
  }

  // No mask specified, render normally
  return (
    <div
      style={style}
      data-testid={testID}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      aria-describedby={accessibilityHint}
    >
      {children}
    </div>
  );
};

export default WebCompatibleMaskedView;
