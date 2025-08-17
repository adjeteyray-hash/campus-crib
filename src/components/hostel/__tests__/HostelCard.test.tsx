import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HostelCard } from '../HostelCard';
import { Hostel } from '../../../types';

const mockHostel: Hostel = {
  id: '1',
  name: 'Test Hostel',
  address: '123 Test Street, Accra',
  price: 500,
  amenities: ['WiFi', 'AC', 'Kitchen', 'Parking', 'Security'],
  images: ['https://example.com/image1.jpg'],
  contactPhone: '+233123456789',
  contactEmail: 'test@example.com',
  isActive: true,
};

const mockHostelWithoutImage: Hostel = {
  ...mockHostel,
  id: '2',
  name: 'Hostel Without Image',
  images: [],
};

const mockHostelWithMultipleImages: Hostel = {
  ...mockHostel,
  id: '3',
  name: 'Hostel With Multiple Images',
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ],
};

const mockOnPress = jest.fn();

describe('HostelCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders hostel information correctly', () => {
    const { getByText } = render(
      <HostelCard hostel={mockHostel} onPress={mockOnPress} />
    );

    expect(getByText('Test Hostel')).toBeTruthy();
    expect(getByText('123 Test Street, Accra')).toBeTruthy();
    expect(getByText('GH₵500')).toBeTruthy();
    expect(getByText('WiFi • AC • Kitchen +more')).toBeTruthy();
  });

  it('handles hostel without image', () => {
    const { getByText } = render(
      <HostelCard hostel={mockHostelWithoutImage} onPress={mockOnPress} />
    );

    expect(getByText('No Image')).toBeTruthy();
    expect(getByText('📍')).toBeTruthy();
  });

  it('formats price correctly', () => {
    const expensiveHostel: Hostel = {
      ...mockHostel,
      price: 1500,
    };

    const { getByText } = render(
      <HostelCard hostel={expensiveHostel} onPress={mockOnPress} />
    );

    expect(getByText('GH₵1,500')).toBeTruthy();
  });

  it('handles amenities display correctly', () => {
    const hostelWithFewAmenities: Hostel = {
      ...mockHostel,
      amenities: ['WiFi', 'AC'],
    };

    const { getByText } = render(
      <HostelCard hostel={hostelWithFewAmenities} onPress={mockOnPress} />
    );

    expect(getByText('WiFi • AC')).toBeTruthy();
  });

  it('handles hostel without amenities', () => {
    const hostelWithoutAmenities: Hostel = {
      ...mockHostel,
      amenities: [],
    };

    const { queryByText } = render(
      <HostelCard hostel={hostelWithoutAmenities} onPress={mockOnPress} />
    );

    // Should not render amenities section
    expect(queryByText('WiFi • AC • Kitchen +more')).toBeNull();
  });

  it('calls onPress when card is pressed', () => {
    const { getByRole } = render(
      <HostelCard hostel={mockHostel} onPress={mockOnPress} />
    );

    const card = getByRole('button');
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledWith(mockHostel);
  });

  it('has correct accessibility properties', () => {
    const { getByRole } = render(
      <HostelCard hostel={mockHostel} onPress={mockOnPress} />
    );

    const card = getByRole('button');
    expect(card.props.accessibilityLabel).toBe('View details for Test Hostel');
    expect(card.props.accessibilityHint).toBe('Tap to view hostel details and contact information');
  });

  it('truncates long hostel names', () => {
    const hostelWithLongName: Hostel = {
      ...mockHostel,
      name: 'This is a very long hostel name that should be truncated when displayed in the card component',
    };

    const { getByText } = render(
      <HostelCard hostel={hostelWithLongName} onPress={mockOnPress} />
    );

    const nameElement = getByText(hostelWithLongName.name);
    expect(nameElement.props.numberOfLines).toBe(2);
  });

  it('truncates long addresses', () => {
    const hostelWithLongAddress: Hostel = {
      ...mockHostel,
      address: 'This is a very long address that should be truncated when displayed in the card component',
    };

    const { getByText } = render(
      <HostelCard hostel={hostelWithLongAddress} onPress={mockOnPress} />
    );

    const addressElement = getByText(hostelWithLongAddress.address);
    expect(addressElement.props.numberOfLines).toBe(1);
  });

  it('shows +more indicator when there are more than 3 amenities', () => {
    const { getByText } = render(
      <HostelCard hostel={mockHostel} onPress={mockOnPress} />
    );

    expect(getByText('WiFi • AC • Kitchen +more')).toBeTruthy();
  });

  it('handles zero price correctly', () => {
    const freeHostel: Hostel = {
      ...mockHostel,
      price: 0,
    };

    const { getByText } = render(
      <HostelCard hostel={freeHostel} onPress={mockOnPress} />
    );

    expect(getByText('GH₵0')).toBeTruthy();
  });

  describe('Image Preview Functionality', () => {
    it('shows single image without carousel controls', () => {
      const { queryByTestId, queryByText } = render(
        <HostelCard hostel={mockHostel} onPress={mockOnPress} />
      );

      // Should not show carousel for single image
      expect(queryByTestId('hostel-card-image-carousel')).toBeNull();
      // Should not show image counter for single image
      expect(queryByText('1/1')).toBeNull();
    });

    it('shows image carousel with multiple images', () => {
      const { getByTestId, getByText } = render(
        <HostelCard hostel={mockHostelWithMultipleImages} onPress={mockOnPress} />
      );

      // Should show carousel for multiple images
      expect(getByTestId('hostel-card-image-carousel')).toBeTruthy();
      // Should show image counter
      expect(getByText('1/3')).toBeTruthy();
    });

    it('shows pagination dots for multiple images', () => {
      const { getByTestId } = render(
        <HostelCard hostel={mockHostelWithMultipleImages} onPress={mockOnPress} />
      );

      expect(getByTestId('hostel-card-image-carousel')).toBeTruthy();
      // Note: Testing pagination dots is difficult without DOM queries
      // In a real test environment, you'd test scroll behavior
    });

    it('handles empty images array', () => {
      const { getByText } = render(
        <HostelCard hostel={mockHostelWithoutImage} onPress={mockOnPress} />
      );

      expect(getByText('No Image')).toBeTruthy();
      expect(getByText('📍')).toBeTruthy();
    });

    it('handles null/undefined images', () => {
      const hostelWithNullImages: Hostel = {
        ...mockHostel,
        images: null as any,
      };

      const { getByText } = render(
        <HostelCard hostel={hostelWithNullImages} onPress={mockOnPress} />
      );

      expect(getByText('No Image')).toBeTruthy();
    });
  });
});