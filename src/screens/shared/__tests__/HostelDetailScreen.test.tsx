import { Alert, Linking } from 'react-native';
import { HostelDetailScreen } from '../HostelDetailScreen';
import { legacyHostelAPIService } from '../../../services';
import { BookingHistoryService } from '../../../services/bookingHistory';
import { useAuth } from '../../../hooks/useAuth';
import { HostelDetail } from '../../../types';
import { StudentNavigationProp } from '../../../types/navigation';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';

// Mock the services
jest.mock('../../../services', () => ({
  legacyHostelAPIService: {
    getHostelDetail: jest.fn(),
  },
}));

jest.mock('../../../services/bookingHistory', () => ({
  BookingHistoryService: jest.fn().mockImplementation(() => ({
    recordHostelView: jest.fn(),
    recordHostelContact: jest.fn(),
    hasRecentView: jest.fn(),
  })),
}));

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useFocusEffect: jest.fn(),
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
}));

const mockNavigation: StudentNavigationProp<'HostelDetail'> = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as any;

const mockRoute = {
  params: { hostelId: 'test-hostel-id' },
} as any;

const mockHostelDetail: HostelDetail = {
  id: 'test-hostel-id',
  name: 'Test Hostel',
  description: 'A test hostel for testing purposes',
  address: '123 Test Street, Test City',
  price: 500,
  amenities: ['WiFi', 'Kitchen', 'Laundry'],
  images: ['https://example.com/image1.jpg'],
  isActive: true,
  landlord: {
    id: 'landlord-id',
    name: 'Test Landlord',
    email: 'test@example.com',
    phone: '+233123456789',
  },
  contactEmail: 'test@example.com',
  contactPhone: '+233123456789',
  viewCount: 10,
  contactCount: 5,
};

