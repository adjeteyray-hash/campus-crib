import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppError } from '../../types/error';
import { ACCESSIBILITY_LABELS, ACCESSIBILITY_HINTS } from '../../utils/accessibility';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: AppError;
  retryCount: number;
}

// Wrapper component to use hooks in class component
const ErrorBoundaryContent: React.FC<{ error: AppError; retryCount: number; onRetry: () => void }> = ({ error, retryCount, onRetry }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.background.secondary,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.error.main,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      textAlign: 'center',
      color: theme.text.secondary,
      marginBottom: 8,
      lineHeight: 22,
    },
    details: {
      fontSize: 12,
      textAlign: 'center',
      color: theme.text.disabled,
      marginBottom: 20,
      fontFamily: 'monospace',
    },
    retryButton: {
      backgroundColor: theme.primary.main,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    retryButtonText: {
      color: theme.primary.text,
      fontSize: 16,
      fontWeight: '600',
    },
    maxRetriesText: {
      fontSize: 14,
      textAlign: 'center',
      color: theme.error.main,
      marginTop: 16,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.container} testID="error-boundary">
      <Text 
        style={styles.title}
        accessible={true}
        accessibilityRole="header"
      >
        Something went wrong
      </Text>
      <Text 
        style={styles.message}
        accessible={true}
        accessibilityRole="text"
      >
        {error.message || 'An unexpected error occurred'}
      </Text>
      <Text 
        style={styles.details}
        accessible={true}
        accessibilityRole="text"
      >
        Error Code: {error.code}
      </Text>
      {retryCount < 3 && (
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={onRetry}
          testID="retry-button"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={ACCESSIBILITY_LABELS.actions.retryButton}
          accessibilityHint={ACCESSIBILITY_HINTS.actions.retryButton}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
      {retryCount >= 3 && (
        <Text 
          style={styles.maxRetriesText}
          accessible={true}
          accessibilityRole="text"
        >
          Maximum retry attempts reached. Please restart the app.
        </Text>
      )}
    </View>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred' },
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error: {
        code: error.name || 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred' },
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorBoundaryContent 
          error={this.state.error} 
          retryCount={this.state.retryCount} 
          onRetry={this.handleRetry} 
        />
      );
    }

    return this.props.children;
  }
}