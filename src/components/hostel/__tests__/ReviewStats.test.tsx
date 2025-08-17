import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ReviewStats } from '../ReviewStats';
import { Review } from '../../../types/hostel';

const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    rating: 5,
    comment: 'Great place!',
    createdAt: '2024-01-15T10:00:00Z',
    hostelId: 'hostel1',
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Jane Smith',
    rating: 4,
    comment: 'Good place!',
    createdAt: '2024-01-14T10:00:00Z',
    hostelId: 'hostel1',
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Bob Johnson',
    rating: 3,
    comment: 'Okay place!',
    createdAt: '2024-01-13T10:00:00Z',
    hostelId: 'hostel1',
  },
];

describe('ReviewStats', () => {
  it('renders review statistics correctly', () => {
    render(<ReviewStats reviews={mockReviews} />);
    
    expect(screen.getByText('Rating Distribution')).toBeTruthy();
    expect(screen.getByText('3 total reviews')).toBeTruthy();
    expect(screen.getByText('4.0')).toBeTruthy(); // Average rating
    expect(screen.getByText('/5')).toBeTruthy();
  });

  it('shows correct rating breakdown', () => {
    render(<ReviewStats reviews={mockReviews} />);
    
    expect(screen.getByText('5 stars (1)')).toBeTruthy();
    expect(screen.getByText('4 stars (1)')).toBeTruthy();
    expect(screen.getByText('3 stars (1)')).toBeTruthy();
    expect(screen.getByText('2 stars (0)')).toBeTruthy();
    expect(screen.getByText('1 star (0)')).toBeTruthy();
  });

  it('shows correct percentages', () => {
    render(<ReviewStats reviews={mockReviews} />);
    
    expect(screen.getByText('33%')).toBeTruthy(); // 1/3 = 33%
    expect(screen.getByText('33%')).toBeTruthy(); // 1/3 = 33%
    expect(screen.getByText('33%')).toBeTruthy(); // 1/3 = 33%
  });

  it('handles empty reviews gracefully', () => {
    render(<ReviewStats reviews={[]} />);
    
    // Should not render anything when there are no reviews
    expect(screen.queryByText('Rating Distribution')).toBeFalsy();
  });

  it('calculates average rating correctly', () => {
    const reviewsWithDifferentRatings: Review[] = [
      { ...mockReviews[0], rating: 5 },
      { ...mockReviews[1], rating: 5 },
      { ...mockReviews[2], rating: 1 },
    ];
    
    render(<ReviewStats reviews={reviewsWithDifferentRatings} />);
    
    // (5 + 5 + 1) / 3 = 3.67, rounded to 3.7
    expect(screen.getByText('3.7')).toBeTruthy();
  });
});
