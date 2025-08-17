import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorDisplay } from '../ErrorDisplay';
import { createNetworkError } from '../../../utils/errorHandling';

// Mock the error handling utilities
jest.mock('../../../utils/errorHandling', () => ({
  getErrorMessage: jest.fn((error) => `Error: ${error.message}`),
  createNetworkError: jest.fn((message) => ({
    code: 'NETWORK_ERROR',
    message,
    timestamp: new Date(),
  })),
}));

describe('ErrorDisplay', () => {
  const mockError = createNetworkError('Network connection failed');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error message', () => {
    const { getByTestId, getByText } = render(
      <ErrorDisplay error={mockError} />
    );

    expect(getByTestId('error-display')).toBeTruthy();
    expect(getByText('Oops! Something went wrong')).toBeTruthy();
    expect(getByText('Error: Network connection failed')).toBeTruthy();
  });

  it('shows retry button by default', () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <ErrorDisplay error={mockError} onRetry={onRetry} />
    );

    expect(getByTestId('retry-button')).toBeTruthy();
  });

  it('calls onRetry when retry button is pressed', () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <ErrorDisplay error={mockError} onRetry={onRetry} />
    );

    fireEvent.press(getByTestId('retry-button'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows dismiss button when showDismiss is true', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(
      <ErrorDisplay 
        error={mockError} 
        onDismiss={onDismiss} 
        showDismiss={true} 
      />
    );

    expect(getByTestId('dismiss-button')).toBeTruthy();
  });

  it('calls onDismiss when dismiss button is pressed', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(
      <ErrorDisplay 
        error={mockError} 
        onDismiss={onDismiss} 
        showDismiss={true} 
      />
    );

    fireEvent.press(getByTestId('dismiss-button'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('hides retry button when showRetry is false', () => {
    const { queryByTestId } = render(
      <ErrorDisplay error={mockError} showRetry={false} />
    );

    expect(queryByTestId('retry-button')).toBeNull();
  });

  it('does not show retry button when onRetry is not provided', () => {
    const { queryByTestId } = render(
      <ErrorDisplay error={mockError} />
    );

    expect(queryByTestId('retry-button')).toBeNull();
  });
});