import React, { useState, useCallback, useMemo } from 'react';
import { Image, ImageStyle, View, ActivityIndicator, StyleSheet } from 'react-native';
import { PERFORMANCE_CONFIG } from '../config/performance';
import { useTheme } from '../contexts/ThemeContext';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: ImageStyle;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  priority?: 'low' | 'normal' | 'high';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder,
  onLoad,
  onError,
  resizeMode = 'cover',
  priority = 'normal',
}) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isWebUri = useMemo(() => {
    if (typeof source === 'number') return false;
    return source.uri && source.uri.startsWith('http');
  }, [source]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  // Use optimized Image component with performance enhancements
  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
        // Performance optimizations
        fadeDuration={200}
        loadingIndicatorSource={placeholder ? { uri: placeholder as string } : undefined}
      />
      {isLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: `rgba(${theme.background.primary}, 0.8)` }]}>
          <ActivityIndicator size="small" color={theme.primary.main} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OptimizedImage;
