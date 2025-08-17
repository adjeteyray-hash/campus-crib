import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ReviewCard } from '../ReviewCard';
import { Review } from '../../../types/hostel';

const mockReview: Review = {
  id: '1',
  userId: 'user1',
  userName: 'John Doe',
  rating: 4,
  comment: 'Great place to stay!',
  createdAt: '2024-01-15T10:00:00Z',
  hostelId: 'hostel1',
};

const mockReviewWithProfilePicture: Review = {
  ...mockReview,
  profilePictureUrl: 'https://example.com/profile.jpg',
};

describe('ReviewCard', () => {
  it('renders review information correctly', () => {
    render(<ReviewCard review={mockReview} />);
    
    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('Great place to stay!')).toBeTruthy();
    expect(screen.getByText('15 days ago')).toBeTruthy();
  });

  it('shows own review badge when isOwnReview is true', () => {
    render(<ReviewCard review={mockReview} isOwnReview={true} />);
    
    expect(screen.getByText('John Doe (You)')).toBeTruthy();
  });

  it('does not show own review badge when isOwnReview is false', () => {
    render(<ReviewCard review={mockReview} isOwnReview={false} />);
    
    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.queryByText('(You)')).toBeFalsy();
  });

  it('renders correct number of stars based on rating', () => {
    render(<ReviewCard review={mockReview} />);
    
    // Should render 4 filled stars and 1 outline star for rating 4
    const filledStars = screen.getAllByTestId('star');
    const outlineStars = screen.getAllByTestId('star-outline');
    
    expect(filledStars).toHaveLength(4);
    expect(outlineStars).toHaveLength(1);
  });

  it('shows profile picture when available', () => {
    render(<ReviewCard review={mockReviewWithProfilePicture} />);
    
    const profileImage = screen.getByTestId('profile-image');
    expect(profileImage).toBeTruthy();
    expect(profileImage.props.source.uri).toBe('https://example.com/profile.jpg');
  });

  it('shows initials when no profile picture is available', () => {
    render(<ReviewCard review={mockReview} />);
    
    expect(screen.getByText('JD')).toBeTruthy(); // John Doe initials
  });

  it('generates correct initials for different name formats', () => {
    const singleNameReview = { ...mockReview, userName: 'Alice' };
    render(<ReviewCard review={singleNameReview} />);
    
    expect(screen.getByText('A')).toBeTruthy(); // Single name initial
  });

  it('handles undefined userName gracefully', () => {
    const invalidReview = { ...mockReview, userName: undefined };
    render(<ReviewCard review={invalidReview} />);
    
    expect(screen.getByText('Anonymous User')).toBeTruthy();
    expect(screen.getByText('??')).toBeTruthy(); // Fallback initials
  });

  it('handles undefined createdAt gracefully', () => {
    const invalidReview = { ...mockReview, createdAt: undefined };
    render(<ReviewCard review={invalidReview} />);
    
    expect(screen.getByText('Recently')).toBeTruthy();
  });

  it('handles invalid rating gracefully', () => {
    const invalidReview = { ...mockReview, rating: 0 };
    render(<ReviewCard review={invalidReview} />);
    
    // Should show 0 filled stars
    const filledStars = screen.getAllByTestId('star');
    const outlineStars = screen.getAllByTestId('star-outline');
    
    expect(filledStars).toHaveLength(0);
    expect(outlineStars).toHaveLength(5);
  });
});
