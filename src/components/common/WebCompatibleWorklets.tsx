import React, { useEffect, useRef } from 'react';
import { View, ViewProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleWorkletsProps extends ViewProps {
  children: React.ReactNode;
  onFrame?: (timestamp: number) => void;
  running?: boolean;
}

const WebCompatibleWorklets: React.FC<WebCompatibleWorkletsProps> = ({ 
  children,
  onFrame,
  running = false,
  style,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}) => {
  const animationRef = useRef<number>();

  // Handle web animation frame
  useEffect(() => {
    if (!isWeb || !running || !onFrame) return;

    const animate = (timestamp: number) => {
      onFrame(timestamp);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [running, onFrame]);

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

  // For web, render div with animation frame handling
  const baseStyle = {
    position: 'relative',
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

export default WebCompatibleWorklets;
