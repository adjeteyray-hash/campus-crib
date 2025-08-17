import { reviewsService } from '../reviews';
import { supabase } from '../supabase';

// Mock supabase
jest.mock('../supabase');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('ReviewsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHostelReviews', () => {
    it('fetches reviews for a hostel successfully', async () => {
      const mockReviews = [
        {
          id: '1',
          hostel_id: 'hostel1',
          user_id: 'user1',
          user_name: 'John Doe',
          rating: 5,
          comment: 'Great place!',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockReviews,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await reviewsService.getHostelReviews('hostel1');

      expect(result).toEqual(mockReviews);
      expect(mockSupabase.from).toHaveBeenCalledWith('reviews');
    });

    it('handles errors when fetching reviews', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      } as any);

      await expect(reviewsService.getHostelReviews('hostel1')).rejects.toThrow('Failed to fetch reviews');
    });
  });

  describe('createReview', () => {
    it('creates a new review successfully', async () => {
      const mockReview = {
        id: '1',
        hostel_id: 'hostel1',
        user_id: 'user1',
        user_name: 'John Doe',
        rating: 5,
        comment: 'Great place!',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockReview,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await reviewsService.createReview(
        { hostelId: 'hostel1', rating: 5, comment: 'Great place!' },
        'user1',
        'John Doe'
      );

      expect(result).toEqual(mockReview);
      expect(mockSupabase.from).toHaveBeenCalledWith('reviews');
    });
  });

  describe('hasUserReviewed', () => {
    it('returns review when user has already reviewed', async () => {
      const mockReview = {
        id: '1',
        hostel_id: 'hostel1',
        user_id: 'user1',
        user_name: 'John Doe',
        rating: 5,
        comment: 'Great place!',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockReview,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await reviewsService.hasUserReviewed('hostel1', 'user1');

      expect(result).toEqual(mockReview);
    });

    it('returns null when user has not reviewed', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      } as any);

      const result = await reviewsService.hasUserReviewed('hostel1', 'user1');

      expect(result).toBeNull();
    });
  });
});
