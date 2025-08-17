import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { 
  LoadingSpinner, 
  ErrorDisplay, 
  OfflineBanner 
} from '../components/common';
import { 
  useErrorHandler, 
  useLoadingState, 
  useNetworkStatus 
} from '../hooks';
import { 
  createNetworkError, 
  createAPIError, 
  withRetry,
  withGracefulDegradation 
} from '../utils/errorHandling';

/**
 * Example component demonstrating the usage of error handling and loading state components
 * This shows how to integrate the new error handling system into your screens
 */
export const ErrorHandlingExample: React.FC = () => {
  const [data, setData] = useState<string | null>(null);
  
  // Use the error handler hook
  const { error, handleError, retry, dismiss } = useErrorHandler({
    onError: (err) => console.log('Error occurred:', err),
    onRecovery: () => console.log('Recovered from error'),
  });
  
  // Use the loading state hook
  const { isLoading, withLoading } = useLoadingState();
  
  // Use network status hook
  const networkStatus = useNetworkStatus();

  // Simulate a successful API call
  const simulateSuccess = async () => {
    await withLoading('fetch', async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setData('Data loaded successfully!');
      dismiss(); // Clear any previous errors
    });
  };

  // Simulate a network error
  const simulateNetworkError = async () => {
    await withLoading('fetch', async () => {
      try {
        await withRetry(async () => {
          throw createNetworkError('Network connection failed', 500, true);
        }, { maxRetries: 2, baseDelay: 1000 });
      } catch (err) {
        handleError(err as any);
      }
    });
  };

  // Simulate an API error
  const simulateAPIError = async () => {
    await withLoading('fetch', async () => {
      const apiError = createAPIError(
        'Server temporarily unavailable',
        503,
        '/api/data',
        'GET'
      );
      handleError(apiError);
    });
  };

  // Simulate graceful degradation
  const simulateGracefulDegradation = async () => {
    await withLoading('fetch', async () => {
      const result = await withGracefulDegradation(
        async () => {
          throw createNetworkError('Network failed');
        },
        () => 'Cached data from local storage',
        (error) => error.code === 'NETWORK_ERROR'
      );
      setData(result);
    });
  };

  if (isLoading('fetch')) {
    return (
      <View style={styles.container}>
        <LoadingSpinner 
          message="Loading data..." 
          overlay={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />
      
      <Text style={styles.title}>Error Handling Examples</Text>
      
      <Text style={styles.networkStatus}>
        Network Status: {networkStatus.isConnected ? 'Connected' : 'Disconnected'}
      </Text>
      
      {data && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>{data}</Text>
        </View>
      )}
      
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={() => retry(simulateSuccess)}
          onDismiss={dismiss}
          showDismiss={true}
        />
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={simulateSuccess}
        >
          <Text style={styles.buttonText}>Simulate Success</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.errorButton]} 
          onPress={simulateNetworkError}
        >
          <Text style={styles.buttonText}>Simulate Network Error</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.errorButton]} 
          onPress={simulateAPIError}
        >
          <Text style={styles.buttonText}>Simulate API Error</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.warningButton]} 
          onPress={simulateGracefulDegradation}
        >
          <Text style={styles.buttonText}>Graceful Degradation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  networkStatus: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  dataContainer: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  dataText: {
    color: '#155724',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorButton: {
    backgroundColor: '#dc3545',
  },
  warningButton: {
    backgroundColor: '#ffc107',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});