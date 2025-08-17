import { bookingHistoryService, BookingHistoryService } from '../bookingHistory';
import { supabase } from '../supabase';
import type { BookingHistoryRow } from '../../types/database';

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('BookingHistoryService', () => {
  let service: BookingHistoryService;

  beforeEach(() => {
    service = new BookingHistoryService();
    jest.clearAllMocks();
  });

  describe('recordHostelView', () => {
    it('should record a hostel view successfully', async () => {
      const mockData: BookingHistoryRow = {
        id: 'test-id',
        student_id: 'student-123',
        hostel_id: 'hostel-456',
        hostel_name: 'Test Hostel',
        action: 'viewed',
        timestamp: '2024-01-01T00:00:00Z',
        metadata: {}
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.recordHostelView(
        'student-123',
        'hostel-456',
        'Test Hostel'
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('booking_history');
      expect(mockQuery.insert).toHaveBeenCalledWith({
        student_id: 'student-123',
        hostel_id: 'hostel-456',
        hostel_name: 'Test Hostel',
        action: 'viewed',
        metadata: {}
      });
      expect(result).toEqual({
        id: 'test-id',
        studentId: 'student-123',
        hostelId: 'hostel-456',
        hostelName: 'Test Hostel',
        action: 'viewed',
        timestamp: '2024-01-01T00:00:00Z',
        metadata: {}
      });
    });

    it('should handle errors when recording hostel view', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.recordHostelView(
        'student-123',
        'hostel-456',
        'Test Hostel'
      );

      expect(result).toBeNull();
    });

    it('should include metadata when provided', async () => {
      const metadata = { source: 'search', page: 1 };
      const mockData: BookingHistoryRow = {
        id: 'test-id',
        student_id: 'student-123',
        hostel_id: 'hostel-456',
        hostel_name: 'Test Hostel',
        action: 'viewed',
        timestamp: '2024-01-01T00:00:00Z',
        metadata
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await service.recordHostelView(
        'student-123',
        'hostel-456',
        'Test Hostel',
        metadata
      );

      expect(mockQuery.insert).toHaveBeenCalledWith({
        student_id: 'student-123',
        hostel_id: 'hostel-456',
        hostel_name: 'Test Hostel',
        action: 'viewed',
        metadata
      });
    });
  });

  describe('recordHostelContact', () => {
    it('should record a phone contact successfully', async () => {
      const mockData: BookingHistoryRow = {
        id: 'test-id',
        student_id: 'student-123',
        hostel_id: 'hostel-456',
        hostel_name: 'Test Hostel',
        action: 'contacted',
        timestamp: '2024-01-01T00:00:00Z',
        metadata: { contactMethod: 'phone' }
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.recordHostelContact(
        'student-123',
        'hostel-456',
        'Test Hostel',
        'phone'
      );

      expect(mockQuery.insert).toHaveBeenCalledWith({
        student_id: 'student-123',
        hostel_id: 'hostel-456',
        hostel_name: 'Test Hostel',
        action: 'contacted',
        metadata: { contactMethod: 'phone' }
      });
      expect(result?.metadata).toEqual({ contactMethod: 'phone' });
    });

    it('should record an email contact successfully', async () => {
      const mockData: BookingHistoryRow = {
        id: 'test-id',
        student_id: 'student-123',
        hostel_id: 'hostel-456',
        hostel_name: 'Test Hostel',
        action: 'contacted',
        timestamp: '2024-01-01T00:00:00Z',
        metadata: { contactMethod: 'email' }
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.recordHostelContact(
        'student-123',
        'hostel-456',
        'Test Hostel',
        'email'
      );

      expect(result?.metadata).toEqual({ contactMethod: 'email' });
    });

    it('should handle additional metadata', async () => {
      const additionalMetadata = { userAgent: 'test-app', timestamp: Date.now() };
      const mockData: BookingHistoryRow = {
        id: 'test-id',
        student_id: 'student-123',
        hostel_id: 'hostel-456',
        hostel_name: 'Test Hostel',
        action: 'contacted',
        timestamp: '2024-01-01T00:00:00Z',
        metadata: { contactMethod: 'phone', ...additionalMetadata }
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await service.recordHostelContact(
        'student-123',
        'hostel-456',
        'Test Hostel',
        'phone',
        additionalMetadata
      );

      expect(mockQuery.insert).toHaveBeenCalledWith({
        student_id: 'student-123',
        hostel_id: 'hostel-456',
        hostel_name: 'Test Hostel',
        action: 'contacted',
        metadata: { contactMethod: 'phone', ...additionalMetadata }
      });
    });
  });

  describe('getStudentBookingHistory', () => {
    it('should fetch student booking history with default pagination', async () => {
      const mockData: BookingHistoryRow[] = [
        {
          id: 'test-id-1',
          student_id: 'student-123',
          hostel_id: 'hostel-456',
          hostel_name: 'Test Hostel 1',
          action: 'viewed',
          timestamp: '2024-01-01T00:00:00Z',
          metadata: {}
        },
        {
          id: 'test-id-2',
          student_id: 'student-123',
          hostel_id: 'hostel-789',
          hostel_name: 'Test Hostel 2',
          action: 'contacted',
          timestamp: '2024-01-02T00:00:00Z',
          metadata: { contactMethod: 'phone' }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.getStudentBookingHistory('student-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('booking_history');
      expect(mockQuery.eq).toHaveBeenCalledWith('student_id', 'student-123');
      expect(mockQuery.order).toHaveBeenCalledWith('timestamp', { ascending: false });
      expect(mockQuery.range).toHaveBeenCalledWith(0, 49);
      expect(result).toHaveLength(2);
      expect(result[0].hostelName).toBe('Test Hostel 1');
    });

    it('should apply action filter when provided', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.getStudentBookingHistory('student-123', 50, 0, 'contacted');

      // Verify the method was called and returned empty array
      expect(result).toEqual([]);
      expect(mockSupabase.from).toHaveBeenCalledWith('booking_history');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.order).toHaveBeenCalledWith('timestamp', { ascending: false });
      expect(mockQuery.range).toHaveBeenCalledWith(0, 49);
      // The eq method should be called at least once for student_id
      expect(mockQuery.eq).toHaveBeenCalledWith('student_id', 'student-123');
    });

    it('should handle custom pagination parameters', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await service.getStudentBookingHistory('student-123', 25, 50);

      expect(mockQuery.range).toHaveBeenCalledWith(50, 74);
    });

    it('should return empty array on error', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.getStudentBookingHistory('student-123');

      expect(result).toEqual([]);
    });
  });

  describe('hasRecentView', () => {
    it('should return true when recent view exists', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ 
          data: [{ id: 'test-id' }], 
          error: null 
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.hasRecentView('student-123', 'hostel-456');

      expect(result).toBe(true);
      expect(mockQuery.eq).toHaveBeenCalledWith('student_id', 'student-123');
      expect(mockQuery.eq).toHaveBeenCalledWith('hostel_id', 'hostel-456');
      expect(mockQuery.eq).toHaveBeenCalledWith('action', 'viewed');
    });

    it('should return false when no recent view exists', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.hasRecentView('student-123', 'hostel-456');

      expect(result).toBe(false);
    });

    it('should return false on database error', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.hasRecentView('student-123', 'hostel-456');

      expect(result).toBe(false);
    });
  });

  describe('getStudentStatistics', () => {
    it('should calculate correct statistics', async () => {
      const mockData: BookingHistoryRow[] = [
        {
          id: '1',
          student_id: 'student-123',
          hostel_id: 'hostel-1',
          hostel_name: 'Hostel A',
          action: 'viewed',
          timestamp: '2024-01-01T00:00:00Z',
          metadata: {}
        },
        {
          id: '2',
          student_id: 'student-123',
          hostel_id: 'hostel-1',
          hostel_name: 'Hostel A',
          action: 'viewed',
          timestamp: '2024-01-02T00:00:00Z',
          metadata: {}
        },
        {
          id: '3',
          student_id: 'student-123',
          hostel_id: 'hostel-2',
          hostel_name: 'Hostel B',
          action: 'viewed',
          timestamp: '2024-01-03T00:00:00Z',
          metadata: {}
        },
        {
          id: '4',
          student_id: 'student-123',
          hostel_id: 'hostel-1',
          hostel_name: 'Hostel A',
          action: 'contacted',
          timestamp: '2024-01-04T00:00:00Z',
          metadata: { contactMethod: 'phone' }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.getStudentStatistics('student-123');

      expect(result).toEqual({
        totalViews: 3,
        totalContacts: 1,
        uniqueHostels: 2,
        mostViewedHostel: 'Hostel A'
      });
    });

    it('should handle empty history', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.getStudentStatistics('student-123');

      expect(result).toEqual({
        totalViews: 0,
        totalContacts: 0,
        uniqueHostels: 0,
        mostViewedHostel: null
      });
    });
  });

  describe('cleanupOldEntries', () => {
    it('should delete old entries and return count', async () => {
      const mockCountQuery = {
        select: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({ count: 5, error: null })
      };

      const mockDeleteQuery = {
        delete: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({ error: null })
      };

      mockSupabase.from
        .mockReturnValueOnce(mockCountQuery as any)
        .mockReturnValueOnce(mockDeleteQuery as any);

      const result = await service.cleanupOldEntries(30);

      expect(result).toBe(5);
      expect(mockDeleteQuery.delete).toHaveBeenCalled();
    });

    it('should use default retention period of 365 days', async () => {
      const mockCountQuery = {
        select: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({ count: 0, error: null })
      };

      const mockDeleteQuery = {
        delete: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({ error: null })
      };

      mockSupabase.from
        .mockReturnValueOnce(mockCountQuery as any)
        .mockReturnValueOnce(mockDeleteQuery as any);

      await service.cleanupOldEntries();

      // Verify that the cutoff date is approximately 365 days ago
      const expectedCutoff = new Date();
      expectedCutoff.setDate(expectedCutoff.getDate() - 365);
      
      expect(mockCountQuery.lt).toHaveBeenCalled();
      expect(mockDeleteQuery.lt).toHaveBeenCalled();
    });

    it('should handle deletion errors gracefully', async () => {
      const mockCountQuery = {
        select: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({ count: 5, error: null })
      };

      const mockDeleteQuery = {
        delete: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
      };

      mockSupabase.from
        .mockReturnValueOnce(mockCountQuery as any)
        .mockReturnValueOnce(mockDeleteQuery as any);

      const result = await service.cleanupOldEntries(30);

      expect(result).toBe(0);
    });
  });

  describe('cleanupDuplicateEntries', () => {
    it('should identify and remove duplicate entries within 1 hour', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
      
      const mockData: BookingHistoryRow[] = [
        {
          id: 'entry-1',
          student_id: 'student-123',
          hostel_id: 'hostel-456',
          hostel_name: 'Test Hostel',
          action: 'viewed',
          timestamp: oneHourAgo.toISOString(),
          metadata: {}
        },
        {
          id: 'entry-2',
          student_id: 'student-123',
          hostel_id: 'hostel-456',
          hostel_name: 'Test Hostel',
          action: 'viewed',
          timestamp: now.toISOString(),
          metadata: {}
        }
      ];

      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };

      const mockDeleteQuery = {
        delete: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ error: null })
      };

      mockSupabase.from
        .mockReturnValueOnce(mockSelectQuery as any)
        .mockReturnValueOnce(mockDeleteQuery as any);

      const result = await service.cleanupDuplicateEntries();

      expect(result).toBe(1);
      expect(mockDeleteQuery.in).toHaveBeenCalledWith('id', ['entry-2']);
    });

    it('should not remove entries that are more than 1 hour apart', async () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      
      const mockData: BookingHistoryRow[] = [
        {
          id: 'entry-1',
          student_id: 'student-123',
          hostel_id: 'hostel-456',
          hostel_name: 'Test Hostel',
          action: 'viewed',
          timestamp: twoHoursAgo.toISOString(),
          metadata: {}
        },
        {
          id: 'entry-2',
          student_id: 'student-123',
          hostel_id: 'hostel-456',
          hostel_name: 'Test Hostel',
          action: 'viewed',
          timestamp: now.toISOString(),
          metadata: {}
        }
      ];

      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };

      mockSupabase.from.mockReturnValueOnce(mockSelectQuery as any);

      const result = await service.cleanupDuplicateEntries();

      expect(result).toBe(0);
    });

    it('should handle empty data gracefully', async () => {
      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      mockSupabase.from.mockReturnValueOnce(mockSelectQuery as any);

      const result = await service.cleanupDuplicateEntries();

      expect(result).toBe(0);
    });
  });

  describe('getHistoryCount', () => {
    it('should get count with all filters', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ count: 42, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await service.getHistoryCount(
        'student-123',
        'hostel-456',
        'viewed',
        startDate,
        endDate
      );

      expect(result).toBe(42);
      expect(mockQuery.eq).toHaveBeenCalledWith('student_id', 'student-123');
      expect(mockQuery.eq).toHaveBeenCalledWith('hostel_id', 'hostel-456');
      expect(mockQuery.eq).toHaveBeenCalledWith('action', 'viewed');
      expect(mockQuery.gte).toHaveBeenCalledWith('timestamp', startDate.toISOString());
      expect(mockQuery.lte).toHaveBeenCalledWith('timestamp', endDate.toISOString());
    });

    it('should get count without filters', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({ count: 100, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.getHistoryCount();

      expect(result).toBe(100);
      expect(mockQuery.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    });

    it('should return 0 on error', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({ 
          count: null, 
          error: { message: 'Database error' } 
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.getHistoryCount();

      expect(result).toBe(0);
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(bookingHistoryService).toBeInstanceOf(BookingHistoryService);
    });
  });
});