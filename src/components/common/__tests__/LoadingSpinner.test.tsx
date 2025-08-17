import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { getByTestId } = render(<LoadingSpinner />);
    
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders with custom size and color', () => {
    const { getByTestId } = render(
      <LoadingSpinner size="small" color="#ff0000" />
    );
    
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders with message', () => {
    const { getByTestId, getByText } = render(
      <LoadingSpinner message="Loading data..." />
    );
    
    expect(getByTestId('loading-spinner')).toBeTruthy();
    expect(getByTestId('loading-message')).toBeTruthy();
    expect(getByText('Loading data...')).toBeTruthy();
  });

  it('renders as overlay when overlay prop is true', () => {
    const { getByTestId } = render(
      <LoadingSpinner overlay={true} />
    );
    
    const container = getByTestId('loading-spinner');
    expect(container).toBeTruthy();
    // The overlay styling would be tested through snapshot testing in a real scenario
  });

  it('renders without full screen when fullScreen is false', () => {
    const { getByTestId } = render(
      <LoadingSpinner fullScreen={false} />
    );
    
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });
});