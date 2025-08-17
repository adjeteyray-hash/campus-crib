import React from 'react';
import { Text, TextProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleTextProps extends TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label';
}

const WebCompatibleText: React.FC<WebCompatibleTextProps> = ({ 
  children, 
  variant = 'span',
  style, 
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}) => {
  if (!isWeb) {
    return (
      <Text 
        style={style} 
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        {children}
      </Text>
    );
  }

  // For web, render appropriate HTML semantic tags with basic styling
  const baseStyle = { margin: 0, padding: 0 };
  
  switch (variant) {
    case 'h1':
      return <h1 style={baseStyle} data-testid={testID} aria-label={accessibilityLabel}>{children}</h1>;
    case 'h2':
      return <h2 style={baseStyle} data-testid={testID} aria-label={accessibilityLabel}>{children}</h2>;
    case 'h3':
      return <h3 style={baseStyle} data-testid={testID} aria-label={accessibilityLabel}>{children}</h3>;
    case 'h4':
      return <h4 style={baseStyle} data-testid={testID} aria-label={accessibilityLabel}>{children}</h4>;
    case 'h5':
      return <h5 style={baseStyle} data-testid={testID} aria-label={accessibilityLabel}>{children}</h5>;
    case 'h6':
      return <h6 style={baseStyle} data-testid={testID} aria-label={accessibilityLabel}>{children}</h6>;
    case 'p':
      return <p style={baseStyle} data-testid={testID} aria-label={accessibilityLabel}>{children}</p>;
    case 'label':
      return <label style={baseStyle} data-testid={testID} aria-label={accessibilityLabel}>{children}</label>;
    default:
      return <span style={baseStyle} data-testid={testID} aria-label={accessibilityLabel}>{children}</span>;
  }
};

export default WebCompatibleText;
