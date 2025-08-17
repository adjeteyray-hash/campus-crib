import React, { useState } from 'react';
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
import { validateEmail, validatePassword, validateName, validatePhone } from '../../utils/validation';
import { useTheme } from '../../contexts/ThemeContext';

interface SignUpScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const { signUp, loading, error, clearError } = useAuth();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'student' as 'student' | 'landlord',
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    name: false,
    phone: false,
  });

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Clear global error
    if (error) {
      clearError();
    }
  };

  // Handle role selection
  const handleRoleSelect = (role: 'student' | 'landlord') => {
    setFormData(prev => ({ ...prev, role }));
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
      case 'confirmPassword':
        if (formData.confirmPassword !== formData.password) {
          errorMessage = 'Passwords do not match';
        }
        break;
      case 'name':
        errorMessage = validateName(formData.name) || '';
        break;
      case 'phone':
        if (formData.phone) {
          errorMessage = validatePhone(formData.phone) || '';
        }
        break;
    }

    if (field !== 'role') {
      setFormErrors(prev => ({ ...prev, [field]: errorMessage }));
    }
    return errorMessage === '';
  };

  // Validate entire form
  const validateForm = () => {
    const emailValid = validateField('email');
    const passwordValid = validateField('password');
    const confirmPasswordValid = validateField('confirmPassword');
    const nameValid = validateField('name');
    const phoneValid = validateField('phone');

    return emailValid && passwordValid && confirmPasswordValid && nameValid && phoneValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      name: true,
      phone: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
      });
    } catch {
      Alert.alert(
        'Sign Up Failed',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Navigate to login screen
  const handleNavigateToLogin = () => {
    navigation.navigate('Login');
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join CampusCrib today</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Role Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>I am a</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'student' ? styles.roleButtonActive : null,
                  ]}
                  onPress={() => handleRoleSelect('student')}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === 'student' ? styles.roleButtonTextActive : null,
                    ]}
                  >
                    Student
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'landlord' ? styles.roleButtonActive : null,
                  ]}
                  onPress={() => handleRoleSelect('landlord')}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === 'landlord' ? styles.roleButtonTextActive : null,
                    ]}
                  >
                    Landlord
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  touched.name && formErrors.name ? styles.inputError : null,
                ]}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                onBlur={() => handleInputBlur('name')}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
              />
              {touched.name && formErrors.name ? (
                <Text style={styles.errorText}>{formErrors.name}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  touched.email && formErrors.email ? styles.inputError : null,
                ]}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                onBlur={() => handleInputBlur('email')}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {touched.email && formErrors.email ? (
                <Text style={styles.errorText}>{formErrors.email}</Text>
              ) : null}
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number (Optional)</Text>
              <TextInput
                style={[
                  styles.input,
                  touched.phone && formErrors.phone ? styles.inputError : null,
                ]}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                onBlur={() => handleInputBlur('phone')}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {touched.phone && formErrors.phone ? (
                <Text style={styles.errorText}>{formErrors.phone}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  touched.password && formErrors.password ? styles.inputError : null,
                ]}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                onBlur={() => handleInputBlur('password')}
                placeholder="Create a password"
                placeholderTextColor="#999"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {touched.password && formErrors.password ? (
                <Text style={styles.errorText}>{formErrors.password}</Text>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  touched.confirmPassword && formErrors.confirmPassword ? styles.inputError : null,
                ]}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                onBlur={() => handleInputBlur('confirmPassword')}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {touched.confirmPassword && formErrors.confirmPassword ? (
                <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* Global Error */}
            {error ? (
              <View style={styles.globalErrorContainer}>
                <Text style={styles.globalErrorText}>{error}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading ? styles.submitButtonDisabled : null]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleNavigateToLogin} disabled={loading}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;