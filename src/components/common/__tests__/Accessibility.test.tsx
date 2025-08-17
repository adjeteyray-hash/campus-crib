import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorBoundary } from '../ErrorBoundary';
import { ACCESSIBLE_COLORS, ACCESSIBILITY_LABELS } from '../../../utils/accessibility';

// Mock the accessibility utilities
jest.mock('../../../hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    announceToScreenReader: jest.fn(),
    announceLoading: jest.fn(),
    announceSuccess: jest.fn(),
    announceError: jest.fn(),
    announceNavigation: jest.fn(),
    focusElement: jest.fn(),
    focusFirstElement: jest.fn(),
    isScreenReaderEnabled: jest.fn(),
    setAccessibilityFocus: jest.fn(),
  }),
}));

describe('Accessibility Features', () => {
  describe('LoadingSpinner', () => {
    it('should have proper accessibility attributes', () => {
      const { getByTestId } = render(
        <LoadingSpinner message="Loading hostels" />
      );

      const spinner = getByTestId('loading-spinner');
      
      expect(spinner.props.accessible).toBe(true);
      expect(spinner.props.accessibilityRole).toBe('progressbar');
      expect(spinner.props.accessibilityLabel).toBe(ACCESSIBILITY_LABELS.actions.loadingSpinner);
      expect(spinner.props.accessibilityHint).toBe('Content is currently loading, please wait');
    });

    it('should use accessible colors', () => {
      const { getByTestId } = render(
        <LoadingSpinner message="Loading hostels" />
      );

      const spinner = getByTestId('loading-spinner');
      const message = getByTestId('loading-message');
      
      expect(message.props.style).toContainEqual(
        expect.objectContaining({ color: ACCESSIBLE_COLORS.primary.main })
      );
    });

    it('should have accessible message text', () => {
      const { getByTestId } = render(
        <LoadingSpinner message="Loading hostels" />
      );

      const message = getByTestId('loading-message');
      
      expect(message.props.accessible).toBe(true);
      expect(message.props.accessibilityRole).toBe('text');
    });
  });

  describe('ErrorBoundary', () => {
    it('should have proper accessibility attributes for error container', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      // Force error state by calling componentDidCatch
      const errorBoundary = getByTestId('error-boundary');
      const instance = errorBoundary._fiber.stateNode;
      
      // Simulate an error
      instance.componentDidCatch(new Error('Test error'), { componentStack: 'Test stack' });
      
      // Re-render to show error state
      const { getByTestId: getByTestIdAfterError } = render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      const errorContainer = getByTestIdAfterError('error-boundary');
      
      expect(errorContainer.props.accessible).toBe(true);
      expect(errorContainer.props.accessibilityRole).toBe('alert');
      expect(errorContainer.props.accessibilityLabel).toBe('Error occurred');
    });

    it('should have proper accessibility attributes for retry button', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      // Force error state
      const errorBoundary = getByTestId('error-boundary');
      const instance = errorBoundary._fiber.stateNode;
      instance.componentDidCatch(new Error('Test error'), { componentStack: 'Test stack' });

      // Re-render to show error state
      const { getByTestId: getByTestIdAfterError } = render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      const retryButton = getByTestIdAfterError('retry-button');
      
      expect(retryButton.props.accessible).toBe(true);
      expect(retryButton.props.accessibilityRole).toBe('button');
      expect(retryButton.props.accessibilityLabel).toBe(ACCESSIBILITY_LABELS.actions.retryButton);
      expect(retryButton.props.accessibilityHint).toBeDefined();
    });

    it('should use accessible colors', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      // Force error state
      const errorBoundary = getByTestId('error-boundary');
      const instance = errorBoundary._fiber.stateNode;
      instance.componentDidCatch(new Error('Test error'), { componentStack: 'Test stack' });

      // Re-render to show error state
      const { getByTestId: getByTestIdAfterError } = render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      const retryButton = getByTestIdAfterError('retry-button');
      
      // Check that the button uses accessible colors
      expect(retryButton.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: ACCESSIBLE_COLORS.primary.main })
      );
    });
  });
});