describe('HostelDetailScreen', () => {
  let mockLinking: any;
  let mockBookingHistoryService: any;

  beforeEach(() => {
    mockLinking = {
      canOpenURL: jest.fn(),
      openURL: jest.fn(),
    };
    (Linking.canOpenURL as jest.Mock) = mockLinking.canOpenURL;
    (Linking.openURL as jest.Mock) = mockLinking.openURL;
    
    mockBookingHistoryService = new BookingHistoryService();
    (mockBookingHistoryService.recordHostelView as jest.Mock).mockResolvedValue(true);
    (mockBookingHistoryService.recordHostelContact as jest.Mock).mockResolvedValue(true);
    (mockBookingHistoryService.hasRecentView as jest.Mock).mockResolvedValue(false);
  });

  it('renders loading state initially', () => {
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockHostelDetail), 100))
    );

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'student-id', role: 'student' },
    });

    render(<HostelDetailScreen navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders hostel details correctly', async () => {
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockResolvedValue(mockHostelDetail);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'student-id', role: 'student' },
    });

    render(<HostelDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      expect(screen.getByText('Test Hostel')).toBeTruthy();
      expect(screen.getByText('A test hostel for testing purposes')).toBeTruthy();
      expect(screen.getByText('123 Test Street, Test City')).toBeTruthy();
      expect(screen.getByText('$500/month')).toBeTruthy();
    });
  });

  it('renders amenities correctly', async () => {
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockResolvedValue(mockHostelDetail);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'student-id', role: 'student' },
    });

    render(<HostelDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      expect(screen.getByText('WiFi')).toBeTruthy();
      expect(screen.getByText('Kitchen')).toBeTruthy();
      expect(screen.getByText('Laundry')).toBeTruthy();
    });
  });

  it('renders landlord information', async () => {
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockResolvedValue(mockHostelDetail);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'student-id', role: 'student' },
    });

    render(<HostelDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      expect(screen.getByText('Test Landlord')).toBeTruthy();
      expect(screen.getByText('test@example.com')).toBeTruthy();
      expect(screen.getByText('+233123456789')).toBeTruthy();
    });
  });

  it('shows contact buttons for students', async () => {
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockResolvedValue(mockHostelDetail);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'student-id', role: 'student' },
    });

    render(<HostelDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      expect(screen.getByText('Call Landlord')).toBeTruthy();
      expect(screen.getByText('Email Landlord')).toBeTruthy();
    });
  });

  it('hides contact buttons for landlords', async () => {
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockResolvedValue(mockHostelDetail);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'landlord-id', role: 'landlord' },
    });

    render(<HostelDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      expect(screen.queryByText('Call Landlord')).toBeNull();
      expect(screen.queryByText('Email Landlord')).toBeNull();
    });
  });

  it('handles phone call correctly', async () => {
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockResolvedValue(mockHostelDetail);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'student-id', role: 'student' },
    });

    mockLinking.canOpenURL.mockResolvedValue(true);
    mockLinking.openURL.mockResolvedValue(true);

    render(<HostelDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      const callButton = screen.getByText('Call Landlord');
      fireEvent.press(callButton);
    });

    expect(mockLinking.canOpenURL).toHaveBeenCalledWith('tel:+233123456789');
    expect(mockLinking.openURL).toHaveBeenCalledWith('tel:+233123456789');
    expect(mockBookingHistoryService.recordHostelContact).toHaveBeenCalledWith(
      'student-id',
      'test-hostel-id',
      'Test Hostel',
      'phone'
    );
  });

  it('handles email contact correctly', async () => {
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockResolvedValue(mockHostelDetail);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'student-id', role: 'student' },
    });

    render(<HostelDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      const emailButton = screen.getByText('Email Landlord');
      fireEvent.press(emailButton);
    });

    expect(Linking.canOpenURL).toHaveBeenCalledWith('mailto:test@example.com?subject=Inquiry about Test Hostel');
    expect(Linking.openURL).toHaveBeenCalledWith('mailto:test@example.com?subject=Inquiry about Test Hostel');
    expect(mockBookingHistoryService.recordHostelContact).toHaveBeenCalledWith(
      'student-id',
      'test-hostel-id',
      'Test Hostel',
      'email'
    );
  });

  it('records view in booking history for students', async () => {
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockResolvedValue(mockHostelDetail);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'student-id', role: 'student' },
    });

    render(<HostelDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      expect(mockBookingHistoryService.hasRecentView).toHaveBeenCalledWith(
        'student-id',
        'test-hostel-id'
      );
      expect(mockBookingHistoryService.recordHostelView).toHaveBeenCalledWith(
        'student-id',
        'test-hostel-id',
        'Test Hostel'
      );
    });
  });

  it('does not record duplicate views within 24 hours', async () => {
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockResolvedValue(mockHostelDetail);
    (mockBookingHistoryService.hasRecentView as jest.Mock).mockResolvedValue(true);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'student-id', role: 'student' },
    });

    render(<HostelDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      expect(mockBookingHistoryService.hasRecentView).toHaveBeenCalledWith(
        'student-id',
        'test-hostel-id'
      );
      expect(mockBookingHistoryService.recordHostelView).not.toHaveBeenCalled();
    });
  });

  it('does not record views for landlords', async () => {
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockResolvedValue(mockHostelDetail);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'landlord-id', role: 'landlord' },
    });

    render(<HostelDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      expect(mockBookingHistoryService.recordHostelView).not.toHaveBeenCalled();
      expect(mockBookingHistoryService.hasRecentView).not.toHaveBeenCalled();
    });
  });

  it('handles API error gracefully', async () => {
    const errorMessage = 'Failed to load hostel';
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockRejectedValue(new Error(errorMessage));

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'student-id', role: 'student' },
    });

    const { getByText } = render(
      <HostelDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    await waitFor(() => {
      expect(getByText('Error loading hostel details')).toBeTruthy();
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  it('handles hostel without contact information', async () => {
    const hostelWithoutContact: HostelDetail = {
      ...mockHostelDetail,
      contactPhone: undefined,
      contactEmail: undefined,
    };
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockResolvedValue(hostelWithoutContact);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'student-id', role: 'student' },
    });

    const { getByText } = render(
      <HostelDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    await waitFor(() => {
      expect(getByText('Contact information not available')).toBeTruthy();
    });
  });

  it('handles phone call failure', async () => {
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockResolvedValue(mockHostelDetail);
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'student-id', role: 'student' },
    });

    render(<HostelDetailScreen navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      const callButton = screen.getByText('Call Landlord');
      fireEvent.press(callButton);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Phone Call Unavailable',
      'Phone calls are not supported on this device.',
      [{ text: 'OK', style: 'default' }]
    );
  });

  it('handles email failure', async () => {
    (legacyHostelAPIService.getHostelDetail as jest.Mock).mockResolvedValue(mockHostelDetail);
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'student-id', role: 'student' },
    });

    render(<HostelDetailScreen navigation={mockNavigation} route={mockRoute} />);

    expect(screen.queryByText('Email Landlord')).toBeNull();
  });
});