import { renderHook, act } from '@testing-library/react-native';
import { useNetworkStatus } from '../useNetworkStatus';

// Mock NetInfo
const mockNetInfo = {
  addEventListener: jest.fn(),
  fetch: jest.fn(),
};

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: mockNetInfo,
}));

describe('useNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockNetInfo.addEventListener.mockReturnValue(() => {});
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      isWifiEnabled: true,
    });
  });

  it('returns initial network status', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.type).toBe('unknown');
  });

  it('updates network status when NetInfo state changes', async () => {
    let listener: (state: any) => void;
    
    mockNetInfo.addEventListener.mockImplementation((callback) => {
      listener = callback;
      return () => {};
    });

    const { result } = renderHook(() => useNetworkStatus());

    // Simulate network state change
    act(() => {
      listener({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        isWifiEnabled: false,
      });
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isInternetReachable).toBe(false);
    expect(result.current.type).toBe('none');
    expect(result.current.isWifiEnabled).toBe(false);
  });

  it('fetches initial network state on mount', async () => {
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'cellular',
      isWifiEnabled: false,
    });

    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus());

    await waitForNextUpdate();

    expect(mockNetInfo.fetch).toHaveBeenCalledTimes(1);
  });

  it('handles null values from NetInfo', () => {
    let listener: (state: any) => void;
    
    mockNetInfo.addEventListener.mockImplementation((callback) => {
      listener = callback;
      return () => {};
    });

    const { result } = renderHook(() => useNetworkStatus());

    // Simulate network state with null values
    act(() => {
      listener({
        isConnected: null,
        isInternetReachable: null,
        type: 'unknown',
        isWifiEnabled: undefined,
      });
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isInternetReachable).toBe(false);
    expect(result.current.type).toBe('unknown');
  });

  it('unsubscribes from NetInfo on unmount', () => {
    const unsubscribe = jest.fn();
    mockNetInfo.addEventListener.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useNetworkStatus());

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});