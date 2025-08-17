import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { THEME_COLORS } from '../../utils/theme';

interface OfflineBannerProps {
  showWhenOffline?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  showWhenOffline = true,
}) => {
  const networkStatus = useNetworkStatus();

  if (!showWhenOffline || networkStatus.isConnected) {
    return null;
  }

  return (
    <View style={styles.container} testID="offline-banner">
      <Text style={styles.text}>
        No internet connection. Some features may not work properly.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME_COLORS.mediumPurple,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: THEME_COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});