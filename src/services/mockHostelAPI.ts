import { Hostel, HostelDetail, HostelSearchResult, HostelFilters } from '../types';

/**
 * Mock Hostel API Service for development and testing
 * Provides realistic hostel data when external APIs are unavailable
 */
class MockHostelAPIService {
  private mockHostels: Hostel[] = [
    {
      id: '1',
      name: 'UCC Campus Lodge',
      description: 'Modern hostel facility located near the University of Cape Coast campus with excellent amenities. Features spacious rooms, high-speed WiFi, and 24/7 security.',
      address: 'University Road, Cape Coast, Ghana',
      price: 800,
      amenities: ['WiFi', 'Air Conditioning', 'Study Room', 'Laundry', 'Security', 'Kitchen', 'Common Room'],
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'
      ],
      contactPhone: '+233 24 123 4567',
      contactEmail: 'info@uccampuslodge.com',
      isActive: true,
      location: { latitude: 5.1065, longitude: -1.2834 },
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      name: 'Atlantic View Hostel',
      description: 'Comfortable accommodation with ocean views and modern facilities for students. Located in a quiet neighborhood with easy access to campus.',
      address: 'Pedu Junction, Cape Coast, Ghana',
      price: 650,
      amenities: ['WiFi', 'Kitchen', 'Common Room', 'Parking', 'Security', 'Garden', 'Balcony'],
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop'
      ],
      contactPhone: '+233 20 987 6543',
      contactEmail: 'contact@atlanticview.com',
      isActive: true,
      location: { latitude: 5.1158, longitude: -1.2797 },
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-18T16:45:00Z'
    },
    {
      id: '3',
      name: 'Golden Gate Residence',
      description: 'Premium student accommodation with state-of-the-art facilities and 24/7 security. Features modern amenities and a vibrant community atmosphere.',
      address: 'Adisadel, Cape Coast, Ghana',
      price: 1200,
      amenities: ['WiFi', 'Air Conditioning', 'Gym', 'Study Room', 'Laundry', 'Security', 'Restaurant', 'Swimming Pool'],
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
      ],
      contactPhone: '+233 24 555 0123',
      contactEmail: 'info@goldengate.com',
      isActive: true,
      location: { latitude: 5.1203, longitude: -1.2901 },
      created_at: '2024-01-05T08:00:00Z',
      updated_at: '2024-01-22T11:20:00Z'
    },
    {
      id: '4',
      name: 'Coastal Breeze Hostel',
      description: 'Affordable and comfortable hostel with easy access to campus and the city center. Perfect for budget-conscious students.',
      address: 'Amamoma, Cape Coast, Ghana',
      price: 450,
      amenities: ['WiFi', 'Kitchen', 'Common Room', 'Security', 'Garden'],
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop'
      ],
      contactPhone: '+233 20 444 7890',
      contactEmail: 'info@coastalbreeze.com',
      isActive: true,
      location: { latitude: 5.0987, longitude: -1.2756 },
      created_at: '2024-01-12T12:00:00Z',
      updated_at: '2024-01-19T13:15:00Z'
    },
    {
      id: '5',
      name: 'Scholar\'s Haven',
      description: 'Quiet and conducive environment for serious students with excellent study facilities. Features a library and dedicated study areas.',
      address: 'Kwaprow, Cape Coast, Ghana',
      price: 750,
      amenities: ['WiFi', 'Study Room', 'Library', 'Laundry', 'Security', 'Cafeteria', 'Quiet Zone'],
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'
      ],
      contactPhone: '+233 24 333 2468',
      contactEmail: 'info@scholarshaven.com',
      isActive: true,
      location: { latitude: 5.1134, longitude: -1.2689 },
      created_at: '2024-01-08T07:00:00Z',
      updated_at: '2024-01-21T15:30:00Z'
    },
    {
      id: '6',
      name: 'Ocean View Student Residences',
      description: 'Modern student accommodation with stunning ocean views. Features contemporary design and premium amenities.',
      address: 'Victoria Road, Cape Coast, Ghana',
      price: 950,
      amenities: ['WiFi', 'Air Conditioning', 'Ocean View', 'Study Room', 'Laundry', 'Security', 'Rooftop Terrace'],
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'
      ],
      contactPhone: '+233 24 777 8888',
      contactEmail: 'info@oceanview.com',
      isActive: true,
      location: { latitude: 5.1256, longitude: -1.2854 },
      created_at: '2024-01-03T06:00:00Z',
      updated_at: '2024-01-17T10:45:00Z'
    },
    {
      id: '7',
      name: 'Campus Corner Hostel',
      description: 'Conveniently located hostel right next to the university campus. Perfect for students who want to minimize commute time.',
      address: 'Campus Junction, Cape Coast, Ghana',
      price: 600,
      amenities: ['WiFi', 'Kitchen', 'Common Room', 'Security', 'Study Area', 'Bicycle Storage'],
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop'
      ],
      contactPhone: '+233 20 666 9999',
      contactEmail: 'info@campuscorner.com',
      isActive: true,
      location: { latitude: 5.1089, longitude: -1.2812 },
      created_at: '2024-01-14T11:00:00Z',
      updated_at: '2024-01-23T09:20:00Z'
    },
    {
      id: '8',
      name: 'Green Valley Student Lodge',
      description: 'Eco-friendly student accommodation surrounded by nature. Features sustainable design and peaceful environment.',
      address: 'Green Valley, Cape Coast, Ghana',
      price: 700,
      amenities: ['WiFi', 'Garden', 'Study Room', 'Laundry', 'Security', 'Recycling', 'Bicycle Paths'],
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop'
      ],
      contactPhone: '+233 24 222 3333',
      contactEmail: 'info@greenvalley.com',
      isActive: true,
      location: { latitude: 5.1178, longitude: -1.2723 },
      created_at: '2024-01-06T13:00:00Z',
      updated_at: '2024-01-16T14:10:00Z'
    }
  ];

  /**
   * Simulate API delay for realistic testing
   */
  private async simulateDelay(min = 100, max = 500): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Get all hostels with pagination
   */
  async getHostels(page = 1, limit = 20): Promise<{ hostels: Hostel[]; total: number; hasMore: boolean }> {
    await this.simulateDelay();
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHostels = this.mockHostels.slice(startIndex, endIndex);
    
    return {
      hostels: paginatedHostels,
      total: this.mockHostels.length,
      hasMore: endIndex < this.mockHostels.length
    };
  }

  /**
   * Get hostel details by ID
   */
  async getHostelDetail(id: string): Promise<HostelDetail> {
    await this.simulateDelay();
    
    const hostel = this.mockHostels.find(h => h.id === id);
    if (!hostel) {
      throw new Error('Hostel not found');
    }

    // Transform to HostelDetail with mock landlord and analytics data
    const hostelDetail: HostelDetail = {
      ...hostel,
      landlord: {
        id: `landlord_${id}`,
        name: this.getMockLandlordName(id),
        phone: hostel.contactPhone,
        email: hostel.contactEmail,
      },
      viewCount: Math.floor(Math.random() * 500) + 50,
      contactCount: Math.floor(Math.random() * 50) + 5,
    };

    return hostelDetail;
  }

  /**
   * Search hostels with filters
   */
  async searchHostels(
    query: string,
    filters: HostelFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ hostels: HostelSearchResult[]; total: number; hasMore: boolean }> {
    await this.simulateDelay(200, 800);
    
    let filteredHostels = this.mockHostels.filter(hostel => {
      // Text search
      const queryLower = query.toLowerCase();
      const matchesQuery = 
        hostel.name.toLowerCase().includes(queryLower) ||
        hostel.description?.toLowerCase().includes(queryLower) ||
        hostel.address.toLowerCase().includes(queryLower) ||
        hostel.amenities.some(amenity => amenity.toLowerCase().includes(queryLower));

      if (!matchesQuery) return false;

      // Price filters
      if (filters.minPrice && hostel.price < filters.minPrice) return false;
      if (filters.maxPrice && hostel.price > filters.maxPrice) return false;

      // Location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        if (!hostel.address.toLowerCase().includes(locationLower)) return false;
      }

      // Amenities filter
      if (filters.amenities && filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity =>
          hostel.amenities.some(hostelAmenity =>
            hostelAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });

    // Apply sorting
    if (filters.sortBy) {
      filteredHostels.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'created_at':
            aValue = new Date(a.created_at || '');
            bValue = new Date(b.created_at || '');
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }

    // Convert to search results with mock relevance scores and distances
    const searchResults: HostelSearchResult[] = filteredHostels.map(hostel => ({
      ...hostel,
      relevanceScore: Math.random() * 100,
      distance: Math.random() * 10, // Mock distance in km
    }));

    // Sort by relevance score if no specific sorting
    if (!filters.sortBy) {
      searchResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = searchResults.slice(startIndex, endIndex);

    return {
      hostels: paginatedResults,
      total: filteredHostels.length,
      hasMore: endIndex < filteredHostels.length
    };
  }

  /**
   * Get mock landlord name based on hostel ID
   */
  private getMockLandlordName(hostelId: string): string {
    const landlordNames = [
      'John Doe',
      'Sarah Johnson',
      'Michael Chen',
      'Emily Rodriguez',
      'David Thompson',
      'Lisa Wang',
      'Robert Brown',
      'Maria Garcia'
    ];
    
    const index = parseInt(hostelId) % landlordNames.length;
    return landlordNames[index];
  }

  /**
   * Get API status (always active for mock service)
   */
  getAPIStatus(): { primary: boolean; fallbacks: Array<{ name: string; status: string }> } {
    return {
      primary: true,
      fallbacks: [
        { name: 'Mock API', status: 'active' }
      ]
    };
  }

  /**
   * Clear cache (no-op for mock service)
   */
  async clearCache(): Promise<void> {
    // No cache to clear in mock service
  }

  /**
   * Get cache stats (no-op for mock service)
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: 0,
      entries: []
    };
  }
}

// Export singleton instance
export const mockHostelAPIService = new MockHostelAPIService();

// Export the class for testing purposes
export { MockHostelAPIService };
