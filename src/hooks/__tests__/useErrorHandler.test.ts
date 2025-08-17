import { renderHook, act } from '@testing-library/react-native';
import { useErrorHandler } from '../useErrorHandler';
import { createNetworkError, logError, isRetryableError, withRetry } from '../../utils/errorHandling';

// Mock dependencies
jest.mock('../../utils/errorHandling', () => ({
  logError: jest.fn(),
  isRetryableError: jest.fn(),
  withRetry: jest.fn(),
  createNetworkError: jest.fn((message) => ({
    code: 'NETWORK_ERROR',
    message,
    timestamp: new Date(),
  })),
}));

jest.mock('../useNetworkStatus', () => ({
  useNetworkStatus: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
}));

const mockLogError = logError as jest.MockedFunction<typeof logError>;
const mockIsRetryableError = isRetryableError as jest.MockedFunction<typeof isRetryableError>;
const mockWithRetry = withRetry as jest.MockedFunction<typeof withRetry>;

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsRetryableError.mockReturnValue(true);
    mockWithRetry.mockImplementation((operation) => operation());
  });

  it('initializes with no error', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current.error).toBeNull();
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.retryCount).toBe(0);
  });

  it('handles error correctly', () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useErrorHandler({ onError }));
    const error = createNetworkError('Network failed');

    act(() => {
      result.current.handleError(error);
    });

    expect(result.current.error).toBe(error);
    expect(mockLogError).toHaveBeenCalledWith(error, expect.any(Object));
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('retries operation successfully', async () => {
    const onRecovery = jest.fn();
    const { result } = renderHook(() => useErrorHandler({ onRecovery }));
    const operation = jest.fn().mockResolvedValue(undefined);

    await act(async () => {
      await result.current.retry(operation);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.retryCount).toBe(0);
    expect(onRecovery).toHaveBeenCalled();
  });

  it('handles retry failure', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = createNetworkError('Retry failed');
    const operation = jest.fn().mockRejectedValue(error);
    
    mockWithRetry.mockRejectedValue(error);

    await act(async () => {
      await result.current.retry(operation);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.retryCount).toBe(1);
  });

  it('does not retry when max retries reached', async () => {
    const { result } = renderHook(() => useErrorHandler({ maxRetries: 1 }));
    const operation = jest.fn();

    // Set retry count to max
    act(() => {
      result.current.handleError(createNetworkError('Error'));
    });

    await act(async () => {
      await result.current.retry(operation);
    });

    // Should not retry again
    await act(async () => {
      await result.current.retry(operation);
    });

    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('dismisses error', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = createNetworkError('Network failed');

    act(() => {
      result.current.handleError(error);
    });

    expect(result.current.error).toBe(error);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
  });

  it('determines canRetry correctly', () => {
    const { result } = renderHook(() => useErrorHandler({ maxRetries: 3 }));
    
    // No error initially
    expect(result.current.canRetry).toBe(false);

    // With retryable error
    mockIsRetryableError.mockReturnValue(true);
    act(() => {
      result.current.handleError(createNetworkError('Network failed'));
    });
    expect(result.current.canRetry).toBe(true);

    // With non-retryable error
    mockIsRetryableError.mockReturnValue(false);
    act(() => {
      result.current.handleError(createNetworkError('Non-retryable error'));
    });
    expect(result.current.canRetry).toBe(false);
  });

  it('executes recovery actions', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = createNetworkError('Network failed');

    act(() => {
      result.current.handleError(error);
    });

    // Test dismiss action
    act(() => {
      result.current.executeRecoveryAction({ type: 'DISMISS' });
    });

    expect(result.current.error).toBeNull();
  });
});