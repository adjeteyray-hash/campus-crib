import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppError, getErrorMessage } from '../../types/error';
import { useTheme } from '../../contexts/ThemeContext';

interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
  showDismiss?: boolean;
  style?: any;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showRetry = true,
  showDismiss = false,
  style,
}) => {
  const { theme } = useTheme();
  const errorMessage = getErrorMessage(error);

  // Define styles inside component to access theme
  const styles = StyleSheet.create({
    container: {
      padding: 20,
      alignItems: 'center',
      backgroundColor: theme.background.secondary,
      borderRadius: 8,
      margin: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.error.main,
      marginBottom: 8,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 6,
      minWidth: 100,
      alignItems: 'center',
    },
    retryButton: {
      backgroundColor: theme.primary.main,
    },
    retryButtonText: {
      color: theme.primary.text,
      fontSize: 16,
      fontWeight: '600',
    },
    dismissButton: {
      backgroundColor: theme.secondary.main,
    },
    dismissButtonText: {
      color: theme.secondary.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={[styles.container, style]} testID="error-display">
      <Text style={styles.title}>Oops! Something went wrong</Text>
      <Text style={styles.message}>{errorMessage}</Text>
      
      <View style={styles.buttonContainer}>
        {showRetry && onRetry && (
          <TouchableOpacity 
            style={[styles.button, styles.retryButton]} 
            onPress={onRetry}
            testID="retry-button"
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
        
        {showDismiss && onDismiss && (
          <TouchableOpacity 
            style={[styles.button, styles.dismissButton]} 
            onPress={onDismiss}
            testID="dismiss-button"
          >
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};