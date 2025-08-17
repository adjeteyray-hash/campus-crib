import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ACCESSIBILITY_LABELS } from '../../utils/accessibility';
import { isWeb } from '../../utils/platform';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  message,
  overlay = false,
  fullScreen = true,
}) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  const spinnerColor = color || theme.primary.main;

  const containerStyle = [
    styles.container,
    fullScreen && styles.fullScreen,
    overlay && styles.overlay,
  ];

  // Web-specific loading spinner
  if (isWeb && size === 'large') {
    return (
      <View 
        style={containerStyle} 
        testID="loading-spinner"
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel={ACCESSIBILITY_LABELS.actions.loadingSpinner}
        accessibilityHint="Content is currently loading, please wait"
      >
        <View style={styles.content}>
          <View style={styles.webSpinner}>
            <View style={[styles.webSpinnerCircle, { borderTopColor: spinnerColor }]} />
          </View>
          {message && (
            <Text 
              style={[styles.message, { color: spinnerColor }]} 
              testID="loading-message"
              accessible={true}
              accessibilityRole="text"
            >
              {message}
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Native loading spinner
  return (
    <View 
      style={containerStyle} 
      testID="loading-spinner"
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={ACCESSIBILITY_LABELS.actions.loadingSpinner}
      accessibilityHint="Content is currently loading, please wait"
    >
      <View style={styles.content}>
        <ActivityIndicator 
          size={size} 
          color={spinnerColor}
          accessibilityLabel="Loading indicator"
        />
        {message && (
          <Text 
            style={[styles.message, { color: spinnerColor }]} 
            testID="loading-message"
            accessible={true}
            accessibilityRole="text"
          >
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

const createThemedStyles = (theme: any) => StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.background.overlay,
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  webSpinner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webSpinnerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: theme.primary.main,
    animationName: 'spin',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
});