import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Text } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

const WebCompatibleButton: React.FC<WebCompatibleButtonProps> = ({ 
  title,
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled,
  style,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}) => {
  if (!isWeb) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={style}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        <Text>{title}</Text>
      </TouchableOpacity>
    );
  }

  // For web, render button element
  const getButtonStyles = () => {
    const baseStyles = {
      border: 'none',
      borderRadius: 6,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none',
    };

    const sizeStyles = {
      small: { padding: '8px 16px', fontSize: 14 },
      medium: { padding: '12px 24px', fontSize: 16 },
      large: { padding: '16px 32px', fontSize: 18 },
    };

    const variantStyles = {
      primary: {
        backgroundColor: disabled ? '#ccc' : '#007AFF',
        color: 'white',
      },
      secondary: {
        backgroundColor: disabled ? '#ccc' : '#6c757d',
        color: 'white',
      },
      outline: {
        backgroundColor: 'transparent',
        color: disabled ? '#ccc' : '#007AFF',
        border: `2px solid ${disabled ? '#ccc' : '#007AFF'}`,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: disabled ? '#ccc' : '#007AFF',
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.6 : 1,
    };
  };

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
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      style={getButtonStyles()}
      data-testid={testID}
      aria-label={accessibilityLabel}
      role={accessibilityRole}
      aria-describedby={accessibilityHint}
    >
      {title}
    </button>
  );
};

export default WebCompatibleButton;
