
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  Share,
  SafeAreaView,
} from 'react-native';
// Using basic React Native components for charts to avoid victory-native compatibility issues
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { analyticsService, AnalyticsService } from '../../services/analytics';
import type { AnalyticsData } from '../../types/hostel';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const screenWidth = Dimensions.get('window').width;

interface TimePeriod {
  key: string;
  label: string;
  days: number;
}

const TIME_PERIODS: TimePeriod[] = [
  { key: 'week', label: '7 Days', days: 7 },
  { key: 'month', label: '30 Days', days: 30 },
  { key: 'quarter', label: '90 Days', days: 90 },
];

export const AnalyticsScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(TIME_PERIODS[1]); // Default to 30 days
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const timeRange = AnalyticsService.getTimeRangePresets()[selectedPeriod.key];
      const data = await analyticsService.getLandlordAnalytics(user.id, timeRange);
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, selectedPeriod.key]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalytics();
  }, [loadAnalytics]);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    setLoading(true);
  };

  const exportAnalytics = async () => {
    try {
      const summary = analytics.reduce(
        (acc, item) => ({
          totalViews: acc.totalViews + item.totalViews,
          totalContacts: acc.totalContacts + item.totalContacts,
          hostels: acc.hostels + 1,
        }),
        { totalViews: 0, totalContacts: 0, hostels: 0 }
      );

      const avgConversionRate = analytics.length > 0
        ? analytics.reduce((sum, item) => sum + item.conversionRate, 0) / analytics.length
        : 0;

      const reportText = `
CampusCrib Analytics Report (${selectedPeriod.label})

Summary:
- Total Hostels: ${summary.hostels}
- Total Views: ${summary.totalViews}
- Total Contacts: ${summary.totalContacts}
- Average Conversion Rate: ${avgConversionRate.toFixed(1)}%

Top Performing Hostels:
${analytics.slice(0, 3).map((item, index) =>
        `${index + 1}. ${item.hostelName} - ${item.totalViews} views, ${item.totalContacts} contacts (${item.conversionRate}%)`
      ).join('\n')}

Generated on ${new Date().toLocaleDateString()}
      `.trim();

      await Share.share({
        message: reportText,
        title: 'CampusCrib Analytics Report',
      });
    } catch (err) {
      console.error('Error exporting analytics:', err);
      Alert.alert('Export Error', 'Failed to export analytics report.');
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {TIME_PERIODS.map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod.key === period.key && styles.periodButtonActive,
          ]}
          onPress={() => handlePeriodChange(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod.key === period.key && styles.periodButtonTextActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSummaryCards = () => {
    const totalViews = analytics.reduce((sum, item) => sum + item.totalViews, 0);
    const totalContacts = analytics.reduce((sum, item) => sum + item.totalContacts, 0);
    const avgConversionRate = analytics.length > 0
      ? analytics.reduce((sum, item) => sum + item.conversionRate, 0) / analytics.length
      : 0;

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalViews}</Text>
          <Text style={styles.summaryLabel}>Total Views</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalContacts}</Text>
          <Text style={styles.summaryLabel}>Total Contacts</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{avgConversionRate.toFixed(1)}%</Text>
          <Text style={styles.summaryLabel}>Avg Conversion</Text>
        </View>
      </View>
    );
  };

  const renderViewsChart = () => {
    if (analytics.length === 0) return null;

    const maxViews = Math.max(...analytics.slice(0, 5).map(item => item.totalViews));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Views by Hostel</Text>
        <View style={styles.simpleChart}>
          {analytics.slice(0, 5).map((item, index) => {
            const barHeight = maxViews > 0 ? (item.totalViews / maxViews) * 120 : 0;
            const hostelName = item.hostelName.length > 10
              ? item.hostelName.substring(0, 10) + '...'
              : item.hostelName;

            return (
              <View key={item.hostelId} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { height: barHeight, backgroundColor: theme.secondary.main }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{hostelName}</Text>
                <Text style={styles.barValue}>{item.totalViews}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderContactsChart = () => {
    if (analytics.length === 0) return null;

    const maxContacts = Math.max(...analytics.slice(0, 5).map(item => item.totalContacts));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Contacts by Hostel</Text>
        <View style={styles.simpleChart}>
          {analytics.slice(0, 5).map((item, index) => {
            const barHeight = maxContacts > 0 ? (item.totalContacts / maxContacts) * 120 : 0;
            const hostelName = item.hostelName.length > 10
              ? item.hostelName.substring(0, 10) + '...'
              : item.hostelName;

            return (
              <View key={item.hostelId} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { height: barHeight, backgroundColor: theme.primary.main }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{hostelName}</Text>
                <Text style={styles.barValue}>{item.totalContacts}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderConversionChart = () => {
    if (analytics.length === 0) return null;

    const colors = [
      theme.primary.main,
      theme.secondary.main,
      theme.warning.main,
      theme.success.main,
      theme.primary.light
    ];

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Conversion Rates</Text>
        <View style={styles.conversionChart}>
          {analytics.slice(0, 5).map((item, index) => {
            const hostelName = item.hostelName.length > 12
              ? item.hostelName.substring(0, 12) + '...'
              : item.hostelName;

            return (
              <View key={item.hostelId} style={styles.conversionItem}>
                <View style={styles.conversionHeader}>
                  <View
                    style={[
                      styles.conversionColor,
                      { backgroundColor: colors[index % colors.length] }
                    ]}
                  />
                  <Text style={styles.conversionName}>{hostelName}</Text>
                </View>
                <Text style={styles.conversionRate}>{item.conversionRate}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderTrendChart = () => {
    if (analytics.length === 0 || !analytics[0]?.trendData?.length) return null;

    const trendData = analytics[0].trendData;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Trend Analysis</Text>
        <View style={styles.trendChart}>
          {trendData.slice(0, 7).map((item, index) => {
            const date = new Date(item.date);
            const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;

            return (
              <View key={index} style={styles.trendItem}>
                <Text style={styles.trendDate}>{dateLabel}</Text>
                <View style={styles.trendBars}>
                  <View style={styles.trendBar}>
                    <Text style={styles.trendLabel}>Views</Text>
                    <Text style={[styles.trendValue, { color: theme.secondary.main }]}>{item.views}</Text>
                  </View>
                  <View style={styles.trendBar}>
                    <Text style={styles.trendLabel}>Contacts</Text>
                    <Text style={[styles.trendValue, { color: theme.primary.main }]}>{item.contacts}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.secondary.main }]} />
            <Text style={styles.legendText}>Views</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.primary.main }]} />
            <Text style={styles.legendText}>Contacts</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHostelRankings = () => (
    <View style={styles.rankingsContainer}>
      <Text style={styles.sectionTitle}>Hostel Rankings</Text>
      {analytics.map((item, index) => (
        <View key={item.hostelId} style={styles.rankingItem}>
          <View style={styles.rankingHeader}>
            <Text style={styles.rankingPosition}>#{item.ranking}</Text>
            <Text style={styles.rankingName}>{item.hostelName}</Text>
          </View>
          <View style={styles.rankingStats}>
            <Text style={styles.rankingStat}>{item.totalViews} views</Text>
            <Text style={styles.rankingStat}>{item.totalContacts} contacts</Text>
            <Text style={styles.rankingStat}>{item.conversionRate}% conversion</Text>
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAnalytics}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (analytics.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Analytics Data</Text>
          <Text style={styles.emptyText}>
            You don't have any hostels yet or no activity has been recorded.
          </Text>
          <Text style={styles.emptySubtext}>
            Add some hostels to start seeing analytics data.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        testID="analytics-scroll-view"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >


      {renderPeriodSelector()}
      
      {/* Export Button */}
      <View style={styles.exportSection}>
        <TouchableOpacity style={styles.exportButton} onPress={exportAnalytics}>
          <Text style={styles.exportButtonText}>Export Report</Text>
        </TouchableOpacity>
      </View>

      {renderSummaryCards()}
      {renderViewsChart()}
      {renderContactsChart()}
      {renderConversionChart()}
      {renderTrendChart()}
      {renderHostelRankings()}
      </ScrollView>
    </SafeAreaView>
  );
};

const createThemedStyles = (theme: any) => {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background.primary,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.sizes.md,
      color: theme.text.secondary,
      fontWeight: theme.typography.weights.medium,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background.primary,
      padding: theme.spacing.md,
    },
    errorText: {
      fontSize: theme.typography.sizes.md,
      color: theme.error.main,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      fontWeight: theme.typography.weights.medium,
    },
    retryButton: {
      backgroundColor: theme.primary.main,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    retryButtonText: {
      color: theme.primary.contrast,
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.semibold,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
      margin: theme.spacing.md,
      backgroundColor: theme.surface.primary,
      borderRadius: theme.borderRadius.md,
      shadowColor: theme.shadow.small.shadowColor,
      shadowOffset: theme.shadow.small.shadowOffset,
      shadowOpacity: theme.shadow.small.shadowOpacity,
      shadowRadius: theme.shadow.small.shadowRadius,
      elevation: theme.shadow.small.elevation,
    },
    emptyTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.semibold,
      color: theme.text.primary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    emptyText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      lineHeight: theme.typography.lineHeights.normal,
    },
    emptySubtext: {
      fontSize: theme.typography.sizes.sm,
      color: theme.text.secondary,
      textAlign: 'center',
    },
    exportSection: {
      margin: theme.spacing.md,
      marginTop: 0,
    },
    exportButton: {
      backgroundColor: theme.primary.main,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      shadowColor: theme.shadow.small.shadowColor,
      shadowOffset: theme.shadow.small.shadowOffset,
      shadowOpacity: theme.shadow.small.shadowOpacity,
      shadowRadius: theme.shadow.small.shadowRadius,
      elevation: theme.shadow.small.elevation,
    },
    exportButtonText: {
      color: theme.primary.contrast,
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.semibold,
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: theme.surface.primary,
      margin: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xs,
      shadowColor: theme.shadow.small.shadowColor,
      shadowOffset: theme.shadow.small.shadowOffset,
      shadowOpacity: theme.shadow.small.shadowOpacity,
      shadowRadius: theme.shadow.small.shadowRadius,
      elevation: theme.shadow.small.elevation,
    },
    periodButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
    },
    periodButtonActive: {
      backgroundColor: theme.primary.main,
    },
    periodButtonText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.text.secondary,
      fontWeight: theme.typography.weights.medium,
    },
    periodButtonTextActive: {
      color: theme.primary.contrast,
      fontWeight: theme.typography.weights.semibold,
    },
    summaryContainer: {
      flexDirection: 'row',
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: theme.surface.primary,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      shadowColor: theme.shadow.small.shadowColor,
      shadowOffset: theme.shadow.small.shadowOffset,
      shadowOpacity: theme.shadow.small.shadowOpacity,
      shadowRadius: theme.shadow.small.shadowRadius,
      elevation: theme.shadow.small.elevation,
    },
    summaryValue: {
      fontSize: theme.typography.sizes.xxl,
      fontWeight: theme.typography.weights.bold,
      color: theme.text.primary,
      marginBottom: theme.spacing.xs,
    },
    summaryLabel: {
      fontSize: theme.typography.sizes.sm,
      color: theme.text.secondary,
      textAlign: 'center',
    },
    chartContainer: {
      backgroundColor: theme.surface.primary,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      shadowColor: theme.shadow.small.shadowColor,
      shadowOffset: theme.shadow.small.shadowOffset,
      shadowOpacity: theme.shadow.small.shadowOpacity,
      shadowRadius: theme.shadow.small.shadowRadius,
      elevation: theme.shadow.small.elevation,
    },
    chartTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.text.primary,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    chart: {
      borderRadius: theme.borderRadius.md,
    },
    legendContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: theme.spacing.sm,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: theme.spacing.xs,
    },
    legendText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.text.secondary,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.bold,
      color: theme.text.primary,
      marginBottom: theme.spacing.md,
    },
    rankingsContainer: {
      backgroundColor: theme.surface.primary,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      shadowColor: theme.shadow.small.shadowColor,
      shadowOffset: theme.shadow.small.shadowOffset,
      shadowOpacity: theme.shadow.small.shadowOpacity,
      shadowRadius: theme.shadow.small.shadowRadius,
      elevation: theme.shadow.small.elevation,
    },
    rankingItem: {
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.separator,
    },
    rankingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    rankingPosition: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.primary.main,
      marginRight: theme.spacing.sm,
      minWidth: 30,
    },
    rankingName: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.semibold,
      color: theme.text.primary,
      flex: 1,
    },
    rankingStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingLeft: 42,
    },
    rankingStat: {
      fontSize: theme.typography.sizes.sm,
      color: theme.text.secondary,
    },
    // Simple chart styles
    simpleChart: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      height: 160,
      paddingHorizontal: theme.spacing.sm,
    },
    barContainer: {
      alignItems: 'center',
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    barWrapper: {
      height: 120,
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: '100%',
    },
    bar: {
      width: '80%',
      minHeight: 4,
      borderRadius: 2,
    },
    barLabel: {
      fontSize: theme.typography.sizes.xs,
      color: theme.text.secondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    barValue: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.bold,
      color: theme.text.primary,
      textAlign: 'center',
    },
    // Conversion chart styles
    conversionChart: {
      paddingVertical: theme.spacing.sm,
    },
    conversionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
    },
    conversionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    conversionColor: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: theme.spacing.sm,
    },
    conversionName: {
      fontSize: theme.typography.sizes.sm,
      color: theme.text.primary,
      flex: 1,
    },
    conversionRate: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.bold,
      color: theme.text.primary,
      minWidth: 50,
      textAlign: 'right',
    },
    // Trend chart styles
    trendChart: {
      paddingVertical: theme.spacing.sm,
    },
    trendItem: {
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.separator,
    },
    trendDate: {
      fontSize: theme.typography.sizes.sm,
      color: theme.text.secondary,
      marginBottom: theme.spacing.xs,
      fontWeight: theme.typography.weights.medium,
    },
    trendBars: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    trendBar: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    trendLabel: {
      fontSize: theme.typography.sizes.xs,
      color: theme.text.secondary,
      marginBottom: 2,
    },
    trendValue: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.bold,
      color: theme.text.primary,
    },
  });
};