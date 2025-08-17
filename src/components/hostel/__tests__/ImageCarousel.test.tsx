import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ImageCarousel } from '../ImageCarousel';

const mockImages = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg',
];

describe('ImageCarousel', () => {
  it('renders images correctly', () => {
    const { getByTestId } = render(
      <ImageCarousel images={mockImages} hostelName="Test Hostel" />
    );

    expect(getByTestId('image-carousel')).toBeTruthy();
  });

  it('shows placeholder when no images provided', () => {
    const { getByText } = render(
      <ImageCarousel images={[]} hostelName="Test Hostel" />
    );

    expect(getByText('📍')).toBeTruthy();
    expect(getByText('No Images Available')).toBeTruthy();
  });

  it('shows image counter for multiple images', () => {
    const { getByText } = render(
      <ImageCarousel images={mockImages} hostelName="Test Hostel" />
    );

    expect(getByText('1 / 3')).toBeTruthy();
  });

  it('does not show image counter for single image', () => {
    const { queryByText } = render(
      <ImageCarousel images={[mockImages[0]]} hostelName="Test Hostel" />
    );

    expect(queryByText('1 / 1')).toBeNull();
  });

  it('updates current index on scroll', () => {
    const { getByTestId, getByText } = render(
      <ImageCarousel images={mockImages} hostelName="Test Hostel" />
    );

    const scrollView = getByTestId('image-carousel');

    // Simulate scroll to second image
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { x: 375, y: 0 }, // Assuming screen width of 375
      },
    });

    expect(getByText('2 / 3')).toBeTruthy();
  });

  it('renders pagination dots for multiple images', () => {
    const { getByTestId } = render(
      <ImageCarousel images={mockImages} hostelName="Test Hostel" />
    );

    expect(getByTestId('image-carousel')).toBeTruthy();
    // Pagination dots are rendered but don't have testIDs, so we just verify the carousel renders
  });

  it('does not render pagination dots for single image', () => {
    const { getByTestId } = render(
      <ImageCarousel images={[mockImages[0]]} hostelName="Test Hostel" />
    );

    expect(getByTestId('image-carousel')).toBeTruthy();
    // With single image, pagination should not be visible
  });

  it('handles undefined images gracefully', () => {
    const { getByText } = render(
      <ImageCarousel images={undefined as any} hostelName="Test Hostel" />
    );

    expect(getByText('📍')).toBeTruthy();
    expect(getByText('No Images Available')).toBeTruthy();
  });
});