import { AnalyticsService, analyticsService } from '../analytics';
import { supabase, hostelService } from '../supabase';
import type { BookingHistoryRow, HostelRow } from '../../types/database';

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  hostelService: {
    getHostelsByLandlord: jest.fn(),
    getHostelById: jest.fn(),
  },
  bookingHistoryService: {
    getHostelAnalytics: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockHostelService = hostelService as jest.Mocked<typeof hostelService>;

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    service = new AnalyticsService();
    jest.clearAllMocks();
  });

  describe('getLandlordAnalytics', () => {
    const mockLandlordId = 'landlord-123';
    const mockHostels: HostelRow[] = [
      {
        id: 'hostel-1',
        landlord_id: mockLandlordId,
        name: 'Test Hostel 1',
        description: 'A great hostel',
        address: '123 Test St',
        price: 500,
        amenities: ['wifi', 'parking'],
        images: ['image1.jpg'],
        contact_phone: '123-456-7890',
        contact_email: 'test@example.com',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'hostel-2',
        landlord_id: mockLandlordId,
        name: 'Test Hostel 2',
        description: 'Another great hostel',
        address: '456 Test Ave',
        price: 600,
        amenities: ['wifi', 'gym'],
        images: ['image2.jpg'],
        contact_phone: '098-765-4321',
        contact_email: 'test2@example.com',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    const mockBookingHistory: BookingHistoryRow[] = [
      {
        id: 'history-1',
        student_id: 'student-1',
        hostel_id: 'hostel-1',
        hostel_name: 'Test Hostel 1',
        action: 'viewed',
        timestamp: '2024-01-15T10:00:00Z',
        metadata: null,
      },
      {
        id: 'history-2',
        student_id: 'student-1',
        hostel_id: 'hostel-1',
        hostel_name: 'Test Hostel 1',
        action: 'contacted',
        timestamp: '2024-01-15T11:00:00Z',
        metadata: { contactMethod: 'phone' },
      },
      {
        id: 'history-3',
        student_id: 'student-2',
        hostel_id: 'hostel-2',
        hostel_name: 'Test Hostel 2',
        action: 'viewed',
        timestamp: '2024-01-16T09:00:00Z',
        metadata: null,
      },
    ];

    beforeEach(() => {
      mockHostelService.getHostelsByLandlord.mockResolvedValue(mockHostels);
      mockHostelService.getHostelById.mockImplementation(async (id) => {
        return mockHostels.find(h => h.id === id) || null;
      });

      // Mock Supabase query chain - create a proper chainable mock
      const createMockQuery = (hostelId?: string) => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
        };

        // Override the final method to return a promise
        Object.defineProperty(mockQuery, 'then', {
          value: (resolve: any) => {
            const hostelHistory = hostelId
              ? mockBookingHistory.filter(h => h.hostel_id === hostelId)
              : mockBookingHistory;
            resolve({ data: hostelHistory, error: null });
          }
        });

        return mockQuery;
      };

      mockSupabase.from.mockImplementation(() => {
        const query = createMockQuery();

        // Override eq to capture the hostel_id and return appropriate data
        query.eq.mockImplementation((column, value) => {
          if (column === 'hostel_id') {
            return createMockQuery(value);
          }
          return query;
        });

        return query as any;
      });
    });

    it('should return analytics data for all landlord hostels', async () => {
      const result = await service.getLandlordAnalytics(mockLandlordId);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        hostelId: 'hostel-1',
        hostelName: 'Test Hostel 1',
        totalViews: 1,
        totalContacts: 1,
        conversionRate: 100,
        ranking: 1, // Higher engagement score (1 + 1*2 = 3)
      });
      expect(result[1]).toMatchObject({
        hostelId: 'hostel-2',
        hostelName: 'Test Hostel 2',
        totalViews: 1,
        totalContacts: 0,
        conversionRate: 0,
        ranking: 2, // Lower engagement score (1 + 0*2 = 1)
      });
    });

    it('should return empty array when landlord has no hostels', async () => {
      mockHostelService.getHostelsByLandlord.mockResolvedValue([]);

      const result = await service.getLandlordAnalytics(mockLandlordId);

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      mockHostelService.getHostelsByLandlord.mockRejectedValue(new Error('Database error'));

      await expect(service.getLandlordAnalytics(mockLandlordId)).rejects.toThrow('Failed to fetch analytics data');
    });
  });

  describe('getHostelPerformanceMetrics', () => {
    const mockHostelId = 'hostel-1';
    const mockHostel: HostelRow = {
      id: mockHostelId,
      landlord_id: 'landlord-123',
      name: 'Test Hostel',
      description: 'A great hostel',
      address: '123 Test St',
      price: 500,
      amenities: ['wifi', 'parking'],
      images: ['image1.jpg'],
      contact_phone: '123-456-7890',
      contact_email: 'test@example.com',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const mockBookingHistory: BookingHistoryRow[] = [
      {
        id: 'history-1',
        student_id: 'student-1',
        hostel_id: mockHostelId,
        hostel_name: 'Test Hostel',
        action: 'viewed',
        timestamp: '2024-01-15T10:00:00Z',
        metadata: null,
      },
      {
        id: 'history-2',
        student_id: 'student-1',
        hostel_id: mockHostelId,
        hostel_name: 'Test Hostel',
        action: 'viewed',
        timestamp: '2024-01-16T10:00:00Z',
        metadata: null,
      },
      {
        id: 'history-3',
        student_id: 'student-1',
        hostel_id: mockHostelId,
        hostel_name: 'Test Hostel',
        action: 'contacted',
        timestamp: '2024-01-16T11:00:00Z',
        metadata: { contactMethod: 'phone' },
      },
    ];

    beforeEach(() => {
      mockHostelService.getHostelById.mockResolvedValue(mockHostel);

      // Mock Supabase query chain
      const createMockQuery = (data = mockBookingHistory) => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
        };

        // Make the query thenable to resolve with data
        Object.defineProperty(mockQuery, 'then', {
          value: (resolve: any) => {
            resolve({ data, error: null });
          }
        });

        return mockQuery;
      };

      mockSupabase.from.mockReturnValue(createMockQuery() as any);
    });

    it('should calculate performance metrics correctly', async () => {
      const result = await service.getHostelPerformanceMetrics(mockHostelId);

      expect(result).toMatchObject({
        hostelId: mockHostelId,
        hostelName: 'Test Hostel',
        totalViews: 2,
        totalContacts: 1,
        conversionRate: 50, // 1/2 * 100
        engagementScore: 4, // 2 + 1*2
      });

      expect(result.averageViewsPerDay).toBeGreaterThan(0);
      expect(result.averageContactsPerDay).toBeGreaterThan(0);
      expect(result.trendData).toBeInstanceOf(Array);
    });

    it('should handle zero views correctly', async () => {
      const emptyHistory: BookingHistoryRow[] = [];

      const createMockQuery = () => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
        };

        Object.defineProperty(mockQuery, 'then', {
          value: (resolve: any) => {
            resolve({ data: emptyHistory, error: null });
          }
        });

        return mockQuery;
      };

      mockSupabase.from.mockReturnValue(createMockQuery() as any);

      const result = await service.getHostelPerformanceMetrics(mockHostelId);

      expect(result).toMatchObject({
        totalViews: 0,
        totalContacts: 0,
        conversionRate: 0,
        engagementScore: 0,
      });
    });

    it('should handle database errors', async () => {
      const createMockQuery = () => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
        };

        Object.defineProperty(mockQuery, 'then', {
          value: (resolve: any, reject: any) => {
            reject(new Error('DB Error'));
          }
        });

        return mockQuery;
      };

      mockSupabase.from.mockReturnValue(createMockQuery() as any);

      await expect(service.getHostelPerformanceMetrics(mockHostelId)).rejects.toThrow();
    });
  });

  describe('compareHostelPerformance', () => {
    const mockHostelId = 'hostel-1';
    const currentPeriod = {
      start: new Date('2024-01-15'),
      end: new Date('2024-01-22'),
    };
    const previousPeriod = {
      start: new Date('2024-01-08'),
      end: new Date('2024-01-15'),
    };

    beforeEach(() => {
      // Mock getHostelPerformanceMetrics calls
      jest.spyOn(service, 'getHostelPerformanceMetrics')
        .mockImplementation(async (hostelId, timeRange) => {
          const isCurrent = timeRange?.start.getTime() === currentPeriod.start.getTime();
          return {
            hostelId,
            hostelName: 'Test Hostel',
            totalViews: isCurrent ? 10 : 5,
            totalContacts: isCurrent ? 3 : 1,
            conversionRate: isCurrent ? 30 : 20,
            averageViewsPerDay: isCurrent ? 1.43 : 0.71,
            averageContactsPerDay: isCurrent ? 0.43 : 0.14,
            ranking: 0,
            engagementScore: isCurrent ? 16 : 7,
            trendData: [],
          };
        });
    });

    it('should calculate growth percentages correctly', async () => {
      const result = await service.compareHostelPerformance(
        mockHostelId,
        currentPeriod,
        previousPeriod
      );

      expect(result.growth).toMatchObject({
        views: 100, // (10-5)/5 * 100
        contacts: 200, // (3-1)/1 * 100
        conversionRate: 10, // 30-20
      });
    });

    it('should handle zero previous values', async () => {
      jest.spyOn(service, 'getHostelPerformanceMetrics')
        .mockImplementation(async (hostelId, timeRange) => {
          const isCurrent = timeRange?.start.getTime() === currentPeriod.start.getTime();
          return {
            hostelId,
            hostelName: 'Test Hostel',
            totalViews: isCurrent ? 10 : 0,
            totalContacts: isCurrent ? 3 : 0,
            conversionRate: isCurrent ? 30 : 0,
            averageViewsPerDay: 0,
            averageContactsPerDay: 0,
            ranking: 0,
            engagementScore: 0,
            trendData: [],
          };
        });

      const result = await service.compareHostelPerformance(
        mockHostelId,
        currentPeriod,
        previousPeriod
      );

      expect(result.growth).toMatchObject({
        views: 100, // 100% when previous is 0 but current > 0
        contacts: 100,
        conversionRate: 30,
      });
    });
  });

  describe('getAnalyticsSummary', () => {
    const mockLandlordId = 'landlord-123';

    beforeEach(() => {
      jest.spyOn(service, 'getLandlordAnalytics').mockResolvedValue([
        {
          hostelId: 'hostel-1',
          hostelName: 'Test Hostel 1',
          totalViews: 10,
          totalContacts: 3,
          conversionRate: 30,
          ranking: 1,
          trendData: [],
        },
        {
          hostelId: 'hostel-2',
          hostelName: 'Test Hostel 2',
          totalViews: 5,
          totalContacts: 1,
          conversionRate: 20,
          ranking: 2,
          trendData: [],
        },
      ]);

      jest.spyOn(service, 'getHostelPerformanceMetrics')
        .mockImplementation(async (hostelId) => ({
          hostelId,
          hostelName: hostelId === 'hostel-1' ? 'Test Hostel 1' : 'Test Hostel 2',
          totalViews: hostelId === 'hostel-1' ? 10 : 5,
          totalContacts: hostelId === 'hostel-1' ? 3 : 1,
          conversionRate: hostelId === 'hostel-1' ? 30 : 20,
          averageViewsPerDay: 1,
          averageContactsPerDay: 0.5,
          ranking: hostelId === 'hostel-1' ? 1 : 2,
          engagementScore: hostelId === 'hostel-1' ? 16 : 7,
          trendData: [],
        }));
    });

    it('should calculate summary statistics correctly', async () => {
      const result = await service.getAnalyticsSummary(mockLandlordId);

      expect(result).toMatchObject({
        totalHostels: 2,
        totalViews: 15, // 10 + 5
        totalContacts: 4, // 3 + 1
        averageConversionRate: 25, // (30 + 20) / 2
      });

      expect(result.topPerformingHostel).toMatchObject({
        hostelId: 'hostel-1',
        ranking: 1,
      });

      expect(result.worstPerformingHostel).toMatchObject({
        hostelId: 'hostel-2',
        ranking: 2,
      });
    });

    it('should handle empty analytics', async () => {
      jest.spyOn(service, 'getLandlordAnalytics').mockResolvedValue([]);

      const result = await service.getAnalyticsSummary(mockLandlordId);

      expect(result).toMatchObject({
        totalHostels: 0,
        totalViews: 0,
        totalContacts: 0,
        averageConversionRate: 0,
        topPerformingHostel: null,
        worstPerformingHostel: null,
      });
    });

    it('should handle single hostel case', async () => {
      jest.spyOn(service, 'getLandlordAnalytics').mockResolvedValue([
        {
          hostelId: 'hostel-1',
          hostelName: 'Test Hostel 1',
          totalViews: 10,
          totalContacts: 3,
          conversionRate: 30,
          ranking: 1,
          trendData: [],
        },
      ]);

      const result = await service.getAnalyticsSummary(mockLandlordId);

      expect(result.totalHostels).toBe(1);
      expect(result.topPerformingHostel).toBeTruthy();
      expect(result.worstPerformingHostel).toBeNull(); // Should be null for single hostel
    });
  });

  describe('getTimeRangePresets', () => {
    it('should return correct time range presets', () => {
      const presets = AnalyticsService.getTimeRangePresets();

      expect(presets).toHaveProperty('today');
      expect(presets).toHaveProperty('week');
      expect(presets).toHaveProperty('month');
      expect(presets).toHaveProperty('quarter');
      expect(presets).toHaveProperty('year');

      // Check that all presets have start and end dates
      Object.values(presets).forEach(preset => {
        expect(preset).toHaveProperty('start');
        expect(preset).toHaveProperty('end');
        expect(preset.start).toBeInstanceOf(Date);
        expect(preset.end).toBeInstanceOf(Date);
        expect(preset.start.getTime()).toBeLessThanOrEqual(preset.end.getTime());
      });
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(analyticsService).toBeInstanceOf(AnalyticsService);
    });
  });
});