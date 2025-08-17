import React from 'react';
import { View, ViewProps, KeyboardAvoidingView, Platform } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleFormProps extends ViewProps {
  children: React.ReactNode;
  onSubmit?: () => void;
}

const WebCompatibleForm: React.FC<WebCompatibleFormProps> = ({ 
  children, 
  onSubmit,
  style,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}) => {
  if (!isWeb) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={style}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        {children}
      </KeyboardAvoidingView>
    );
  }

  // For web, render form element
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  const baseStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={baseStyle}
      data-testid={testID}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      aria-describedby={accessibilityHint}
    >
      {children}
    </form>
  );
};

export default WebCompatibleForm;
