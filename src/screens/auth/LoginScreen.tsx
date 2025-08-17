import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validation';
import { ACCESSIBLE_COLORS, ACCESSIBILITY_LABELS, ACCESSIBILITY_HINTS } from '../../utils/accessibility';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useTheme } from '../../contexts/ThemeContext';

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { signIn, loading, error, clearError } = useAuth();
  const { announceToScreenReader, announceSuccess, announceError } = useAccessibility();
  const { theme } = useTheme();
  
  // Refs for accessibility focus management
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const submitButtonRef = useRef<TouchableOpacity>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });
  
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear global error
    if (error) {
      clearError();
    }
  };

  // Handle input blur (touched state)
  const handleInputBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Validate individual field
  const validateField = (field: keyof typeof formData) => {
    let errorMessage = '';
    
    switch (field) {
      case 'email':
        errorMessage = validateEmail(formData.email) || '';
        break;
      case 'password':
        errorMessage = validatePassword(formData.password) || '';
        break;
    }
    
    setFormErrors(prev => ({ ...prev, [field]: errorMessage }));
    return errorMessage === '';
  };

  // Validate entire form
  const validateForm = () => {
    const emailValid = validateField('email');
    const passwordValid = validateField('password');
    
    return emailValid && passwordValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await signIn({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      announceSuccess('login');
    } catch {
      announceError('loginFailed');
      Alert.alert(
        'Login Failed',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Navigate to sign up screen
  const handleNavigateToSignUp = () => {
    navigation.navigate('SignUp');
  };

  // Move styles inside component to access theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 40,
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: 'center',
    },
    form: {
      flex: 1,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border.input,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: theme.interactive.input.background,
      color: theme.interactive.input.text,
    },
    inputError: {
      borderColor: theme.error.main,
    },
    roleContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    roleButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.border.input,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: theme.interactive.input.background,
    },
    roleButtonActive: {
      borderColor: theme.primary.main,
      backgroundColor: theme.primary.main,
    },
    roleButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.secondary,
    },
    roleButtonTextActive: {
      color: theme.primary.text,
    },
    errorText: {
      fontSize: 14,
      color: theme.error.main,
      marginTop: 4,
    },
    globalErrorContainer: {
      backgroundColor: theme.error.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
    },
    globalErrorText: {
      fontSize: 14,
      color: theme.error.text,
      textAlign: 'center',
    },
    submitButton: {
      backgroundColor: theme.primary.main,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    submitButtonDisabled: {
      backgroundColor: theme.interactive.button.disabled,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary.text,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    footerText: {
      fontSize: 16,
      color: theme.text.secondary,
    },
    footerLink: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.link,
      marginLeft: 4,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text 
              style={styles.title}
              accessible={true}
              accessibilityRole="header"
            >
              Welcome Back
            </Text>
            <Text 
              style={styles.subtitle}
              accessible={true}
              accessibilityRole="text"
            >
              Sign in to your CampusCrib account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text 
                style={styles.label}
                accessible={true}
                accessibilityRole="text"
              >
                Email
              </Text>
              <TextInput
                ref={emailInputRef}
                style={[
                  styles.input,
                  touched.email && formErrors.email ? styles.inputError : null,
                ]}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                onBlur={() => handleInputBlur('email')}
                placeholder="Enter your email"
                placeholderTextColor={ACCESSIBLE_COLORS.text.disabled}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                accessible={true}
                accessibilityLabel={ACCESSIBILITY_LABELS.forms.emailInput}
                accessibilityHint={ACCESSIBILITY_HINTS.forms.emailInput}
                accessibilityRole="text"
                testID="email-input"
              />
              {touched.email && formErrors.email ? (
                <Text 
                  style={styles.errorText}
                  accessible={true}
                  accessibilityRole="alert"
                >
                  {formErrors.email}
                </Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text 
                style={styles.label}
                accessible={true}
                accessibilityRole="text"
              >
                Password
              </Text>
              <TextInput
                ref={passwordInputRef}
                style={[
                  styles.input,
                  touched.password && formErrors.password ? styles.inputError : null,
                ]}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                onBlur={() => handleInputBlur('password')}
                placeholder="Enter your password"
                placeholderTextColor={ACCESSIBLE_COLORS.text.disabled}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                accessible={true}
                accessibilityLabel={ACCESSIBILITY_LABELS.forms.passwordInput}
                accessibilityHint={ACCESSIBILITY_HINTS.forms.passwordInput}
                accessibilityRole="text"
                testID="password-input"
              />
              {touched.password && formErrors.password ? (
                <Text 
                  style={styles.errorText}
                  accessible={true}
                  accessibilityRole="alert"
                >
                  {formErrors.password}
                </Text>
              ) : null}
            </View>

            {/* Global Error */}
            {error ? (
              <View 
                style={styles.globalErrorContainer}
                accessible={true}
                accessibilityRole="alert"
              >
                <Text 
                  style={styles.globalErrorText}
                  accessible={true}
                  accessibilityRole="text"
                >
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              ref={submitButtonRef}
              style={[styles.submitButton, loading ? styles.submitButtonDisabled : null]}
              onPress={handleSubmit}
              disabled={loading}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={ACCESSIBILITY_LABELS.forms.submitButton}
              accessibilityHint={ACCESSIBILITY_HINTS.forms.submitButton}
              testID="submit-button"
            >
              {loading ? (
                <ActivityIndicator color={ACCESSIBLE_COLORS.primary.text} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text 
              style={styles.footerText}
              accessible={true}
              accessibilityRole="text"
            >
              Don't have an account? 
            </Text>
            <TouchableOpacity 
              onPress={handleNavigateToSignUp} 
              disabled={loading}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Navigate to sign up screen"
              accessibilityHint="Double tap to create a new account"
            >
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;