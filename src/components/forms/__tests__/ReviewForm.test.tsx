import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ReviewForm } from '../ReviewForm';
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

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  hostelId: 'hostel1',
  userId: 'user1',
  userName: 'John Doe',
};

describe('ReviewForm', () => {
  it('renders form when visible is true', () => {
    render(<ReviewForm {...defaultProps} />);
    
    expect(screen.getByText('Write a Review')).toBeTruthy();
    expect(screen.getByText('Rating')).toBeTruthy();
    expect(screen.getByText('Comment')).toBeTruthy();
    expect(screen.getByText('Submit Review')).toBeTruthy();
  });

  it('shows edit title when existing review is provided', () => {
    render(<ReviewForm {...defaultProps} existingReview={mockReview} />);
    
    expect(screen.getByText('Edit Review')).toBeTruthy();
    expect(screen.getByText('Update Review')).toBeTruthy();
  });

  it('populates form with existing review data', () => {
    render(<ReviewForm {...defaultProps} existingReview={mockReview} />);
    
    const commentInput = screen.getByPlaceholderText('Share your experience with this hostel...');
    expect(commentInput.props.value).toBe('Great place to stay!');
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    render(<ReviewForm {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('shows delete button when editing existing review', () => {
    render(<ReviewForm {...defaultProps} existingReview={mockReview} />);
    
    expect(screen.getByText('Delete Review')).toBeTruthy();
  });

  it('does not show delete button for new reviews', () => {
    render(<ReviewForm {...defaultProps} />);
    
    expect(screen.queryByText('Delete Review')).toBeFalsy();
  });
});
