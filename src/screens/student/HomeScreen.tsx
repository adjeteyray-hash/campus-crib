import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useLoadingState } from '../../hooks/useLoadingState';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { HostelCard } from '../../components/hostel';
import { LoadingSpinner, ErrorDisplay, OfflineBanner } from '../../components/common';
import { Hostel } from '../../types';

import { localHostelService } from '../../services/localHostelService';
import { withNetworkRetry, createAPIError } from '../../utils/errorHandling';
import { IS_SUPABASE_CONFIGURED } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface HomeScreenProps {
  navigation: any; // Use flexible navigation type for nested navigation
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false); // Add flag to prevent multiple loads
  const { user, signOut } = useAuth(); // Add auth context for testing
  const insets = useSafeAreaInsets();

  // Animation value for placeholder pulsing effect
  const pulseAnim = React.useRef(new Animated.Value(0.3)).current;

  // Pulsing animation effect
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  // Define styles inside component to access theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: theme.surface.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.separator,
      marginBottom: 8,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerTitle: {
      flex: 1,
      fontSize: 24,
      fontWeight: '800',
      color: theme.text.primary,
      marginRight: 16,
      letterSpacing: -0.5,
      lineHeight: 36,
    },
    headerSubtitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.link,
      lineHeight: 22,
    },
    footerLoader: {
      paddingVertical: 24,
      alignItems: 'center',
    },
    emptyListContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 12,
      textAlign: 'center',
      lineHeight: 28,
    },
    emptyMessage: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 8,
    },
    emptySubMessage: {
      fontSize: 15,
      color: theme.text.tertiary,
      textAlign: 'center',
      lineHeight: 22,
      marginTop: 12,
      marginBottom: 8,
    },
    emptyHint: {
      fontSize: 15,
      color: theme.text.link,
      textAlign: 'center',
      lineHeight: 22,
      marginTop: 20,
      fontStyle: 'italic',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60,
    },
    errorTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.error.main,
      marginBottom: 12,
      textAlign: 'center',
      lineHeight: 28,
    },
    errorMessage: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    // Placeholder card styles
    placeholderCard: {
      backgroundColor: theme.surface.card,
      borderRadius: 8,
      marginHorizontal: 12,
      marginBottom: 8,
      padding: 0,
      borderWidth: 1,
      borderColor: theme.border.card,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow.small.shadowColor,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    placeholderImage: {
      width: 80,
      height: 80,
      backgroundColor: theme.background.secondary,
      borderRadius: 8,
      position: 'relative',
      overflow: 'hidden',
    },
    placeholderImageOverlay: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 40,
      height: 16,
      backgroundColor: theme.primary.main,
      borderRadius: 8,
      opacity: 0.8,
    },
    placeholderContent: {
      flex: 1,
      marginLeft: 12,
      padding: 8,
      paddingLeft: 0,
    },
    placeholderTitle: {
      width: '90%',
      height: 14,
      backgroundColor: theme.background.secondary,
      borderRadius: 3,
      marginBottom: 4,
    },
    placeholderPrice: {
      width: '40%',
      height: 12,
      backgroundColor: theme.primary.main,
      borderRadius: 3,
      marginBottom: 4,
      opacity: 0.7,
    },
    placeholderLocation: {
      width: '75%',
      height: 11,
      backgroundColor: theme.background.secondary,
      borderRadius: 2,
      marginBottom: 4,
    },
    placeholderFeatures: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 2,
    },
    placeholderFeature: {
      width: 40,
      height: 10,
      backgroundColor: theme.background.secondary,
      borderRadius: 2,
    },
    placeholderShimmer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 8,
    },
  });

  const { isLoading, setLoading, withLoading } = useLoadingState({
    initial: true,
    refresh: false,
    loadMore: false,
  });

  const { error, handleError, retry, dismiss } = useErrorHandler({
    onError: (err) => {
      console.error('HomeScreen error:', err);
    },
  });

  const ITEMS_PER_PAGE = 20;

  const fetchHostels = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      console.log('🔍 HomeScreen: fetchHostels called with pageNum:', pageNum, 'isRefresh:', isRefresh);
      
      // Validate page number
      if (pageNum < 1) {
        console.warn('⚠️ HomeScreen: Invalid page number, defaulting to page 1');
        pageNum = 1;
      }
      
      if (pageNum === 1) {
        dismiss(); // Clear any previous errors
        console.log('🧹 HomeScreen: Cleared previous errors');
      }

      console.log('🔍 Fetching hostels from localHostelService...');
      const result = await withNetworkRetry(
        () => localHostelService.getHostels(pageNum, ITEMS_PER_PAGE),
        { maxRetries: 2, baseDelay: 1000 }
      );

      console.log('✅ Hostels fetched successfully:', result);

      // If we got no hostels and it's not the first page, this might indicate we're beyond available data
      if (result.hostels.length === 0 && pageNum > 1) {
        console.log('⚠️ HomeScreen: No hostels returned for page', pageNum, '- likely beyond available data');
        setHasMore(false);
        return;
      }

      if (isRefresh || pageNum === 1) {
        console.log('🔄 HomeScreen: Setting hostels (refresh/replace):', result.hostels.length);
        setHostels(result.hostels);
      } else {
        console.log('➕ HomeScreen: Appending hostels:', result.hostels.length);
        setHostels(prev => [...prev, ...result.hostels]);
      }

      // Check if we have more data to load
      setHasMore(result.hasMore);
      setPage(pageNum);
      console.log('✅ HomeScreen: fetchHostels completed successfully');
    } catch (err) {
      console.error('❌ HomeScreen: Error in fetchHostels:', err);
      
      // If it's a pagination error, set hasMore to false
      if (err instanceof Error && err.message.includes('Failed to fetch hostels')) {
        console.log('⚠️ HomeScreen: Pagination error detected, setting hasMore to false');
        setHasMore(false);
      }
      
      const apiError = createAPIError(
        err instanceof Error ? err.message : 'Failed to load hostels',
        undefined, // statusCode
        '/hostels', // endpoint
        'GET' // method
      );
      handleError(apiError);
    }
  }, [dismiss, handleError]);

  const loadInitialData = useCallback(async () => {
    try {
      console.log('🚀 HomeScreen: Starting initial data load...');
      setHasLoadedInitialData(true); // Set flag to prevent multiple loads
      await withLoading('initial', async () => {
        await fetchHostels(1, false);
      });
    } catch (error) {
      console.error('❌ HomeScreen: Error in loadInitialData:', error);
      // Ensure loading state is cleared on error
      setLoading('initial', false);
    }
  }, [fetchHostels, withLoading, setLoading]);

  const handleRefresh = useCallback(async () => {
    console.log('🔄 HomeScreen: Manual refresh triggered');
    setHasLoadedInitialData(false); // Reset flag to allow fresh load
    await withLoading('refresh', () => fetchHostels(1, true));
  }, [fetchHostels, withLoading]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoading('loadMore')) return;

    // Additional validation to prevent requesting pages beyond available data
    const nextPage = page + 1;
    const estimatedTotal = hostels.length + (nextPage - 1) * ITEMS_PER_PAGE;
    
    // If we already have enough data to estimate there's no more, don't request
    if (estimatedTotal > 0 && hostels.length >= estimatedTotal) {
      console.log('⚠️ HomeScreen: Estimated no more data available, skipping load more');
      setHasMore(false);
      return;
    }

    try {
      await withLoading('loadMore', () => fetchHostels(nextPage, false));
    } catch (error) {
      console.error('❌ HomeScreen: Error in handleLoadMore:', error);
      // If we get an error loading more, assume there's no more data
      setHasMore(false);
    }
  }, [hasMore, isLoading, page, fetchHostels, withLoading, hostels.length]);

  const handleHostelPress = useCallback((hostel: Hostel) => {
    navigation.navigate('HostelDetail', { hostelId: hostel.id });
  }, [navigation]);

  const renderHostelCard = useCallback(({ item }: { item: Hostel }) => (
    <HostelCard hostel={item} onPress={handleHostelPress} />
  ), [handleHostelPress]);

  const renderFooter = useCallback(() => {
    if (!isLoading('loadMore')) return null;

    return (
      <View style={styles.footerLoader}>
        <LoadingSpinner size="small" />
      </View>
    );
  }, [isLoading]);

  const renderEmptyState = useCallback(() => {
    if (isLoading('initial')) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Hostels Available</Text>
        <Text style={styles.emptyMessage}>
          There are no hostels listed at the moment. This could be because:
        </Text>
        <Text style={styles.emptySubMessage}>
          • No landlords have posted hostels yet{'\n'}
          • Supabase database is not configured{'\n'}
          • Check your internet connection
        </Text>
        <Text style={styles.emptyHint}>
          Pull down to refresh or check back later.
        </Text>
        

      </View>
    );
  }, [isLoading, loadInitialData, setLoading]);

  const renderErrorState = useCallback(() => {
    if (!error || hostels.length > 0) return null;

    return (
      <ErrorDisplay
        error={error}
        onRetry={() => retry(loadInitialData)}
        onDismiss={dismiss}
        showDismiss={hostels.length > 0}
        style={styles.errorContainer}
      />
    );
  }, [error, hostels.length, retry, loadInitialData, dismiss]);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only load if we haven't loaded initial data yet and not currently loading
      if (!hasLoadedInitialData && !isLoading('initial') && !isLoading('refresh')) {
        console.log('🔄 HomeScreen: Loading initial data...');
        loadInitialData();
      } else {
        console.log('⏭️ HomeScreen: Skipping initial data load - already loaded or loading');
      }
    }, [hasLoadedInitialData, isLoading, loadInitialData]) // Add hasLoadedInitialData to dependencies
  );

  // Add a timeout to prevent infinite loading
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading('initial') && hostels.length === 0) {
        console.log('⏰ HomeScreen: Loading timeout reached, stopping loading state');
        setLoading('initial', false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading, hostels.length, setLoading]);

  // Render placeholder cards while loading
  const renderPlaceholderCard = useCallback(() => (
    <View style={styles.placeholderCard}>
      <View style={styles.placeholderContent}>
        <View style={styles.placeholderImage}>
          <View style={styles.placeholderImageOverlay} />
        </View>
        <View style={styles.placeholderContent}>
          <View style={styles.placeholderTitle} />
          <View style={styles.placeholderPrice} />
          <View style={styles.placeholderLocation} />
          <View style={styles.placeholderFeatures}>
            <View style={styles.placeholderFeature} />
            <View style={styles.placeholderFeature} />
          </View>
        </View>
      </View>
      <View style={styles.placeholderShimmer} />
    </View>
  ), [styles]);

  // Render placeholder list while loading initial data
  const renderPlaceholderList = useCallback(() => {
    const placeholderData = Array.from({ length: 8 }, (_, index) => ({ 
      id: `placeholder-${index}`,
      // Add variety to placeholder heights for more realistic look (much smaller range)
      height: 100 + (index % 3) * 8 
    }));
    
    return (
      <FlatList
        data={placeholderData}
        renderItem={({ item }) => (
          <Animated.View 
            style={[
              styles.placeholderCard, 
              { 
                height: item.height,
                opacity: pulseAnim
              }
            ]}
          >
            <View style={styles.placeholderContent}>
              <View style={styles.placeholderImage}>
                <View style={styles.placeholderImageOverlay} />
              </View>
              <View style={styles.placeholderContent}>
                <View style={styles.placeholderTitle} />
                <View style={styles.placeholderPrice} />
                <View style={styles.placeholderLocation} />
                <View style={styles.placeholderFeatures}>
                  <View style={styles.placeholderFeature} />
                  <View style={styles.placeholderFeature} />
                </View>
              </View>
            </View>
            <View style={styles.placeholderShimmer} />
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      />
    );
  }, [styles, insets.bottom, pulseAnim]);

  // Always render the header and container, only change the content
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.background.primary} 
        translucent={Platform.OS === 'android'}
      />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Available Hostels</Text>
        </View>
      </View>

      {/* Show placeholder list while loading initial data */}
      {isLoading('initial') && hostels.length === 0 ? (
        renderPlaceholderList()
      ) : (
        <FlatList
          data={hostels}
          renderItem={renderHostelCard}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isLoading('refresh')}
              onRefresh={handleRefresh}
              colors={[theme.primary.main]}
              tintColor={theme.primary.main}
            />
          }
          onEndReached={hasMore && !isLoading('loadMore') ? handleLoadMore : undefined}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={error ? renderErrorState : renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            hostels.length === 0 ? styles.emptyListContainer : undefined,
            { paddingBottom: insets.bottom + 20 }
          ]}
          testID="hostels-list"
        />
      )}
    </View>
  );
};

