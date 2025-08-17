import { useState, useCallback } from 'react';
import { AppError, ErrorRecoveryAction } from '../types/error';
import { logError, isRetryableError, withRetry } from '../utils/errorHandling';
import { useNetworkStatus } from './useNetworkStatus';

interface ErrorHandlerState {
  error: AppError | null;
  isRetrying: boolean;
  retryCount: number;
}

interface ErrorHandlerOptions {
  maxRetries?: number;
  onError?: (error: AppError) => void;
  onRecovery?: () => void;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { maxRetries = 3, onError, onRecovery } = options;
  const networkStatus = useNetworkStatus();
  
  const [state, setState] = useState<ErrorHandlerState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
  });

  const handleError = useCallback((error: AppError) => {
    logError(error, { networkStatus });
    
    setState(prevState => ({
      ...prevState,
      error,
      isRetrying: false,
    }));

    if (onError) {
      onError(error);
    }
  }, [onError, networkStatus]);

  const retry = useCallback(async (operation: () => Promise<void>) => {
    if (state.retryCount >= maxRetries) {
      return;
    }

    setState(prevState => ({
      ...prevState,
      isRetrying: true,
    }));

    try {
      await withRetry(operation, { maxRetries: 1 });
      
      setState({
        error: null,
        isRetrying: false,
        retryCount: 0,
      });

      if (onRecovery) {
        onRecovery();
      }
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        error: error as AppError,
        isRetrying: false,
        retryCount: prevState.retryCount + 1,
      }));
    }
  }, [state.retryCount, maxRetries, onRecovery]);

  const dismiss = useCallback(() => {
    setState({
      error: null,
      isRetrying: false,
      retryCount: 0,
    });
  }, []);

  const executeRecoveryAction = useCallback((action: ErrorRecoveryAction) => {
    switch (action.type) {
      case 'RETRY':
        // Retry logic would be handled by the calling component
        break;
      case 'DISMISS':
        dismiss();
        break;
      case 'LOGOUT':
        // This would typically trigger a logout action
        dismiss();
        break;
      case 'NAVIGATE':
        // This would typically trigger navigation
        dismiss();
        break;
      case 'REFRESH':
        // This would typically trigger a refresh
        dismiss();
        break;
    }
  }, [dismiss]);

  const canRetry = state.error ? isRetryableError(state.error) && state.retryCount < maxRetries : false;

  return {
    error: state.error,
    isRetrying: state.isRetrying,
    retryCount: state.retryCount,
    canRetry,
    handleError,
    retry,
    dismiss,
    executeRecoveryAction,
  };
};