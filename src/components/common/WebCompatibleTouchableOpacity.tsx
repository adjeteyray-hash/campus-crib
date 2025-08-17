import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleTouchableOpacityProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

const WebCompatibleTouchableOpacity: React.FC<WebCompatibleTouchableOpacityProps> = ({ 
  children, 
  style, 
  onPress, 
  disabled, 
  activeOpacity = 0.7,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}) => {
  if (!isWeb) {
    return (
      <TouchableOpacity 
        style={style} 
        onPress={onPress} 
        disabled={disabled}
        activeOpacity={activeOpacity}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // For web, render div with mouse/touch events
  const handleClick = (e: React.MouseEvent) => {
    if (!disabled && onPress) {
      onPress(e as any);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && onPress) {
        onPress(e as any);
      }
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
        ...style,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid={testID}
      aria-label={accessibilityLabel}
      aria-describedby={accessibilityHint}
    >
      {children}
    </div>
  );
};

export default WebCompatibleTouchableOpacity;
