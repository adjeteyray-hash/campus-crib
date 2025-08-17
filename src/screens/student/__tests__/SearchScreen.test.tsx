import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { SearchScreen } from '../SearchScreen';
import { legacyHostelAPIService } from '../../../services';
import { HostelSearchResult } from '../../../types';

// Mock the services
jest.mock('../../../services', () => ({
  legacyHostelAPIService: {
    searchHostels: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
} as any;

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockSearchResults: HostelSearchResult[] = [
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
    relevanceScore: 0.9,
  },
  {
    id: '2',
    name: 'Test Hostel 2',
    address: '456 Test Avenue',
    price: 750,
    amenities: ['WiFi', 'Kitchen'],
    images: [],
    contactPhone: '+233987654321',
    contactEmail: 'test2@example.com',
    isActive: true,
    relevanceScore: 0.8,
  },
];

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders search input correctly', () => {
    const { getByTestId, getByPlaceholderText } = render(
      <SearchScreen navigation={mockNavigation} />
    );

    expect(getByTestId('search-input')).toBeTruthy();
    expect(getByPlaceholderText('Search hostels...')).toBeTruthy();
  });

  it('performs search with debouncing', async () => {
    (legacyHostelAPIService.searchHostels as jest.Mock).mockResolvedValue(mockSearchResults);

    const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);
    const searchInput = getByTestId('search-input');

    // Type in search input
    fireEvent.changeText(searchInput, 'test hostel');

    // Fast forward debounce timer
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(legacyHostelAPIService.searchHostels).toHaveBeenCalledWith('test hostel');
    });
  });

  it('displays search results correctly', async () => {
    (legacyHostelAPIService.searchHostels as jest.Mock).mockResolvedValue(mockSearchResults);

    const { getByTestId, getByText } = render(<SearchScreen navigation={mockNavigation} />);
    const searchInput = getByTestId('search-input');

    fireEvent.changeText(searchInput, 'test');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(getByText('Test Hostel 1')).toBeTruthy();
      expect(getByText('Test Hostel 2')).toBeTruthy();
      expect(getByText('2 results found')).toBeTruthy();
    });

    expect(getByTestId('search-results-list')).toBeTruthy();
  });

  it('handles search errors gracefully', async () => {
    const errorMessage = 'Search failed';
    (legacyHostelAPIService.searchHostels as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { getByTestId, getByText } = render(<SearchScreen navigation={mockNavigation} />);
    const searchInput = getByTestId('search-input');

    fireEvent.changeText(searchInput, 'test');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(getByText('Search Failed')).toBeTruthy();
      expect(getByText(errorMessage)).toBeTruthy();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Search Error',
      errorMessage,
      expect.any(Array)
    );
  });

  it('shows empty state when no results found', async () => {
    (legacyHostelAPIService.searchHostels as jest.Mock).mockResolvedValue([]);

    const { getByTestId, getByText } = render(<SearchScreen navigation={mockNavigation} />);
    const searchInput = getByTestId('search-input');

    fireEvent.changeText(searchInput, 'nonexistent');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(getByText('No Results Found')).toBeTruthy();
      expect(getByText('Try searching with different keywords or check your spelling.')).toBeTruthy();
    });
  });

  it('loads and displays search history', async () => {
    const mockHistory = ['previous search', 'another search'];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockHistory));

    const { getByText } = render(<SearchScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Recent Searches')).toBeTruthy();
      expect(getByText('previous search')).toBeTruthy();
      expect(getByText('another search')).toBeTruthy();
    });
  });

  it('handles history item press', async () => {
    const mockHistory = ['test search'];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockHistory));
    (legacyHostelAPIService.searchHostels as jest.Mock).mockResolvedValue(mockSearchResults);

    const { getByText } = render(<SearchScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('test search')).toBeTruthy();
    });

    fireEvent.press(getByText('test search'));

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(legacyHostelAPIService.searchHostels).toHaveBeenCalledWith('test search');
    });
  });

  it('clears search history', async () => {
    const mockHistory = ['search 1', 'search 2'];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockHistory));

    const { getByText, queryByText } = render(<SearchScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Recent Searches')).toBeTruthy();
      expect(getByText('search 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Clear'));

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('search_history');
    
    // The UI update happens immediately after the press
    await waitFor(() => {
      expect(queryByText('search 1')).toBeNull();
    }, { timeout: 1000 });
  });

  it('navigates to hostel detail when result is pressed', async () => {
    (legacyHostelAPIService.searchHostels as jest.Mock).mockResolvedValue(mockSearchResults);

    const { getByTestId, getByText } = render(<SearchScreen navigation={mockNavigation} />);
    const searchInput = getByTestId('search-input');

    fireEvent.changeText(searchInput, 'test');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(getByText('Test Hostel 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Test Hostel 1'));

    expect(mockNavigate).toHaveBeenCalledWith('HostelDetail', { hostelId: '1' });
  });

  it('saves search queries to history', async () => {
    (legacyHostelAPIService.searchHostels as jest.Mock).mockResolvedValue(mockSearchResults);

    const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);
    const searchInput = getByTestId('search-input');

    fireEvent.changeText(searchInput, 'test query');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'search_history',
        JSON.stringify(['test query'])
      );
    });
  });

  it('handles submit editing on search input', async () => {
    (legacyHostelAPIService.searchHostels as jest.Mock).mockResolvedValue(mockSearchResults);

    const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);
    const searchInput = getByTestId('search-input');

    fireEvent.changeText(searchInput, 'test');
    fireEvent(searchInput, 'submitEditing');

    await waitFor(() => {
      expect(legacyHostelAPIService.searchHostels).toHaveBeenCalledWith('test');
    });
  });

  it('does not search with empty query', async () => {
    const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);
    const searchInput = getByTestId('search-input');

    fireEvent.changeText(searchInput, '   '); // Only whitespace

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(legacyHostelAPIService.searchHostels).not.toHaveBeenCalled();
  });

  it('shows loading state during search', async () => {
    (legacyHostelAPIService.searchHostels as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockSearchResults), 1000))
    );

    const { getByTestId, getByTestId: getByTestIdSecond } = render(
      <SearchScreen navigation={mockNavigation} />
    );
    const searchInput = getByTestId('search-input');

    fireEvent.changeText(searchInput, 'test');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should show loading spinner
    expect(getByTestIdSecond('loading-spinner')).toBeTruthy();
  });

  it('displays correct result count', async () => {
    (legacyHostelAPIService.searchHostels as jest.Mock).mockResolvedValue([mockSearchResults[0]]);

    const { getByTestId, getByText } = render(<SearchScreen navigation={mockNavigation} />);
    const searchInput = getByTestId('search-input');

    fireEvent.changeText(searchInput, 'test');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(getByText('1 result found')).toBeTruthy();
    });
  });
});