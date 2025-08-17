// Database service tests
import { supabase, profileService, hostelService, bookingHistoryService } from '../supabase';
import { userService, hostelManagementService, analyticsService } from '../database';

// Mock Supabase client
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
    storage: {
      from: jest.fn(),
    },
  },
  profileService: {
    getProfile: jest.fn(),
    createProfile: jest.fn(),
    updateProfile: jest.fn(),
    deleteProfile: jest.fn(),
  },
  hostelService: {
    getHostelsByLandlord: jest.fn(),
    getHostelById: jest.fn(),
    createHostel: jest.fn(),
    updateHostel: jest.fn(),
    deleteHostel: jest.fn(),
    toggleHostelStatus: jest.fn(),
  },
  bookingHistoryService: {
    getStudentHistory: jest.fn(),
    getHostelAnalytics: jest.fn(),
    recordBookingAction: jest.fn(),
    getAnalyticsForLandlord: jest.fn(),
  },
}));

describe('Database Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('userService', () => {
    it('should get current user with profile', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student' as const,
        name: 'Test User',
        phone: '+233123456789',
        created_at: '2025-01-09T00:00:00Z',
        updated_at: '2025-01-09T00:00:00Z',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });
      (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

      const result = await userService.getCurrentUser();

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
        name: 'Test User',
        phone: '+233123456789',
        created_at: '2025-01-09T00:00:00Z',
        updated_at: '2025-01-09T00:00:00Z',
      });
    });

    it('should create user profile', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student' as const,
        name: 'Test User',
        phone: null,
        created_at: '2025-01-09T00:00:00Z',
        updated_at: '2025-01-09T00:00:00Z',
      };

      (profileService.createProfile as jest.Mock).mockResolvedValue(mockProfile);

      const result = await userService.createUserProfile(
        'user-123',
        'test@example.com',
        'student',
        'Test User'
      );

      expect(profileService.createProfile).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
        name: 'Test User',
        phone: undefined,
      });

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
        name: 'Test User',
        phone: undefined,
        created_at: '2025-01-09T00:00:00Z',
        updated_at: '2025-01-09T00:00:00Z',
      });
    });
  });

  describe('hostelManagementService', () => {
    it('should get landlord hostels', async () => {
      const mockHostels = [
        {
          id: 'hostel-123',
          landlord_id: 'landlord-123',
          name: 'Test Hostel',
          description: 'A test hostel',
          address: '123 Test Street',
          price: 500,
          amenities: ['WiFi', 'Kitchen'],
          images: ['image1.jpg'],
          contact_phone: '+233123456789',
          contact_email: 'test@example.com',
          is_active: true,
          created_at: '2025-01-09T00:00:00Z',
          updated_at: '2025-01-09T00:00:00Z',
        },
      ];

      (hostelService.getHostelsByLandlord as jest.Mock).mockResolvedValue(mockHostels);

      const result = await hostelManagementService.getLandlordHostels('landlord-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'hostel-123',
        name: 'Test Hostel',
        description: 'A test hostel',
        address: '123 Test Street',
        price: 500,
        amenities: ['WiFi', 'Kitchen'],
        images: ['image1.jpg'],
        contactPhone: '+233123456789',
        contactEmail: 'test@example.com',
        isActive: true,
        landlordId: 'landlord-123',
        created_at: '2025-01-09T00:00:00Z',
        updated_at: '2025-01-09T00:00:00Z',
      });
    });

    it('should create hostel', async () => {
      const mockHostel = {
        id: 'hostel-123',
        landlord_id: 'landlord-123',
        name: 'New Hostel',
        description: 'A new hostel',
        address: '456 New Street',
        price: 600,
        amenities: ['WiFi'],
        images: [],
        contact_phone: '+233987654321',
        contact_email: 'new@example.com',
        is_active: true,
        created_at: '2025-01-09T00:00:00Z',
        updated_at: '2025-01-09T00:00:00Z',
      };

      (hostelService.createHostel as jest.Mock).mockResolvedValue(mockHostel);

      const hostelData = {
        name: 'New Hostel',
        description: 'A new hostel',
        address: '456 New Street',
        price: 600,
        amenities: ['WiFi'],
        images: [],
        contactPhone: '+233987654321',
        contactEmail: 'new@example.com',
        isActive: true,
      };

      const result = await hostelManagementService.createHostel('landlord-123', hostelData);

      expect(hostelService.createHostel).toHaveBeenCalledWith({
        landlord_id: 'landlord-123',
        name: 'New Hostel',
        description: 'A new hostel',
        address: '456 New Street',
        price: 600,
        amenities: ['WiFi'],
        images: [],
        contact_phone: '+233987654321',
        contact_email: 'new@example.com',
        is_active: true,
      });

      expect(result?.name).toBe('New Hostel');
    });
  });

  describe('analyticsService', () => {
    it('should record hostel view', async () => {
      const mockBookingHistory = {
        id: 'booking-123',
        student_id: 'student-123',
        hostel_id: 'hostel-123',
        hostel_name: 'Test Hostel',
        action: 'viewed' as const,
        timestamp: '2025-01-09T00:00:00Z',
        metadata: null,
      };

      (bookingHistoryService.recordBookingAction as jest.Mock).mockResolvedValue(mockBookingHistory);

      const result = await analyticsService.recordHostelView(
        'student-123',
        'hostel-123',
        'Test Hostel'
      );

      expect(bookingHistoryService.recordBookingAction).toHaveBeenCalledWith({
        student_id: 'student-123',
        hostel_id: 'hostel-123',
        hostel_name: 'Test Hostel',
        action: 'viewed',
      });

      expect(result).toBe(true);
    });

    it('should record hostel contact', async () => {
      const mockBookingHistory = {
        id: 'booking-123',
        student_id: 'student-123',
        hostel_id: 'hostel-123',
        hostel_name: 'Test Hostel',
        action: 'contacted' as const,
        timestamp: '2025-01-09T00:00:00Z',
        metadata: { contactMethod: 'phone' },
      };

      (bookingHistoryService.recordBookingAction as jest.Mock).mockResolvedValue(mockBookingHistory);

      const result = await analyticsService.recordHostelContact(
        'student-123',
        'hostel-123',
        'Test Hostel',
        'phone'
      );

      expect(bookingHistoryService.recordBookingAction).toHaveBeenCalledWith({
        student_id: 'student-123',
        hostel_id: 'hostel-123',
        hostel_name: 'Test Hostel',
        action: 'contacted',
        metadata: { contactMethod: 'phone' },
      });

      expect(result).toBe(true);
    });

    it('should get student booking history', async () => {
      const mockHistory = [
        {
          id: 'booking-123',
          student_id: 'student-123',
          hostel_id: 'hostel-123',
          hostel_name: 'Test Hostel',
          action: 'viewed' as const,
          timestamp: '2025-01-09T00:00:00Z',
          metadata: null,
        },
      ];

      (bookingHistoryService.getStudentHistory as jest.Mock).mockResolvedValue(mockHistory);

      const result = await analyticsService.getStudentBookingHistory('student-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'booking-123',
        studentId: 'student-123',
        hostelId: 'hostel-123',
        hostelName: 'Test Hostel',
        action: 'viewed',
        timestamp: '2025-01-09T00:00:00Z',
        metadata: undefined,
      });
    });
  });
});

// Integration test helpers
export const testHelpers = {
  async createTestProfile(role: 'student' | 'landlord' = 'student') {
    return {
      id: `test-${role}-${Date.now()}`,
      email: `test-${role}@example.com`,
      role,
      name: `Test ${role}`,
      phone: '+233123456789',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  async createTestHostel(landlordId: string) {
    return {
      id: `test-hostel-${Date.now()}`,
      landlord_id: landlordId,
      name: 'Test Hostel',
      description: 'A test hostel for development',
      address: '123 Test Street, Cape Coast',
      price: 500,
      amenities: ['WiFi', 'Kitchen', 'Security'],
      images: [],
      contact_phone: '+233123456789',
      contact_email: 'test@example.com',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  async createTestBookingHistory(studentId: string, hostelId: string) {
    return {
      id: `test-booking-${Date.now()}`,
      student_id: studentId,
      hostel_id: hostelId,
      hostel_name: 'Test Hostel',
      action: 'viewed' as const,
      timestamp: new Date().toISOString(),
      metadata: null,
    };
  },
};