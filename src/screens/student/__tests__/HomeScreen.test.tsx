import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { HomeScreen } from '../HomeScreen';
import { hostelService } from '../../../services';
import { Hostel } from '../../../types';

// Mock the services
jest.mock('../../../services', () => ({
  hostelService: {
    getHostels: jest.fn(),
  },
}));

// Mock custom hooks
jest.mock('../../../hooks/useErrorHandler', () => ({
  useErrorHandler: jest.fn(() => ({
    error: null,
    isRetrying: false,
    retryCount: 0,
    canRetry: false,
    handleError: jest.fn(),
    retry: jest.fn(),
    dismiss: jest.fn(),
    executeRecoveryAction: jest.fn(),
  })),
}));

jest.mock('../../../hooks/useLoadingState', () => ({
  useLoadingState: jest.fn(() => ({
    loadingStates: {},
    setLoading: jest.fn(),
    isLoading: jest.fn(() => false),
    isAnyLoading: jest.fn(() => false),
    withLoading: jest.fn((key, operation) => operation()),
    reset: jest.fn(),
  })),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
} as any;

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock useFocusEffect
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

const mockHostels: Hostel[] = [
  {
    id: '1',
    name: 'Test Hostel 1',
    address: '123 Test Street',
    price: 500,
    amenities: ['WiFi', 'AC'],
    images: ['https://example.com/image1.jpg'],
    contactPhone: '+233123456789',
    contactEmail: 'test1@example.com',
    isActive: true,
  },
  {
    id: '2',
    name: 'Test Hostel 2',
    address: '456 Test Avenue',
    price: 750,
    amenities: ['WiFi', 'Kitchen', 'Parking'],
    images: [],
    contactPhone: '+233987654321',
    contactEmail: 'test2@example.com',
    isActive: true,
  },
];

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    (hostelService.getHostels as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockHostels), 100))
    );

    const { getByTestId } = render(<HomeScreen navigation={mockNavigation} />);
    
    // Should show loading spinner initially
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders hostels list after successful API call', async () => {
    (hostelService.getHostels as jest.Mock).mockResolvedValue(mockHostels);

    const { getByText, getByTestId } = render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Available Hostels')).toBeTruthy();
      expect(getByText('2 hostels found')).toBeTruthy();
      expect(getByText('Test Hostel 1')).toBeTruthy();
      expect(getByText('Test Hostel 2')).toBeTruthy();
    });

    expect(getByTestId('hostels-list')).toBeTruthy();
  });

  it('handles API error gracefully', async () => {
    const errorMessage = 'Network error';
    (hostelService.getHostels as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Unable to Load Hostels')).toBeTruthy();
      expect(getByText(errorMessage)).toBeTruthy();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error Loading Hostels',
      errorMessage,
      expect.any(Array)
    );
  });

  it('handles pull-to-refresh', async () => {
    (hostelService.getHostels as jest.Mock).mockResolvedValue(mockHostels);

    const { getByTestId } = render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByTestId('hostels-list')).toBeTruthy();
    });

    // Simulate pull-to-refresh
    const flatList = getByTestId('hostels-list');
    
    await act(async () => {
      fireEvent(flatList, 'refresh');
    });

    await waitFor(() => {
      expect(hostelService.getHostels).toHaveBeenCalledWith(1, 20);
    });
  });

  it('handles load more functionality', async () => {
    (hostelService.getHostels as jest.Mock)
      .mockResolvedValueOnce(mockHostels)
      .mockResolvedValueOnce([
        {
          id: '3',
          name: 'Test Hostel 3',
          address: '789 Test Road',
          price: 600,
          amenities: ['WiFi'],
          images: [],
          contactPhone: '+233111222333',
          contactEmail: 'test3@example.com',
          isActive: true,
        },
      ]);

    const { getByTestId } = render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByTestId('hostels-list')).toBeTruthy();
    });

    // Simulate reaching end of list
    const flatList = getByTestId('hostels-list');
    
    await act(async () => {
      fireEvent(flatList, 'endReached');
    });

    await waitFor(() => {
      expect(hostelService.getHostels).toHaveBeenCalledWith(2, 20);
    });
  });

  it('navigates to hostel detail when card is pressed', async () => {
    (hostelService.getHostels as jest.Mock).mockResolvedValue(mockHostels);

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Test Hostel 1')).toBeTruthy();
    });

    // Press on the first hostel card
    fireEvent.press(getByText('Test Hostel 1'));

    expect(mockNavigate).toHaveBeenCalledWith('HostelDetail', { hostelId: '1' });
  });

  it('shows empty state when no hostels are returned', async () => {
    (hostelService.getHostels as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('No Hostels Found')).toBeTruthy();
      expect(getByText('We couldn\'t find any hostels at the moment. Pull down to refresh.')).toBeTruthy();
    });
  });

  it('displays correct hostel count in header', async () => {
    (hostelService.getHostels as jest.Mock).mockResolvedValue(mockHostels);

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('2 hostels found')).toBeTruthy();
    });
  });

  it('handles singular hostel count correctly', async () => {
    (hostelService.getHostels as jest.Mock).mockResolvedValue([mockHostels[0]]);

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('1 hostel found')).toBeTruthy();
    });
  });
});