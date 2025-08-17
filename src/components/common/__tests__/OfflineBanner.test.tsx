import React from 'react';
import { render } from '@testing-library/react-native';
import { OfflineBanner } from '../OfflineBanner';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';

// Mock the useNetworkStatus hook
jest.mock('../../../hooks/useNetworkStatus', () => ({
  useNetworkStatus: jest.fn(),
}));

const mockUseNetworkStatus = useNetworkStatus as jest.MockedFunction<typeof useNetworkStatus>;

describe('OfflineBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when connected', () => {
    mockUseNetworkStatus.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });

    const { queryByTestId } = render(<OfflineBanner />);
    
    expect(queryByTestId('offline-banner')).toBeNull();
  });

  it('renders when disconnected', () => {
    mockUseNetworkStatus.mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    });

    const { getByTestId, getByText } = render(<OfflineBanner />);
    
    expect(getByTestId('offline-banner')).toBeTruthy();
    expect(getByText('No internet connection. Some features may not work properly.')).toBeTruthy();
  });

  it('does not render when showWhenOffline is false', () => {
    mockUseNetworkStatus.mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    });

    const { queryByTestId } = render(<OfflineBanner showWhenOffline={false} />);
    
    expect(queryByTestId('offline-banner')).toBeNull();
  });
});