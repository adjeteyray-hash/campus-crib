import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';
import { Text } from 'react-native';

// Mock the error handling utilities
jest.mock('../../../utils/errorHandling', () => ({
  handleErrorBoundary: jest.fn((error) => ({
    code: 'RUNTIME_ERROR',
    message: error.message,
    timestamp: new Date(),
  })),
  logError: jest.fn(),
}));

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(getByText('No error')).toBeTruthy();
  });

  it('renders error UI when there is an error', () => {
    const { getByTestId, getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByTestId('error-boundary')).toBeTruthy();
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
  });

  it('shows retry button when retry count is less than 3', () => {
    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByTestId('retry-button')).toBeTruthy();
  });

  it('handles retry functionality', () => {
    let shouldThrow = true;
    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <Text>No error</Text>;
    };

    const { getByTestId, queryByText, rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    const retryButton = getByTestId('retry-button');
    
    // Change the error condition before retry
    shouldThrow = false;
    
    fireEvent.press(retryButton);

    // After retry, the error should be cleared and children should render
    expect(queryByText('No error')).toBeTruthy();
  });

  it('shows max retries message after 3 retries', () => {
    const { getByTestId, getByText, queryByTestId, rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Retry 3 times - each retry should trigger a new error
    for (let i = 0; i < 3; i++) {
      const retryButton = getByTestId('retry-button');
      fireEvent.press(retryButton);
      
      // Re-render to trigger error again
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
    }

    expect(queryByTestId('retry-button')).toBeNull();
    expect(getByText('Maximum retry attempts reached. Please restart the app.')).toBeTruthy();
  });

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'RUNTIME_ERROR',
        message: 'Test error',
      })
    );
  });

  it('renders custom fallback when provided', () => {
    const customFallback = (error: any, retry: () => void) => (
      <Text testID="custom-fallback">Custom error: {error.message}</Text>
    );

    const { getByTestId } = render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByTestId('custom-fallback')).toBeTruthy();
  });
});