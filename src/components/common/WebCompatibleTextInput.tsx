import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleTextInputProps extends TextInputProps {
  placeholder?: string;
}

const WebCompatibleTextInput: React.FC<WebCompatibleTextInputProps> = ({ 
  value,
  onChangeText,
  placeholder,
  style,
  multiline,
  numberOfLines,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}) => {
  if (!isWeb) {
    return (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={style}
        multiline={multiline}
        numberOfLines={numberOfLines}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        {...props}
      />
    );
  }

  // For web, render input or textarea
  const baseStyle = {
    border: '1px solid #ccc',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChangeText?.(e.target.value)}
        placeholder={placeholder}
        style={baseStyle}
        rows={numberOfLines || 3}
        data-testid={testID}
        aria-label={accessibilityLabel}
        role={accessibilityRole}
        aria-describedby={accessibilityHint}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChangeText?.(e.target.value)}
      placeholder={placeholder}
      style={baseStyle}
      data-testid={testID}
      aria-label={accessibilityLabel}
      role={accessibilityRole}
      aria-describedby={accessibilityHint}
    />
  );
};

export default WebCompatibleTextInput;
