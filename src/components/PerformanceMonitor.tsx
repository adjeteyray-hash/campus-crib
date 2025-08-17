import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PERFORMANCE_CONFIG } from '../config/performance';
import { useTheme } from '../contexts/ThemeContext';

interface PerformanceMetrics {
  appStartTime: number;
  renderTime: number;
  memoryUsage?: number;
  bundleSize?: number;
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ onMetricsUpdate }) => {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    appStartTime: 0,
    renderTime: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_MONITORING) return;

    const startTime = performance.now();
    let startupTime = 0;
    
    // Measure app startup time
    const measureStartup = () => {
      startupTime = performance.now() - startTime;
      setMetrics(prev => ({
        ...prev,
        appStartTime: startupTime,
      }));
    };

    // Measure initial render time
    const measureRender = () => {
      const renderTime = performance.now() - startTime;
      setMetrics(prev => ({
        ...prev,
        renderTime,
      }));
      
      onMetricsUpdate?.({
        appStartTime: startupTime,
        renderTime,
      });
    };

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(() => {
      measureStartup();
      requestAnimationFrame(measureRender);
    });

    // Memory usage monitoring (if available)
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryInfo.usedJSHeapSize / 1024 / 1024, // MB
      }));
    }
  }, [onMetricsUpdate]);

  // Define styles inside component to access theme
  const styles = StyleSheet.create({
    floatingButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      zIndex: 1000,
    },
    buttonText: {
      fontSize: 20,
    },
    metricsPanel: {
      position: 'absolute',
      top: 110,
      right: 20,
      width: 280,
      borderRadius: 10,
      padding: 15,
      elevation: 5,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      zIndex: 1000,
    },
    panelTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme.text.primary,
    },
    metric: {
      fontSize: 14,
      marginBottom: 5,
      color: theme.text.secondary,
    },
    recommendations: {
      marginTop: 15,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: theme.border.separator,
    },
    recommendationTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.text.primary,
    },
    recommendation: {
      fontSize: 12,
      marginBottom: 5,
      color: theme.error.main,
      lineHeight: 16,
    },
  });

  if (!PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_MONITORING) return null;

  return (
    <>
      {/* Floating performance button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: theme.primary.main, shadowColor: theme.shadow.small.shadowColor }]}
        onPress={() => setIsVisible(!isVisible)}
      >
        <Text style={[styles.buttonText, { color: theme.primary.contrast }]}>⚡</Text>
      </TouchableOpacity>

      {/* Performance metrics panel */}
      {isVisible && (
        <View style={[styles.metricsPanel, { backgroundColor: theme.surface.card, shadowColor: theme.shadow.small.shadowColor }]}>
          <Text style={[styles.panelTitle, { color: theme.text.primary }]}>Performance Metrics</Text>
          <Text style={[styles.metric, { color: theme.text.secondary }]}>
            App Start: {metrics.appStartTime.toFixed(2)}ms
          </Text>
          <Text style={[styles.metric, { color: theme.text.secondary }]}>
            Render: {metrics.renderTime.toFixed(2)}ms
          </Text>
          {metrics.memoryUsage && (
            <Text style={[styles.metric, { color: theme.text.secondary }]}>
              Memory: {metrics.memoryUsage.toFixed(2)}MB
            </Text>
          )}
          <Text style={[styles.metric, { color: theme.text.secondary }]}>
            Bundle: {metrics.bundleSize || 'Unknown'}KB
          </Text>
          
          {/* Performance recommendations */}
          <View style={[styles.recommendations, { borderTopColor: theme.border.separator }]}>
            <Text style={[styles.recommendationTitle, { color: theme.text.primary }]}>Recommendations:</Text>
            {metrics.appStartTime > 1000 && (
              <Text style={[styles.recommendation, { color: theme.error.main }]}>
                • App startup is slow. Consider lazy loading and code splitting.
              </Text>
            )}
            {metrics.renderTime > 500 && (
              <Text style={[styles.recommendation, { color: theme.error.main }]}>
                • Initial render is slow. Optimize component rendering.
              </Text>
            )}
            {metrics.memoryUsage && metrics.memoryUsage > 100 && (
              <Text style={[styles.recommendation, { color: theme.error.main }]}>
                • High memory usage. Check for memory leaks.
              </Text>
            )}
          </View>
        </View>
            )}
    </>
  );
};

export default PerformanceMonitor;
