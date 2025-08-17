import { supabase } from './supabase';
import { Review } from '../types/hostel';

export interface CreateReviewData {
  hostelId: string;
  rating: number;
  comment: string;
  profilePictureUrl?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

class ReviewsService {
  /**
   * Get reviews for a specific hostel
   */
  async getHostelReviews(hostelId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('hostel_id', hostelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw new Error('Failed to fetch reviews');
      }

      // Map database columns to interface properties
      const mappedReviews: Review[] = (data || []).map(review => ({
        id: review.id,
        userId: review.user_id,
        userName: review.user_name,
        profilePictureUrl: review.profile_picture_url, // Note: this column doesn't exist yet
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        hostelId: review.hostel_id,
      }));

      return mappedReviews;
    } catch (error) {
      console.error('Error in getHostelReviews:', error);
      throw error;
    }
  }

  /**
   * Create a new review
   */
  async createReview(reviewData: CreateReviewData, userId: string, userName: string, profilePictureUrl?: string): Promise<Review> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          hostel_id: reviewData.hostelId,
          user_id: userId,
          user_name: userName,
          profile_picture_url: profilePictureUrl,
          rating: reviewData.rating,
          comment: reviewData.comment,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating review:', error);
        throw new Error('Failed to create review');
      }

      // Map database columns to interface properties
      return {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        profilePictureUrl: data.profile_picture_url,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.created_at,
        hostelId: data.hostel_id,
      };
    } catch (error) {
      console.error('Error in createReview:', error);
      throw error;
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(reviewId: string, updateData: UpdateReviewData): Promise<Review> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        console.error('Error updating review:', error);
        throw new Error('Failed to update review');
      }

      // Map database columns to interface properties
      return {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        profilePictureUrl: data.profile_picture_url,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.created_at,
        hostelId: data.hostel_id,
      };
    } catch (error) {
      console.error('Error in updateReview:', error);
      throw error;
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        console.error('Error deleting review:', error);
        throw new Error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error in deleteReview:', error);
      throw error;
    }
  }

  /**
   * Check if user has already reviewed a hostel
   */
  async hasUserReviewed(hostelId: string, userId: string): Promise<Review | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('hostel_id', hostelId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking user review:', error);
        throw new Error('Failed to check user review');
      }

      if (!data) return null;

      // Map database columns to interface properties
      return {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        profilePictureUrl: data.profile_picture_url,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.created_at,
        hostelId: data.hostel_id,
      };
    } catch (error) {
      console.error('Error in hasUserReviewed:', error);
      throw error;
    }
  }

  /**
   * Get average rating for a hostel
   */
  async getHostelAverageRating(hostelId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('hostel_id', hostelId);

      if (error) {
        console.error('Error fetching hostel rating:', error);
        throw new Error('Failed to fetch hostel rating');
      }

      if (!data || data.length === 0) {
        return 0;
      }

      const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
      return Math.round((totalRating / data.length) * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      console.error('Error in getHostelAverageRating:', error);
      throw error;
    }
  }
}

export const reviewsService = new ReviewsService();
export default reviewsService;
