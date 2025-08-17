import React, { forwardRef, useState } from 'react';
import { TextInput, TextInputProps, ViewStyle } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleTextInputProps extends Omit<TextInputProps, 'style'> {
  style?: ViewStyle;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChangeText?: (text: string) => void;
  onFocus?: (event: any) => void;
  onBlur?: (event: any) => void;
  onSubmitEditing?: (event: any) => void;
  onEndEditing?: (event: any) => void;
  onKeyPress?: (event: any) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoFocus?: boolean;
  blurOnSubmit?: boolean;
  editable?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  placeholderTextColor?: string;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  selectTextOnFocus?: boolean;
  selection?: { start: number; end: number };
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textContentType?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const WebCompatibleTextInput = forwardRef<TextInput, WebCompatibleTextInputProps>(({
  style,
  placeholder,
  value,
  defaultValue,
  onChangeText,
  onFocus,
  onBlur,
  onSubmitEditing,
  onEndEditing,
  onKeyPress,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  autoFocus = false,
  blurOnSubmit = true,
  editable = true,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  placeholderTextColor = '#999',
  returnKeyType = 'done',
  selectTextOnFocus = false,
  selection,
  textAlign = 'left',
  textContentType,
  accessibilityLabel,
  accessibilityHint,
  testID,
  ...props
}, ref) => {
  const [inputValue, setInputValue] = useState(value || defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChangeText?.(newValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !multiline && blurOnSubmit) {
      e.currentTarget.blur();
      onSubmitEditing?.(e);
    }
    onKeyPress?.(e);
  };

  const getInputType = () => {
    if (secureTextEntry) return 'password';
    switch (keyboardType) {
      case 'email-address':
        return 'email';
      case 'phone-pad':
        return 'tel';
      case 'number-pad':
      case 'decimal-pad':
      case 'numeric':
        return 'number';
      default:
        return 'text';
    }
  };

  // Web-specific text input handling
  if (isWeb) {
    const webStyles = {
      ...style,
      width: '100%',
      padding: 12,
      border: `1px solid ${isFocused ? '#667eea' : '#ddd'}`,
      borderRadius: 8,
      fontSize: 16,
      lineHeight: 1.5,
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      boxShadow: isFocused ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none',
      backgroundColor: editable ? '#fff' : '#f8f9fa',
      color: editable ? '#333' : '#666',
      cursor: editable ? 'text' : 'not-allowed',
      resize: multiline ? 'vertical' : 'none',
      minHeight: multiline ? numberOfLines * 24 : 48,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    };

    if (multiline) {
      return (
        <textarea
          ref={ref as any}
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={!editable}
          maxLength={maxLength}
          rows={numberOfLines}
          style={webStyles}
          aria-label={accessibilityLabel}
          aria-describedby={accessibilityHint}
          data-testid={testID}
          autoFocus={autoFocus}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect ? 'on' : 'off'}
          spellCheck={autoCorrect}
          {...props}
        />
      );
    }

    return (
      <input
        ref={ref as any}
        type={getInputType()}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={!editable}
        maxLength={maxLength}
        style={webStyles}
        aria-label={accessibilityLabel}
        aria-describedby={accessibilityHint}
        data-testid={testID}
        autoFocus={autoFocus}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect ? 'on' : 'off'}
        spellCheck={autoCorrect}
        {...props}
      />
    );
  }

  // Native text input handling
  return (
    <TextInput
      ref={ref}
      style={style}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChangeText={onChangeText}
      onFocus={onFocus}
      onBlur={onBlur}
      onSubmitEditing={onSubmitEditing}
      onEndEditing={onEndEditing}
      onKeyPress={onKeyPress}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      autoFocus={autoFocus}
      blurOnSubmit={blurOnSubmit}
      editable={editable}
      maxLength={maxLength}
      multiline={multiline}
      numberOfLines={numberOfLines}
      placeholderTextColor={placeholderTextColor}
      returnKeyType={returnKeyType}
      selectTextOnFocus={selectTextOnFocus}
      selection={selection}
      textAlign={textAlign}
      textContentType={textContentType}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
      {...props}
    />
  );
});

WebCompatibleTextInput.displayName = 'WebCompatibleTextInput';

export default WebCompatibleTextInput;
