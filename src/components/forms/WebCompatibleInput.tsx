import React, { useState, forwardRef } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  labelStyle?: ViewStyle;
  errorStyle?: ViewStyle;
  required?: boolean;
  helperText?: string;
}

export const WebCompatibleInput = forwardRef<TextInput, WebCompatibleInputProps>(({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  required = false,
  helperText,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState(props.value || props.defaultValue || '');

  const handleFocus = (e: any) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleChangeText = (text: string) => {
    setValue(text);
    props.onChangeText?.(text);
  };

  const styles = createStyles(error, isFocused);

  // Web-specific input handling
  if (isWeb) {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <label style={styles.label}>
            {label}
            {required && <span style={styles.required}> *</span>}
          </label>
        )}
        
        <input
          ref={ref as any}
          value={value}
          onChange={(e) => handleChangeText(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            ...styles.input,
            ...inputStyle,
            borderColor: error ? '#dc3545' : isFocused ? '#667eea' : '#ced4da',
            boxShadow: isFocused ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none',
          }}
          {...props}
        />
        
        {helperText && !error && (
          <Text style={[styles.helperText, helperText ? styles.helperTextVisible : styles.helperTextHidden]}>
            {helperText}
          </Text>
        )}
        
        {error && (
          <Text style={[styles.errorText, errorStyle]}>
            {error}
          </Text>
        )}
      </View>
    );
  }

  // Native input handling
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <TextInput
        ref={ref}
        style={[
          styles.input,
          inputStyle,
          { borderColor: error ? '#dc3545' : isFocused ? '#667eea' : '#ced4da' }
        ]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChangeText={handleChangeText}
        value={value}
        {...props}
      />
      
      {helperText && !error && (
        <Text style={[styles.helperText, helperText ? styles.helperTextVisible : styles.helperTextHidden]}>
          {helperText}
        </Text>
      )}
      
      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
});

const createStyles = (error: string | undefined, isFocused: boolean) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
    display: 'block',
  },
  required: {
    color: '#dc3545',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#495057',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  helperText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  helperTextVisible: {
    opacity: 1,
  },
  helperTextHidden: {
    opacity: 0,
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    marginTop: 4,
  },
});

WebCompatibleInput.displayName = 'WebCompatibleInput';

export default WebCompatibleInput;
