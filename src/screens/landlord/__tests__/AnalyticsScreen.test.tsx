import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Share, Alert } from 'react-native';
import { AnalyticsScreen } from '../AnalyticsScreen';
import { useAuth } from '../../../hooks/useAuth';
import { analyticsService } from '../../../services/analytics';
import type { AnalyticsData } from '../../../types/hostel';

// Mock dependencies
jest.mock('../../../services/supabase', () => ({
  supabase: {},
  hostelService: {},
  bookingHistoryService: {},
  profileService: {},
}));
jest.mock('../../../hooks/useAuth');
jest.mock('../../../services/analytics', () => ({
  analyticsService: {
    getLandlordAnalytics: jest.fn(),
  },
  AnalyticsService: {
    getTimeRangePresets: jest.fn(() => ({
      week: {
        start: new Date('2024-01-08'),
        end: new Date('2024-01-15'),
      },
      month: {
        start: new Date('2023-12-15'),
        end: new Date('2024-01-15'),
      },
      quarter: {
        start: new Date('2023-10-15'),
        end: new Date('2024-01-15'),
      },
    })),
  },
}));
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
  PieChart: 'PieChart',
}));

// Mock Share and Alert
jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
jest.spyOn(Alert, 'alert');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>;

describe('AnalyticsScreen', () => {
  const mockUser = {
    id: 'landlord-123',
    email: 'landlord@example.com',
    role: 'landlord' as const,
    name: 'Test Landlord',
  };

  const mockAnalyticsData: AnalyticsData[] = [
    {
      hostelId: 'hostel-1',
      hostelName: 'Test Hostel 1',
      totalViews: 100,
      totalContacts: 25,
      conversionRate: 25,
      ranking: 1,
      trendData: [
        { date: '2024-01-15', views: 10, contacts: 2 },
        { date: '2024-01-16', views: 15, contacts: 3 },
        { date: '2024-01-17', views: 12, contacts: 4 },
      ],
    },
    {
      hostelId: 'hostel-2',
      hostelName: 'Test Hostel 2',
      totalViews: 80,
      totalContacts: 16,
      conversionRate: 20,
      ranking: 2,
      trendData: [
        { date: '2024-01-15', views: 8, contacts: 1 },
        { date: '2024-01-16', views: 12, contacts: 2 },
        { date: '2024-01-17', views: 10, contacts: 3 },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      isAuthenticated: true,
      isStudent: false,
      isLandlord: true,
      userRole: 'landlord',
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
      clearError: jest.fn(),
      hasRole: jest.fn(),
      getUserDisplayName: jest.fn(),
      isCurrentUser: jest.fn(),
    });
    mockAnalyticsService.getLandlordAnalytics.mockResolvedValue(mockAnalyticsData);
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching data', async () => {
      mockAnalyticsService.getLandlordAnalytics.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockAnalyticsData), 100))
      );

      render(<AnalyticsScreen />);

      expect(screen.getByTestId('loading-spinner')).toBeTruthy();
      expect(screen.getByText('Loading analytics...')).toBeTruthy();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).toBeNull();
      });
    });
  });

  describe('Data Display', () => {
    it('should display analytics data correctly', async () => {
      render(<AnalyticsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeTruthy();
      });

      // Check summary cards
      expect(screen.getByText('180')).toBeTruthy(); // Total views (100 + 80)
      expect(screen.getByText('41')).toBeTruthy(); // Total contacts (25 + 16)
      expect(screen.getByText('22.5%')).toBeTruthy(); // Average conversion rate

      // Check hostel rankings
      expect(screen.getByText('#1')).toBeTruthy();
      expect(screen.getByText('Test Hostel 1')).toBeTruthy();
      expect(screen.getByText('100 views')).toBeTruthy();
      expect(screen.getByText('25 contacts')).toBeTruthy();
      expect(screen.getByText('25% conversion')).toBeTruthy();

      expect(screen.getByText('#2')).toBeTruthy();
      expect(screen.getByText('Test Hostel 2')).toBeTruthy();
      expect(screen.getByText('80 views')).toBeTruthy();
      expect(screen.getByText('16 contacts')).toBeTruthy();
      expect(screen.getByText('20% conversion')).toBeTruthy();
    });

    it('should display chart components', async () => {
      render(<AnalyticsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Views by Hostel')).toBeTruthy();
        expect(screen.getByText('Contacts by Hostel')).toBeTruthy();
        expect(screen.getByText('Conversion Rates')).toBeTruthy();
        expect(screen.getByText('Trend Analysis')).toBeTruthy();
      });
    });
  });

  describe('Time Period Selection', () => {
    it('should display time period selector with default selection', async () => {
      render(<AnalyticsScreen />);

      await waitFor(() => {
        expect(screen.getByText('7 Days')).toBeTruthy();
        expect(screen.getByText('30 Days')).toBeTruthy();
        expect(screen.getByText('90 Days')).toBeTruthy();
      });
    });

    it('should change time period when button is pressed', async () => {
      render(<AnalyticsScreen />);

      await waitFor(() => {
        expect(screen.getByText('7 Days')).toBeTruthy();
      });

      // Clear previous calls
      mockAnalyticsService.getLandlordAnalytics.mockClear();

      // Press 7 Days button
      fireEvent.press(screen.getByText('7 Days'));

      await waitFor(() => {
        expect(mockAnalyticsService.getLandlordAnalytics).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            start: expect.any(Date),
            end: expect.any(Date),
          })
        );
      });
    });
  });

  describe('Export Functionality', () => {
    it('should export analytics report when export button is pressed', async () => {
      render(<AnalyticsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Export'));

      await waitFor(() => {
        expect(Share.share).toHaveBeenCalledWith({
          message: expect.stringContaining('CampusCrib Analytics Report'),
          title: 'CampusCrib Analytics Report',
        });
      });

      // Verify report content
      const shareCall = (Share.share as jest.Mock).mock.calls[0][0];
      expect(shareCall.message).toContain('Total Hostels: 2');
      expect(shareCall.message).toContain('Total Views: 180');
      expect(shareCall.message).toContain('Total Contacts: 41');
      expect(shareCall.message).toContain('Test Hostel 1 - 100 views, 25 contacts');
    });

    it('should handle export errors gracefully', async () => {
      (Share.share as jest.Mock).mockRejectedValueOnce(new Error('Share failed'));

      render(<AnalyticsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Export'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Export Error',
          'Failed to export analytics report.'
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when analytics loading fails', async () => {
      mockAnalyticsService.getLandlordAnalytics.mockRejectedValue(
        new Error('Failed to fetch analytics')
      );

      render(<AnalyticsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load analytics data. Please try again.')).toBeTruthy();
        expect(screen.getByText('Retry')).toBeTruthy();
      });
    });

    it('should retry loading analytics when retry button is pressed', async () => {
      mockAnalyticsService.getLandlordAnalytics
        .mockRejectedValueOnce(new Error('Failed to fetch analytics'))
        .mockResolvedValueOnce(mockAnalyticsData);

      render(<AnalyticsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeTruthy();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no analytics data is available', async () => {
      mockAnalyticsService.getLandlordAnalytics.mockResolvedValue([]);

      render(<AnalyticsScreen />);

      await waitFor(() => {
        expect(screen.getByText('No Analytics Data')).toBeTruthy();
        expect(screen.getByText("You don't have any hostels yet or no activity has been recorded.")).toBeTruthy();
        expect(screen.getByText('Add some hostels to start seeing analytics data.')).toBeTruthy();
      });
    });
  });

  describe('Pull to Refresh', () => {
    it('should refresh analytics data when pulled down', async () => {
      render(<AnalyticsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeTruthy();
      });

      // Clear previous calls
      mockAnalyticsService.getLandlordAnalytics.mockClear();

      // Find the ScrollView and trigger refresh
      const scrollView = screen.getByTestId('analytics-scroll-view') || screen.root;

      // Simulate pull to refresh
      fireEvent(scrollView, 'refresh');

      await waitFor(() => {
        expect(mockAnalyticsService.getLandlordAnalytics).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('User Authentication', () => {
    it('should not load analytics when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        isStudent: false,
        isLandlord: false,
        userRole: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        refreshUser: jest.fn(),
        clearError: jest.fn(),
        hasRole: jest.fn(),
        getUserDisplayName: jest.fn(),
        isCurrentUser: jest.fn(),
      });

      render(<AnalyticsScreen />);

      // Should not call analytics service without user
      expect(mockAnalyticsService.getLandlordAnalytics).not.toHaveBeenCalled();
    });

    it('should load analytics when user becomes authenticated', async () => {
      const { rerender } = render(<AnalyticsScreen />);

      // Initially no user
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        isStudent: false,
        isLandlord: false,
        userRole: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        refreshUser: jest.fn(),
        clearError: jest.fn(),
        hasRole: jest.fn(),
        getUserDisplayName: jest.fn(),
        isCurrentUser: jest.fn(),
      });

      rerender(<AnalyticsScreen />);

      expect(mockAnalyticsService.getLandlordAnalytics).not.toHaveBeenCalled();

      // User becomes authenticated
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
        isAuthenticated: true,
        isStudent: false,
        isLandlord: true,
        userRole: 'landlord',
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        refreshUser: jest.fn(),
        clearError: jest.fn(),
        hasRole: jest.fn(),
        getUserDisplayName: jest.fn(),
        isCurrentUser: jest.fn(),
      });

      rerender(<AnalyticsScreen />);

      await waitFor(() => {
        expect(mockAnalyticsService.getLandlordAnalytics).toHaveBeenCalledWith(
          mockUser.id,
          expect.any(Object)
        );
      });
    });
  });

  describe('Chart Data Processing', () => {
    it('should handle long hostel names in charts', async () => {
      const longNameData: AnalyticsData[] = [
        {
          hostelId: 'hostel-1',
          hostelName: 'This is a very long hostel name that should be truncated',
          totalViews: 100,
          totalContacts: 25,
          conversionRate: 25,
          ranking: 1,
          trendData: [],
        },
      ];

      mockAnalyticsService.getLandlordAnalytics.mockResolvedValue(longNameData);

      render(<AnalyticsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeTruthy();
      });

      // The component should handle long names gracefully
      // (specific truncation behavior would be tested in chart component tests)
    });

    it('should handle empty trend data gracefully', async () => {
      const noTrendData: AnalyticsData[] = [
        {
          hostelId: 'hostel-1',
          hostelName: 'Test Hostel',
          totalViews: 100,
          totalContacts: 25,
          conversionRate: 25,
          ranking: 1,
          trendData: [],
        },
      ];

      mockAnalyticsService.getLandlordAnalytics.mockResolvedValue(noTrendData);

      render(<AnalyticsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeTruthy();
      });

      // Should not crash with empty trend data
      expect(screen.getByText('Views by Hostel')).toBeTruthy();
      expect(screen.getByText('Contacts by Hostel')).toBeTruthy();
    });
  });
});